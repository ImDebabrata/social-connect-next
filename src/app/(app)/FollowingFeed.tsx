"use client";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostLoadingSkeleton from "@/components/posts/PostLoadingSkeleton";
import APIConfig from "@/constrants/ApiConfig";
import { PostsPage } from "@/lib/types";
import { fetchData } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import React from "react";

function FollowingFeed() {
  const {
    status,
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery<PostsPage>({
    queryKey: ["post-feed", "following"],
    queryFn: ({ pageParam }) =>
      fetchData({
        url: APIConfig.GET_FOLLOWING_POSTS.URL as string,
        method: APIConfig.GET_FOLLOWING_POSTS.METHOD,
        payload: { cursor: pageParam },
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages?.flatMap((page) => page.posts) || [];

  return (
    <>
      {status === "pending" ? (
        <PostLoadingSkeleton />
      ) : status === "error" ? (
        <p className="text-center text-destructive">
          An error occurred while loading posts.
        </p>
      ) : status === "success" && posts?.length > 0 ? (
        <InfiniteScrollContainer
          className="space-y-5"
          onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
        >
          {posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
          {isFetchingNextPage && (
            <Loader2 className="mx-auto animate-spin my-3" />
          )}
        </InfiniteScrollContainer>
      ) : (
        status === "success" && (
          <p className="text-center">
            No posts available. Start following people to see their posts here.
          </p>
        )
      )}
    </>
  );
}

export default FollowingFeed;
