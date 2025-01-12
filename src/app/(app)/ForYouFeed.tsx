"use client";
import Post from "@/components/posts/Post";
import { Button } from "@/components/ui/button";
import APIConfig from "@/constrants/ApiConfig";
import ApiService from "@/lib/api.service";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import React from "react";

function ForYouFeed() {
  const {
    status,
    data,
    fetchNextPage,
    // hasNextPage,
    // isFetching,
    // isFetchingNextPage,
  } = useInfiniteQuery<PostsPage>({
    queryKey: ["post-feed", "for-you"],
    queryFn: ({ pageParam }) =>
      ApiService[APIConfig.GET_POSTS.METHOD](
        APIConfig.GET_POSTS.URL as string,
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
        <Loader2 className="mx-auto animate-spin" />
      ) : status === "error" ? (
        <p className="text-center text-destructive">
          An error occurred while loading posts.
        </p>
      ) : status === "success" && posts?.length > 0 ? (
        <div className="space-y-5">
          {posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
          <Button onClick={() => fetchNextPage()}>Load more</Button>
        </div>
      ) : (
        status === "success" && (
          <p className="text-center">No posts available.</p>
        )
      )}
    </>
  );
}

export default ForYouFeed;
