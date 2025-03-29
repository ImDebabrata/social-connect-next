import { CommentsPage, PostData } from "@/lib/types";
import CommentInput from "./CommentInput";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchData } from "@/lib/utils";
import ApiConfig from "@/constrants/ApiConfig";
import Comment from "./Comment";
import { Button } from "../ui/button";
import ImageConfig from "@/constrants/ImageConfig";

interface CommentsProps {
  post: PostData;
}

export default function Comments({ post }: CommentsProps) {
  const { data, fetchNextPage, hasNextPage, isFetching, status } =
    useInfiniteQuery<CommentsPage>({
      queryKey: ["comments", post.id],
      queryFn: ({ pageParam }) =>
        fetchData({
          // @ts-expect-error: Todo: to fix it later
          url: ApiConfig.GET_COMMENTS.URL(post.id),
          method: ApiConfig.GET_COMMENTS.METHOD,
          payload: {
            cursor: pageParam,
          },
        }),
      initialPageParam: null,
      getNextPageParam: (firstPage) => firstPage.previousCursor,
      select: (data) => ({
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      }),
    });

  const comments = data?.pages?.flatMap((page) => page.comments) ?? [];
  return (
    <div className="space-y-3">
      <CommentInput post={post} />
      {hasNextPage && (
        <Button
          variant={"link"}
          className="mx-auto block"
          disabled={isFetching}
          onClick={() => fetchNextPage()}
        >
          Load previous comments
        </Button>
      )}
      {status === "pending" && (
        <ImageConfig.LoadingIcon className="mx-auto animate-spin" />
      )}
      {status === "success" && !comments.length && (
        <p className="text-muted-foreground text-center">No comments yet</p>
      )}
      {status === "error" && (
        <p className="text-center text-destructive">Failed to load comments</p>
      )}
      <div className="divide-y">
        {comments?.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
