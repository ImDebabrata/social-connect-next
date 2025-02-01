"use client";

import { PostData } from "@/lib/types";
import Link from "next/link";
import React from "react";
import UserAvatar from "../UserAvatar";
import { formatRelativeDate } from "@/lib/utils";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import PostMoreButton from "./PostMoreButton";
import Linkify from "../Linkify";

interface PostProps {
  post: PostData;
}

function Post(props: PostProps) {
  const { post } = props;
  const { user } = useCurrentSession();
  return (
    <article className="group/post space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        {/* {post.content} */}
        <div className="flex flex-wrap gap-3">
          {/* Todo:redirect to user page */}
          <Link href={`/users/${post.user.username}`}>
            <UserAvatar avatarUrl={post.user.avatarUrl} />
          </Link>
          <div>
            {/* Todo: redirect to user page */}
            <Link
              href={`/users/${post.user.username}`}
              className="block font-medium hover:underline"
            >
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
        {post.userId === user?.userId && (
          <PostMoreButton
            post={post}
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>
      <Linkify>
        <div className="whitespace-pre-line break-words">{post.content}</div>
      </Linkify>
    </article>
  );
}

export default Post;
