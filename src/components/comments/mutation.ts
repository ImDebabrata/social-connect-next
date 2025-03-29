import { useToast } from "@/hooks/use-toast";
import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitComment } from "./action";
import { CommentsPage } from "@/lib/types";

export function useSubmitCommentMutation(postId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitComment,
    onSuccess: async (newComment) => {
      const queryKey: QueryKey = ["comments", postId];

      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueriesData<InfiniteData<CommentsPage, string | null>>(
        { queryKey },
        (oldData) => {
          if (!oldData) return undefined;

          const firstPage = oldData.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  comments: [...firstPage.comments, newComment],
                  previousCursor: firstPage.previousCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }

          return oldData;
        }
      );

      queryClient.invalidateQueries({
        queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });

      toast({
        variant: "default",
        description: "Comment added successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to add comment. Please try again.",
      });
    },
  });

  return mutation;
}
