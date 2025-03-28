"use client";

import { PostData } from "@/lib/types";
import Link from "next/link";
import React from "react";
import UserAvatar from "../UserAvatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import PostMoreButton from "./PostMoreButton";
import Linkify from "../Linkify";
import UserTooltip from "../UserTooltip";
import { Media } from "@prisma/client";
import Image from "next/image";
import RouteConfig from "@/constrants/RouteConfig";
import LikeButton from "./LikeButton";
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
          <UserTooltip user={post.user}>
            {/* Todo:redirect to user page */}
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={post.user}>
              {/* Todo: redirect to user page */}
              <Link
                href={`/users/${post.user.username}`}
                className="block font-medium hover:underline"
              >
                {post.user.displayName}
              </Link>
            </UserTooltip>
            {/* Todo: redirect to post page */}
            <Link
              href={`${RouteConfig.protectedRoute.POST.replace(
                ":postId",
                post.id
              )}`}
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
      {post.attachments.length > 0 && (
        <MediaPreviews attachments={post.attachments} />
      )}
      <hr className="text-muted-foreground" />
      <LikeButton
        postId={post.id}
        initialState={{
          likes: post._count.likes,
          isLikedByUser: post.likes.some(
            (like) => like.userId === user?.userId
          ),
        }}
      />
    </article>
  );
}

export default Post;

interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews(props: MediaPreviewsProps) {
  const { attachments } = props;
  return (
    <div
      className={cn(
        "flex gap-3",
        attachments?.length > 1 && "sm:grid sm:grid-cols-2"
      )}
    >
      {attachments.map((attachment) => (
        <MediaPreview key={attachment.id} media={attachment} />
      ))}
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
}

function MediaPreview(props: MediaPreviewProps) {
  const { media } = props;
  if (media.type === "IMAGE") {
    return (
      <div className="aspect-square overflow-hidden rounded-lg">
        <Image
          src={media.url}
          alt={media.url}
          className="mx-auto size-fit max-h-[30rem] rounded-2xl"
          height={500}
          width={500}
        />
      </div>
    );
  }
  if (media.type === "VIDEO") {
    return (
      <div className="aspect-video overflow-hidden rounded-2xl">
        <video
          src={media.url}
          controls
          className="mx-auto size-fit max-h-[30rem] rounded-2xl"
        />
      </div>
    );
  }
  return <p className="text-destructive">Unsupported media type</p>;
}
