import { useToast } from "@/hooks/use-toast";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitPost } from "./action";
import { PostsPage } from "@/lib/types";

export function useSubmitPostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (response) => {
      const queryFilter: QueryFilters<PostsPage> = {
        queryKey: ["post-feed", "for-you"],
      };
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
        queryKey: ["post-feed", "for-you"],
        predicate(query) {
          return !query.state.data;
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
