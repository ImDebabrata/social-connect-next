import { useToast } from "@/hooks/use-toast";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitPost } from "./action";
import { PostsPage } from "@/lib/types";
import { useCurrentSession } from "@/hooks/useCurrentSession";

export function useSubmitPostMutation() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const loggedInUser = useCurrentSession();

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (response) => {
      const queryFilter = {
        queryKey: ["post-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("for-you") ||
            (query.queryKey.includes("user-posts") &&
              query.queryKey.includes(loggedInUser.user?.userId))
          );
        },
      } satisfies QueryFilters;
      await queryClient.cancelQueries(queryFilter);
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        { queryKey: queryFilter.queryKey },
        (oldData) => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [response, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        }
      );

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return queryFilter.predicate(query) && !query.state.data;
        },
      });
      toast({
        variant: "default",
        description: "Posted successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to post. Please try again.",
      });
    },
  });
  return mutation;
}
