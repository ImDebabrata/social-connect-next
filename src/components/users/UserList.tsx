"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import { UserData } from "@/lib/types";
import { AlertCircle, Loader2, Users } from "lucide-react";
import React from "react";
import UserCard from "./UserCard";
import UserCardSkeleton from "./UserCardSkeleton";

interface UserListProps {
  users: UserData[];
  status: "pending" | "error" | "success";
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  emptyTitle?: string;
  emptySubtext?: string;
  emptyAction?: React.ReactNode;
  layout?: "grid" | "list";
}

export default function UserList({
  users,
  status,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  emptyTitle = "No users found",
  emptySubtext = "Try adjusting your search query or filters.",
  emptyAction,
  layout = "list",
}: UserListProps) {
  if (status === "pending") {
    return (
      <div
        className={
          layout === "grid"
            ? "grid grid-cols-1 gap-4 md:grid-cols-2"
            : "space-y-4"
        }
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <UserCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-10 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h3 className="mt-3 text-lg font-semibold text-destructive">
          Error loading users
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          An error occurred while fetching users. Please try again.
        </p>
      </div>
    );
  }

  if (status === "success" && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-12 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Users className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-xl font-bold">{emptyTitle}</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {emptySubtext}
        </p>
        {emptyAction && <div className="mt-6">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      className={
        layout === "grid"
          ? "grid grid-cols-1 gap-4 md:grid-cols-2"
          : "space-y-4"
      }
      onBottomReached={() => {
        if (hasNextPage && fetchNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
    >
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
      {isFetchingNextPage && (
        <div className="col-span-full flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </InfiniteScrollContainer>
  );
}
