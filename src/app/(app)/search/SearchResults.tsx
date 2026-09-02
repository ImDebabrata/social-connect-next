"use client";

import Post from "@/components/posts/Post";
import PostLoadingSkeleton from "@/components/posts/PostLoadingSkeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserList from "@/components/users/UserList";
import APIConfig from "@/constrants/ApiConfig";
import useDebounce from "@/hooks/useDebounce";
import ApiService from "@/lib/api.service";
import { PostData, UserData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { FileText, Loader2, Search, Users, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface SearchResponse {
  users: UserData[];
  posts: PostData[];
}

export default function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [activeTab, setActiveTab] = useState<"people" | "posts">("people");
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    if (debouncedQuery !== initialQ) {
      router.replace(`/search?q=${encodeURIComponent(debouncedQuery)}`, {
        scroll: false,
      });
    }
  }, [debouncedQuery, initialQ, router]);

  const { data, status, isFetching } = useQuery<SearchResponse>({
    queryKey: ["search-results", debouncedQuery],
    queryFn: () =>
      ApiService[APIConfig.SEARCH_ALL.METHOD](
        APIConfig.SEARCH_ALL.URL as string,
        {
          q: debouncedQuery,
        }
      ).then((res) => res.data),
    enabled: !!debouncedQuery.trim(),
  });

  const users = data?.users || [];
  const posts = data?.posts || [];

  return (
    <div className="space-y-5">
      {/* Search Header */}
      <div className="rounded-2xl bg-card p-5 shadow-sm border space-y-4">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <Search className="h-4 w-4" />
          <span>Global Search</span>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, usernames, keywords, hashtags, and posts..."
            className="rounded-xl pl-10 pr-10 h-11 bg-muted/40 focus-visible:bg-card text-base"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {debouncedQuery ? (
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "people" | "posts")}
          className="space-y-4"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TabsList className="bg-card border p-1 rounded-xl">
              <TabsTrigger
                value="people"
                className="flex items-center gap-2 rounded-lg"
              >
                <Users className="h-4 w-4" />
                People ({users.length})
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="flex items-center gap-2 rounded-lg"
              >
                <FileText className="h-4 w-4" />
                Posts ({posts.length})
              </TabsTrigger>
            </TabsList>

            {isFetching && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                Searching...
              </div>
            )}
          </div>

          <TabsContent value="people" className="m-0 space-y-4">
            <UserList
              users={users}
              status={status}
              emptyTitle={`No people found for "${debouncedQuery}"`}
              emptySubtext="Try searching for a different name, username, or interest."
            />
          </TabsContent>

          <TabsContent value="posts" className="m-0 space-y-4">
            {status === "pending" ? (
              <PostLoadingSkeleton />
            ) : status === "error" ? (
              <p className="text-center text-destructive py-8">
                An error occurred while searching posts.
              </p>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-12 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-xl font-bold">
                  No posts found for &ldquo;{debouncedQuery}&rdquo;
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Try searching with different keywords or hashtags.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Post key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-xl font-bold">Search Social Connect</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Type anything above to find people, friends, hashtags, or posts.
          </p>
        </div>
      )}
    </div>
  );
}
