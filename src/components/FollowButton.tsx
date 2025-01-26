"use client";

import { useToast } from "@/hooks/use-toast";
import useFollowerInfo from "@/hooks/useFollowerInfo";
import { FollowerInfo } from "@/lib/types";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Button } from "./ui/button";
import { fetchData } from "@/lib/utils";
import APIConfig from "@/constrants/ApiConfig";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
}

function FollowButton(props: FollowButtonProps) {
  const { userId, initialState } = props;
  const { data } = useFollowerInfo(userId, initialState);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["follower-info", userId];
  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser
        ? fetchData({
            // @ts-expect-error: Todo: to fix it later
            url: APIConfig.UNFOLLOW.URL(userId),
            method: APIConfig.UNFOLLOW.METHOD,
          })
        : fetchData({
            // @ts-expect-error: Todo: to fix it later
            url: APIConfig.FOLLOW.URL(userId),
            method: APIConfig.FOLLOW.METHOD,
          }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);

      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers:
          (previousState?.followers || 0) +
          (previousState?.isFollowedByUser ? -1 : 1),
        isFollowedByUser: !previousState?.isFollowedByUser,
      }));

      return { previousState };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to follow. Please try again.",
      });
    },
  });

  return (
    <Button
      variant={data?.isFollowedByUser ? "secondary" : "default"}
      onClick={() => mutate()}
    >
      {data?.isFollowedByUser ? "Unfollow" : "Follow"}
    </Button>
  );
}

export default FollowButton;
