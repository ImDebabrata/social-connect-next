"use client";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostLoadingSkeleton from "@/components/posts/PostLoadingSkeleton";
import APIConfig from "@/constrants/ApiConfig";
import ApiService from "@/lib/api.service";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import React from "react";

function Bookmarks() {
  const {
    status,
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery<PostsPage>({
    queryKey: ["post-feed", "bookmarks"],
    queryFn: ({ pageParam }) =>
      ApiService[APIConfig.GET_BOOKMARKED_POSTS.METHOD](
        APIConfig.GET_BOOKMARKED_POSTS.URL as string,
        {
          cursor: pageParam,
        }
      ).then((response) => response.data),
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
          An error occurred while loading bookmarked posts.
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
          <p className="text-center">No bookmarked posts available.</p>
        )
      )}
    </>
  );
}

export default Bookmarks;
