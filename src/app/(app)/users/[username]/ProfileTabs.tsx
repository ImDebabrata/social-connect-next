"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserList from "@/components/users/UserList";
import APIConfig from "@/constrants/ApiConfig";
import ApiService from "@/lib/api.service";
import { UserData, UsersPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FileText, UserCheck, Users } from "lucide-react";
import React, { useState } from "react";
import UserPosts from "./UserPosts";

interface ProfileTabsProps {
  user: UserData;
}

export default function ProfileTabs({ user }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "following" | "followers">("posts");

  // Query for Following list
  const followingQuery = useInfiniteQuery<UsersPage>({
    queryKey: ["users", user.id, "profile-following"],
    queryFn: ({ pageParam }) =>
      ApiService[APIConfig.GET_USER_FOLLOWING.METHOD](
        // @ts-expect-error: URL function with param
        APIConfig.GET_USER_FOLLOWING.URL(user.id),
        { cursor: pageParam, pageSize: 12 }
      ).then((res) => res.data),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: activeTab === "following",
  });

  // Query for Followers list
  const followersQuery = useInfiniteQuery<UsersPage>({
    queryKey: ["users", user.id, "profile-followers"],
    queryFn: ({ pageParam }) =>
      ApiService[APIConfig.GET_USER_FOLLOWERS_LIST.METHOD](
        // @ts-expect-error: URL function with param
        APIConfig.GET_USER_FOLLOWERS_LIST.URL(user.id),
        { cursor: pageParam, pageSize: 12 }
      ).then((res) => res.data),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: activeTab === "followers",
  });

  const followingUsers =
    followingQuery.data?.pages?.flatMap((p) => p.users) || [];
  const followerUsers =
    followersQuery.data?.pages?.flatMap((p) => p.users) || [];

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) =>
        setActiveTab(v as "posts" | "following" | "followers")
      }
      className="space-y-4"
    >
      <div className="rounded-2xl bg-card p-2 shadow-sm border">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Posts</span>
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span>Following ({user._count.following || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="followers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Followers ({user._count.followers})</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="posts" className="m-0 space-y-4">
        <UserPosts userId={user.id} />
      </TabsContent>

      <TabsContent value="following" className="m-0 space-y-4">
        <UserList
          users={followingUsers}
          status={followingQuery.status}
          hasNextPage={followingQuery.hasNextPage}
          isFetchingNextPage={followingQuery.isFetchingNextPage}
          fetchNextPage={followingQuery.fetchNextPage}
          emptyTitle="Not following anyone"
          emptySubtext={`${user.displayName} is not following anyone yet.`}
        />
      </TabsContent>

      <TabsContent value="followers" className="m-0 space-y-4">
        <UserList
          users={followerUsers}
          status={followersQuery.status}
          hasNextPage={followersQuery.hasNextPage}
          isFetchingNextPage={followersQuery.isFetchingNextPage}
          fetchNextPage={followersQuery.fetchNextPage}
          emptyTitle="No followers yet"
          emptySubtext={`${user.displayName} has no followers yet.`}
        />
      </TabsContent>
    </Tabs>
  );
}
