import { getCurrentUser } from "@/app/action";
import RouteConfig from "@/constrants/RouteConfig";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { Loader2, Sparkles, TrendingUp } from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import React, { Suspense } from "react";
import FollowButton from "./FollowButton";
import UserAvatar from "./UserAvatar";
import UserTooltip from "./UserTooltip";

function TrendsSidebar() {
  return (
    <div className="sticky top-[5.25rem] hidden h-fit w-72 flex-none space-y-5 md:block lg:w-80">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  );
}

export default TrendsSidebar;

async function WhoToFollow() {
  const user = await getCurrentUser();
  if (!user) return null;
  const usersToFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: user.userId,
      },
      followers: {
        none: {
          followerId: user.userId,
        },
      },
    },
    select: getUserDataSelect(user.userId),
    take: 5,
  });

  if (usersToFollow.length === 0) return null;

  return (
    <div className="space-y-4 rounded-2xl bg-card p-5 shadow-sm border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-bold">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Who to follow</span>
        </div>
        <Link
          href={RouteConfig.protectedRoute.FIND_FRIENDS}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="space-y-3.5">
        {usersToFollow.map((u) => {
          const profileUrl = RouteConfig.protectedRoute.PROFILE.replace(
            ":username",
            u.username
          );
          return (
            <div key={u.id} className="flex items-center justify-between gap-3">
              <UserTooltip user={u}>
                <Link href={profileUrl} className="flex min-w-0 items-center gap-3">
                  <UserAvatar
                    avatarUrl={u.avatarUrl}
                    className="flex-none"
                    size={40}
                  />
                  <div className="min-w-0">
                    <p className="line-clamp-1 break-all text-sm font-semibold hover:underline">
                      {u.displayName}
                    </p>
                    <p className="line-clamp-1 break-all text-xs text-muted-foreground">
                      @{u.username}
                    </p>
                  </div>
                </Link>
              </UserTooltip>
              <FollowButton
                userId={u.id}
                initialState={{
                  followers: u._count.followers,
                  isFollowedByUser: u.followers.length > 0,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const getTrendingTopics = unstable_cache(
  async () => {
    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
        SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+','g'))) as hashtag, COUNT(*) AS count
        FROM posts
        GROUP BY (hashtag)
        ORDER BY count DESC, hashtag ASC
        LIMIT 5
    `;
    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count),
    }));
  },
  ["trending_topics"],
  {
    revalidate: 3 * 60 * 60,
  }
);

async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics();
  if (trendingTopics.length === 0) return null;

  return (
    <div className="space-y-4 rounded-2xl bg-card p-5 shadow-sm border">
      <div className="flex items-center gap-2 text-lg font-bold">
        <TrendingUp className="h-4 w-4 text-primary" />
        <span>Trending Topics</span>
      </div>
      <div className="space-y-3">
        {trendingTopics.map(({ hashtag, count }) => {
          return (
            <Link
              key={hashtag}
              href={`/search?q=${encodeURIComponent(hashtag)}`}
              className="block group"
            >
              <p
                className="line-clamp-1 break-all text-sm font-semibold group-hover:text-primary group-hover:underline transition-colors"
                title={hashtag}
              >
                {hashtag}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(count)} {count === 1 ? "post" : "posts"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
