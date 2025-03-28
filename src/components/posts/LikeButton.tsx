import { useToast } from "@/hooks/use-toast";
import { QueryKey, useMutation, useQuery } from "@tanstack/react-query";
import { LikeInfo } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { cn, fetchData } from "@/lib/utils";
import APIConfig from "@/constrants/ApiConfig";
import { HeartIcon } from "lucide-react";

interface LikeButtonProps {
  postId: string;
  initialState: LikeInfo;
}

export default function LikeButton({ postId, initialState }: LikeButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["like-info", postId];
  const { data } = useQuery({
    queryKey: queryKey,
    queryFn: (): Promise<LikeInfo> =>
      fetchData<LikeInfo>({
        // @ts-expect-error: Todo: to fix it later
        url: APIConfig.LIKE_INFO.URL(postId),
        method: APIConfig.LIKE_INFO.METHOD,
      }),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isLikedByUser
        ? fetchData({
            // @ts-expect-error: Todo: to fix it later
            url: APIConfig.UNLIKE_POST.URL(postId),
            method: APIConfig.UNLIKE_POST.METHOD,
          })
        : fetchData({
            // @ts-expect-error: Todo: to fix it later
            url: APIConfig.LIKE_POST.URL(postId),
            method: APIConfig.LIKE_POST.METHOD,
          }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<LikeInfo>(queryKey);

      queryClient.setQueryData<LikeInfo>(queryKey, () => ({
        likes:
          (previousState?.likes || 0) + (previousState?.isLikedByUser ? -1 : 1),
        isLikedByUser: !previousState?.isLikedByUser,
      }));

      return { previousState };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousState);
      toast({
        title: "destructive",
        description: "Something went wrong",
      });
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <HeartIcon
        className={cn(
          "size-5",
          data.isLikedByUser && "fill-red-500 text-red-500"
        )}
      />
      <span className="text-sm font-medium tabular-nums">
        {data.likes}
        <span className="hidden sm:inline"> likes</span>
      </span>
    </button>
  );
}
