"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserList from "@/components/users/UserList";
import APIConfig from "@/constrants/ApiConfig";
import useDebounce from "@/hooks/useDebounce";
import ApiService from "@/lib/api.service";
import { FollowFilterType, UsersPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Compass,
  Flame,
  LayoutGrid,
  List,
  Search,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import React, { useState } from "react";

const FILTER_OPTIONS: {
  key: FollowFilterType;
  label: string;
  icon: React.ReactNode;
}[] = [
    { key: "all", label: "All Members", icon: <Users className="h-4 w-4" /> },
    {
      key: "not_following",
      label: "Suggested / New",
      icon: <Sparkles className="h-4 w-4 text-amber-500" />,
    },
    {
      key: "mutual",
      label: "Mutual Friends",
      icon: <UserCheck className="h-4 w-4 text-emerald-500" />,
    },
    {
      key: "popular",
      label: "Top Creators",
      icon: <Flame className="h-4 w-4 text-rose-500" />,
    },
    {
      key: "recent",
      label: "Recently Joined",
      icon: <Compass className="h-4 w-4 text-sky-500" />,
    },
  ];

export default function FindFriendsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FollowFilterType>("not_following");
  const [layout, setLayout] = useState<"grid" | "list">("list");

  const debouncedQuery = useDebounce(searchQuery, 350);

  const {
    data,
    status,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery<UsersPage>({
    queryKey: ["users", "discover", debouncedQuery, activeFilter],
    queryFn: ({ pageParam }) =>
      ApiService[APIConfig.DISCOVER_USERS.METHOD](
        APIConfig.DISCOVER_USERS.URL as string,
        {
          q: debouncedQuery,
          filter: activeFilter,
          cursor: pageParam,
          pageSize: 12,
        }
      ).then((res) => res.data),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const users = data?.pages?.flatMap((page) => page.users) || [];
  const totalCount = data?.pages?.[0]?.totalCount;

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-card p-6 shadow-sm border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <UserPlus className="h-4 w-4" />
              <span>Discover & Connect</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Find Friends
            </h1>
            <p className="text-sm text-muted-foreground">
              Meet interesting people, build your network, and connect with
              creators.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={layout === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9"
              onClick={() => setLayout("list")}
              title="List view"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={layout === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9"
              onClick={() => setLayout("grid")}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3 rounded-2xl bg-card p-4 shadow-sm border">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, @username, or keywords in bio..."
            className="rounded-xl pl-10 pr-10 h-11 bg-muted/40 focus-visible:bg-card"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {FILTER_OPTIONS.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <Button
                key={filter.key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`h-8 rounded-full text-xs font-medium gap-1.5 transition-all ${isActive
                  ? "shadow-sm"
                  : "border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5"
                  }`}
                onClick={() => setActiveFilter(filter.key)}
              >
                {filter.icon}
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Meta Bar */}
      {status === "success" && totalCount !== undefined && (
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span>
            Found <strong className="text-foreground">{totalCount}</strong>{" "}
            {totalCount === 1 ? "person" : "people"}
          </span>
          {debouncedQuery && (
            <span>
              Matching &ldquo;
              <strong className="text-foreground">{debouncedQuery}</strong>
              &rdquo;
            </span>
          )}
        </div>
      )}

      {/* User Feed */}
      <UserList
        users={users}
        status={status}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        layout={layout}
        emptyTitle={
          debouncedQuery ? "No matches found" : "No recommendations right now"
        }
        emptySubtext={
          debouncedQuery
            ? `We couldn't find anyone matching "${debouncedQuery}". Try another keyword or reset filters.`
            : "Check back later or browse all members to find new connections."
        }
        emptyAction={
          debouncedQuery || activeFilter !== "all" ? (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
            >
              Reset Search & Filters
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
