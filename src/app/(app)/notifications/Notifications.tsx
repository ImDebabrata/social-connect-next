"use client";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import PostLoadingSkeleton from "@/components/posts/PostLoadingSkeleton";
import APIConfig from "@/constrants/ApiConfig";
import ApiService from "@/lib/api.service";
import { NotificationsPage } from "@/lib/types";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import React, { useEffect } from "react";
import Notification from "./Notification";
import { fetchData } from "@/lib/utils";

function Notifications() {
  const {
    status,
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery<NotificationsPage>({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      ApiService[APIConfig.GET_NOTIFICATIONS.METHOD](
        APIConfig.GET_NOTIFICATIONS.URL as string,
        {
          cursor: pageParam,
        }
      ).then((response) => response.data),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: () =>
      fetchData({
        url: APIConfig.MARK_NOTIFICATIONS_AS_READ.URL as string,
        method: APIConfig.MARK_NOTIFICATIONS_AS_READ.METHOD,
      }),
    onSuccess: () => {
      queryClient.setQueryData(["un-read-notification-count"], {
        unreadCount: 0,
      });
    },
    onError: (error) => {
      console.error("failed to mark notification as read", error);
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  const notifications =
    data?.pages?.flatMap((page) => page.notifications) || [];

  return (
    <>
      {status === "pending" ? (
        <PostLoadingSkeleton />
      ) : status === "error" ? (
        <p className="text-center text-destructive">
          An error occurred while loading notifications.
        </p>
      ) : status === "success" && notifications?.length > 0 ? (
        <InfiniteScrollContainer
          className="space-y-5"
          onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
        >
          {notifications.map((notification) => (
            <Notification key={notification.id} notification={notification} />
          ))}
          {isFetchingNextPage && (
            <Loader2 className="mx-auto animate-spin my-3" />
          )}
        </InfiniteScrollContainer>
      ) : (
        status === "success" && (
          <p className="text-center">No notifications available.</p>
        )
      )}
    </>
  );
}

export default Notifications;
