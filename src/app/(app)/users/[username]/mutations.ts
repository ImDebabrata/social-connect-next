import { useToast } from "@/hooks/use-toast";
import { UpdateUserProfileValues } from "@/lib/validation";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "./action";
import { PostsPage } from "@/lib/types";

export function useUpdateProfileMutation() {
  const { toast } = useToast();
  const router = useRouter();

  const queryClient = useQueryClient();

//   const uploadAvatar = new Promise((resolve, reject) => {
//     const fileReader = new FileReader();
//     fileReader.onload = () => resolve(fileReader.result);
//     fileReader.onerror = () => reject(fileReader.error);
//   });

  const mutation = useMutation({
    mutationFn: async ({
      values,
    //   avatar,
    }: {
      values: UpdateUserProfileValues;
      avatar?: File;
    }) => {
      return Promise.all([
        updateUserProfile(values),
        // avatar && updateAvatar(avatar) // TODO: implement avatar update
      ]);
    },
    onSuccess: async ([updatedUser]) => {
      // const newAvatarUrl=uploadResult?[0] as any
      const newAvatarUrl = "";
      const queryFilter: QueryFilters = {
        queryKey: ["post-feed"],
      };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        { queryKey: queryFilter.queryKey },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                if (post.userId === updatedUser.id) {
                  return {
                    ...post,
                    user: {
                      ...updatedUser,
                      avatarUrl: newAvatarUrl || updatedUser.avatarUrl,
                    },
                  };
                }
                return post;
              }),
            })),
          };
        }
      );
      router.refresh();
      toast({
        description: "Profile updated successfully",
      });
    },
    onError(error) {
      console.log(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again later.",
      });
    },
  });
  return mutation;
}
