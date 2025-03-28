import { getCurrentUser } from "@/app/action";
import FollowButton from "@/components/FollowButton";
import Linkify from "@/components/Linkify";
import Post from "@/components/posts/Post";
import UserAvatar from "@/components/UserAvatar";
import UserTooltip from "@/components/UserTooltip";
import ImageConfig from "@/constrants/ImageConfig";
import RouteConfig from "@/constrants/RouteConfig";
import prisma from "@/lib/prisma";
import { getPostDataInclude, UserData } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import React, { cache, Suspense } from "react";

interface PostPageProps {
  params: {
    postId: string;
  };
}

const getPosts = cache(async (postId: string, loggedInUserId: string) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: getPostDataInclude(loggedInUserId),
  });
  if (!post) notFound();

  return post;
});

export async function generateMetadata({ params: { postId } }: PostPageProps) {
  //validate user
  const loggedInUser = await getCurrentUser();
  if (!loggedInUser) return {};

  const post = await getPosts(postId, loggedInUser.userId);

  return {
    title: `${post.user.displayName}: ${post.content.slice(0, 50)}...`,
    description: post.content,
  };
}

async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;
  const loggedInUser = await getCurrentUser();
  if (!loggedInUser)
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page
      </p>
    );

  const post = await getPosts(postId, loggedInUser.userId);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5 ">
        <Post post={post} />
      </div>
      <div className="sticky top-[5.25rem] hidden lg:block h-fit w-80 flex-none">
        <Suspense
          fallback={
            <ImageConfig.LoadingIcon className="mx-auto animate-spin" />
          }
        >
          <UserInfoSidebar user={post.user} />
        </Suspense>
      </div>
    </main>
  );
}

export default PostPage;

interface UserInfoSidebarProps {
  user: UserData;
}

async function UserInfoSidebar({ user }: UserInfoSidebarProps) {
  const loggedInUser = await getCurrentUser();
  if (!loggedInUser) return null;

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">About this user</div>
      <UserTooltip user={user}>
        <Link
          href={RouteConfig.protectedRoute.PROFILE.replace(
            ":username",
            user.username
          )}
          className="flex items-center gap-3"
        >
          <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
          <div>
            <p className="line-clamp-1 break-all font-semibold hover:underline">
              {user.displayName}
            </p>
            <p className="line-clamp-1 break-all text-muted-foreground">
              @{user.username}
            </p>
          </div>
        </Link>
      </UserTooltip>
      <Linkify>
        <div className="line-clamp-6 whitespace-pre-line break-words text-muted-forground">
          {user.bio}
        </div>
      </Linkify>
      {user.id !== loggedInUser.userId && (
        <FollowButton
          userId={user.id}
          initialState={{
            followers: user._count.followers,
            isFollowedByUser: user.followers.some(
              ({ followerId }) => followerId === loggedInUser.userId
            ),
          }}
        />
      )}
    </div>
  );
}
