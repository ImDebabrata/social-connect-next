import { PostData } from "@/lib/types";
import Link from "next/link";
import React from "react";
import UserAvatar from "../UserAvatar";
import { formatRelativeDate } from "@/lib/utils";

interface PostProps {
  post: PostData;
}

function Post(props: PostProps) {
  const { post } = props;
  return (
    <article className="space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      {/* {post.content} */}
      <div className="flex flex-wrap gap-3">
        {/* Todo:redirect to user page */}
        <Link href={""}>
          <UserAvatar avatarUrl={post.user.avatarUrl} />
        </Link>
        <div>
          {/* Todo: redirect to user page */}
          <Link href={""} className="block font-medium hover:underline">
            {post.user.displayName}
          </Link>
          {/* Todo: redirect to post page */}
          <Link
            href={""}
            className="block text-sm text-muted-foreground hover:underline"
          >
            {formatRelativeDate(post.createdAt)}
          </Link>
        </div>
      </div>
      <div className="whitespace-pre-line break-words">{post.content}</div>
    </article>
  );
}

export default Post;
