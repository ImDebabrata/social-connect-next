"use client";

import FollowButton from "@/components/FollowButton";
import Linkify from "@/components/Linkify";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import UserTooltip from "@/components/UserTooltip";
import RouteConfig from "@/constrants/RouteConfig";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { FollowerInfo, UserData } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";
import { Calendar, FileText, MessageCircle, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import React from "react";

interface UserCardProps {
  user: UserData;
  onFollowChange?: () => void;
  showBio?: boolean;
}

export default function UserCard({ user, showBio = true }: UserCardProps) {
  const { user: loggedInUser } = useCurrentSession();

  const isCurrentUser = loggedInUser?.userId === user.id;

  const isFollowedByUser = user.followers?.some(
    (follower) => follower.followerId === loggedInUser?.userId
  ) ?? false;

  const followsYou = (user.following?.length ?? 0) > 0;

  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser,
  };

  const profileUrl = RouteConfig.protectedRoute.PROFILE.replace(
    ":username",
    user.username
  );

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md">
      <div>
        {/* Header: Avatar + User Info + Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <UserTooltip user={user}>
              <Link href={profileUrl} className="shrink-0">
                <UserAvatar
                  avatarUrl={user.avatarUrl}
                  size={56}
                  className="ring-2 ring-transparent transition-all group-hover:ring-primary/20"
                />
              </Link>
            </UserTooltip>
            <div className="min-w-0 flex-1">
              <UserTooltip user={user}>
                <Link
                  href={profileUrl}
                  className="block truncate font-bold text-foreground hover:underline"
                >
                  {user.displayName}
                </Link>
              </UserTooltip>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <Link href={profileUrl} className="truncate hover:underline">
                  @{user.username}
                </Link>
                {followsYou && !isCurrentUser && (
                  <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Follows you
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex shrink-0 items-center gap-2">
            {!isCurrentUser && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full border-muted hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  title={`Message ${user.displayName}`}
                  asChild
                >
                  <Link
                    href={`${RouteConfig.protectedRoute.MESSAGES}?userId=${user.id}`}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Link>
                </Button>
                <FollowButton userId={user.id} initialState={followerInfo} />
              </>
            )}
            {isCurrentUser && (
              <span className="rounded-full bg-secondary/80 px-3 py-1 text-xs font-semibold text-secondary-foreground">
                You
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        {showBio && user.bio && (
          <div className="mt-3 text-sm text-muted-foreground">
            <Linkify>
              <p className="line-clamp-2 break-words leading-relaxed">
                {user.bio}
              </p>
            </Linkify>
          </div>
        )}
      </div>

      {/* Footer Stats & Meta */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-y-2 border-t pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1" title="Followers">
            <Users className="h-3.5 w-3.5 text-primary" />
            <strong className="font-semibold text-foreground">
              {formatNumber(user._count.followers)}
            </strong>{" "}
            followers
          </span>
          <span className="flex items-center gap-1" title="Following">
            <UserCheck className="h-3.5 w-3.5 text-primary" />
            <strong className="font-semibold text-foreground">
              {formatNumber(user._count.following || 0)}
            </strong>{" "}
            following
          </span>
          <span className="hidden items-center gap-1 sm:flex" title="Posts">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <strong className="font-semibold text-foreground">
              {formatNumber(user._count.posts)}
            </strong>{" "}
            posts
          </span>
        </div>

        <span className="flex items-center gap-1 text-[11px]">
          <Calendar className="h-3 w-3" />
          Joined {formatDate(user.createdAt)}
        </span>
      </div>
    </div>
  );
}
