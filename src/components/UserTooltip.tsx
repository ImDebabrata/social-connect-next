"use client";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { FollowerInfo, UserData } from "@/lib/types";
import React, { PropsWithChildren } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import Link from "next/link";
import RouteConfig from "@/constrants/RouteConfig";
import UserAvatar from "./UserAvatar";
import FollowerCount from "./FollowerCount";
import FollowButton from "./FollowButton";
import Linkify from "./Linkify";

interface UserTooltipProps extends PropsWithChildren {
  user: UserData;
}

function UserTooltip(props: UserTooltipProps) {
  const { user, children } = props;
  const { user: loggedInUser } = useCurrentSession();
  const followerState: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      (follower) => follower.followerId === loggedInUser?.userId
    ),
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <div className="flex max-w-80 flex-col gap-3 break-words px-1 py-2.5 md:min-w-52">
            <div className="flex items-center justify-between gap-2">
              <Link
                href={RouteConfig.protectedRoute.PROFILE.replace(
                  ":username",
                  user.username
                )}
              >
                <UserAvatar avatarUrl={user.avatarUrl} size={70} />
              </Link>
              {loggedInUser?.userId !== user.id && (
                <FollowButton userId={user.id} initialState={followerState} />
              )}
            </div>
            <div>
              <Link
                href={RouteConfig.protectedRoute.PROFILE.replace(
                  ":username",
                  user.username
                )}
              >
                <div className="text-lg font-semibold hover:underline">
                  {user.displayName}
                </div>
                <div className="text-muted-foreground">@{user.username}</div>
              </Link>
            </div>
            {user.bio && (
              <Linkify>
                <div className="line-clamp-4 whitespace-pre-line">
                  {user.bio}
                </div>
              </Linkify>
            )}
            <FollowerCount userId={user.id} initialState={followerState} />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default UserTooltip;
