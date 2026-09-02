"use client";

import FollowButton from "@/components/FollowButton";
import FollowerCount from "@/components/FollowerCount";
import Linkify from "@/components/Linkify";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import RouteConfig from "@/constrants/RouteConfig";
import { FollowerInfo, UserData } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";
import { Calendar, FileText, MessageCircle, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import React from "react";
import EditProfileButton from "./EditProfileButton";

interface ProfileHeaderProps {
  user: UserData;
  loggedInUserId: string;
}

export default function ProfileHeader({
  user,
  loggedInUserId,
}: ProfileHeaderProps) {
  const isCurrentUser = user.id === loggedInUserId;
  const isFollowedByUser = user.followers.some(
    (follower) => follower.followerId === loggedInUserId
  );
  const followsYou = (user.following?.length ?? 0) > 0;

  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser,
  };

  return (
    <div className="h-fit w-full space-y-5 rounded-2xl bg-card p-6 shadow-sm border">
      {/* Avatar & Cover Area */}
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
        <UserAvatar
          avatarUrl={user.avatarUrl}
          size={140}
          className="size-28 sm:size-36 rounded-full ring-4 ring-card shadow-lg"
        />

        <div className="flex-1 space-y-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {user.displayName}
                </h1>
                {followsYou && !isCurrentUser && (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Follows you
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                @{user.username}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center sm:justify-end gap-2">
              {isCurrentUser ? (
                <EditProfileButton user={user} />
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    title={`Message ${user.displayName}`}
                    asChild
                  >
                    <Link
                      href={`${RouteConfig.protectedRoute.MESSAGES}?userId=${user.id}`}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  </Button>
                  <FollowButton
                    userId={user.id}
                    initialState={followerInfo}
                  />
                </>
              )}
            </div>
          </div>

          {/* Member Since & Meta */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Member since {formatDate(user.createdAt)}</span>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm pt-1">
            <span className="flex items-center gap-1.5 font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <strong className="font-bold text-foreground">
                {formatNumber(user._count.posts)}
              </strong>{" "}
              <span className="text-muted-foreground">Posts</span>
            </span>

            <span className="flex items-center gap-1.5 font-medium">
              <Users className="h-4 w-4 text-primary" />
              <FollowerCount
                userId={user.id}
                initialState={followerInfo}
              />
            </span>

            <span className="flex items-center gap-1.5 font-medium">
              <UserCheck className="h-4 w-4 text-primary" />
              <span>
                <strong className="font-bold text-foreground">
                  {formatNumber(user._count.following || 0)}
                </strong>{" "}
                <span className="text-muted-foreground">Following</span>
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <>
          <hr className="border-border/60" />
          <Linkify>
            <div className="text-foreground/90 whitespace-pre-line text-sm leading-relaxed overflow-hidden break-words">
              {user.bio}
            </div>
          </Linkify>
        </>
      )}
    </div>
  );
}
