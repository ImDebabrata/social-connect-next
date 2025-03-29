import { useToast } from "@/hooks/use-toast";
import { QueryKey, useMutation, useQuery } from "@tanstack/react-query";
import { BookmarkInfo } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { cn, fetchData } from "@/lib/utils";
import APIConfig from "@/constrants/ApiConfig";
import { BookmarkIcon } from "lucide-react";

interface BookmarkButtonProps {
  postId: string;
  initialState: BookmarkInfo;
}

export default function BookmarkButton({ postId, initialState }: BookmarkButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["bookmark-info", postId];
  const { data } = useQuery({
    queryKey: queryKey,
    queryFn: (): Promise<BookmarkInfo> =>
      fetchData<BookmarkInfo>({
        // @ts-expect-error: Todo: to fix it later
        url: APIConfig.BOOKMARK_INFO.URL(postId),
        method: APIConfig.BOOKMARK_INFO.METHOD,
      }),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isBookmarkedByUser
        ? fetchData({
            // @ts-expect-error: Todo: to fix it later
            url: APIConfig.UNBOOKMARK_POST.URL(postId),
            method: APIConfig.UNBOOKMARK_POST.METHOD,
          })
        : fetchData({
            // @ts-expect-error: Todo: to fix it later
            url: APIConfig.BOOKMARK_POST.URL(postId),
            method: APIConfig.BOOKMARK_POST.METHOD,
          }),
    onMutate: async () => {
        toast({
            description:`Post ${data.isBookmarkedByUser?'un':''}bookmarked`
        })
      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<BookmarkInfo>(queryKey);

      queryClient.setQueryData<BookmarkInfo>(queryKey, () => ({
        isBookmarkedByUser: !previousState?.isBookmarkedByUser,
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
      <BookmarkIcon
        className={cn(
          "size-5",
          data.isBookmarkedByUser && "fill-primary text-primary"
        )}
      />
      <span className="text-sm font-medium hidden sm:inline">
        {data.isBookmarkedByUser ? "Saved" : "Save"}
      </span>
    </button>
  );
}
