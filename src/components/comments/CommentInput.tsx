import { PostData } from "@/lib/types";
import { useState } from "react";
import { useSubmitCommentMutation } from "./mutation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, SendHorizonal } from "lucide-react";

interface CommentInputProps {
  post: PostData;
}

export default function CommentInput({ post }: CommentInputProps) {
  const [input, setInput] = useState("");

  const mutation = useSubmitCommentMutation(post.id);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    mutation.mutate(
      {
        post,
        content: input,
      },
      {
        onSuccess: () => setInput(""),
      }
    );
  }

  return (
    <form className="flex w-full items-center gap-2" onSubmit={onSubmit}>
      <Input
        placeholder="Add a comment..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button
        type="submit"
        variant={"ghost"}
        size={"icon"}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <Loader2 className="aniimate-spin" />
        ) : (
          <SendHorizonal />
        )}
      </Button>
    </form>
  );
}
