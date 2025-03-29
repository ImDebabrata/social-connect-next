import { useToast } from "@/hooks/use-toast";
import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { deleteComment, submitComment } from "./action";
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

export function useDeleteCommentMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: async (deletedComment) => {
      const queryKey: QueryKey = ["comments", deletedComment.postId];

      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        queryKey,
        (oldData) => {
          if (!oldData) return undefined;
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              previousCursor: page.previousCursor,
              comments: page.comments.filter(
                (comment) => comment.id !== deletedComment.id
              ),
            })),
          };
        }
      );

      toast({
        description: "Comment deleted successfully",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to delete comment. Please try again.",
      });
    },
  });

  return mutation;
}
