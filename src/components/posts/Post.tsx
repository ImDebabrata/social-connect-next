"use client";

import { PostData } from "@/lib/types";
import Link from "next/link";
import React, { useState } from "react";
import UserAvatar from "../UserAvatar";
import { formatRelativeDate } from "@/lib/utils";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import PostMoreButton from "./PostMoreButton";
import Linkify from "../Linkify";
import UserTooltip from "../UserTooltip";
import { Media } from "@prisma/client";
import Image from "next/image";
import RouteConfig from "@/constrants/RouteConfig";
import LikeButton from "./LikeButton";
import BookmarkButton from "./BookmarkButton";
import { MessageSquareIcon, Play } from "lucide-react";
import Comments from "../comments/Comments";
import MediaLightbox from "./MediaLightbox";
interface PostProps {
  post: PostData;
}

function Post(props: PostProps) {
  const { post } = props;
  const { user } = useCurrentSession();
  const [showComments, setShowComments] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
                post.id,
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
        <MediaPreviews
          attachments={post.attachments}
          onOpenLightbox={(index) => setLightboxIndex(index)}
        />
      )}
      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: post.likes.some(
                (like) => like.userId === user?.userId,
              ),
            }}
          />
          <CommentButton
            post={post}
            onClick={() => setShowComments((prev) => !prev)}
          />
        </div>
        <BookmarkButton
          postId={post.id}
          initialState={{
            isBookmarkedByUser: post.bookmarks.some(
              (bookmark) => bookmark.userId === user?.userId,
            ),
          }}
        />
      </div>
      {showComments && <Comments post={post} />}

      {lightboxIndex !== null && (
        <MediaLightbox
          mediaList={post.attachments}
          initialIndex={lightboxIndex}
          open={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </article>
  );
}

export default Post;

interface MediaPreviewsProps {
  attachments: Media[];
  onOpenLightbox: (index: number) => void;
}

function MediaPreviews({ attachments, onOpenLightbox }: MediaPreviewsProps) {
  if (!attachments || attachments.length === 0) return null;

  // Single attachment: natural aspect ratio without artificial letterbox blank space
  if (attachments.length === 1) {
    const media = attachments[0];
    if (media.type === "IMAGE") {
      return (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenLightbox(0);
          }}
          className="group/media relative flex w-full justify-center overflow-hidden rounded-2xl border border-border/40 bg-muted/20 cursor-pointer"
        >
          <Image
            src={media.url}
            alt="Post media attachment"
            width={1200}
            height={1200}
            className="mx-auto h-auto max-h-[34rem] w-auto max-w-full rounded-2xl object-contain transition duration-200 group-hover/media:brightness-95"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      );
    }
    if (media.type === "VIDEO") {
      return (
        <div className="relative w-full overflow-hidden rounded-2xl border border-border/40 bg-black max-h-[34rem] flex items-center justify-center">
          <video
            src={media.url}
            controls
            className="w-full max-h-[34rem] object-contain rounded-2xl"
          />
        </div>
      );
    }
    return <p className="text-destructive">Unsupported media type</p>;
  }

  // Two attachments: 2-column balanced grid
  if (attachments.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {attachments.map((media, idx) => (
          <div
            key={media.id}
            onClick={(e) => {
              e.stopPropagation();
              onOpenLightbox(idx);
            }}
            className="group/media relative h-60 sm:h-80 w-full overflow-hidden rounded-2xl border border-border/40 bg-muted/30 cursor-pointer"
          >
            {media.type === "IMAGE" ? (
              <Image
                src={media.url}
                alt="Post media attachment"
                fill
                sizes="(max-width: 640px) 50vw, 350px"
                className="object-cover transition-transform duration-300 group-hover/media:scale-105"
              />
            ) : (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <video
                  src={media.url}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                  <div className="rounded-full bg-black/60 p-3 text-white backdrop-blur-sm border border-white/20">
                    <Play className="size-6 fill-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Three attachments: 1 large left + 2 stacked right
  if (attachments.length === 3) {
    return (
      <div className="grid grid-cols-2 gap-2 h-64 sm:h-80 md:h-96">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenLightbox(0);
          }}
          className="group/media relative row-span-2 overflow-hidden rounded-2xl border border-border/40 bg-muted/30 cursor-pointer"
        >
          {attachments[0].type === "IMAGE" ? (
            <Image
              src={attachments[0].url}
              alt="Post media attachment"
              fill
              sizes="(max-width: 640px) 50vw, 350px"
              className="object-cover transition-transform duration-300 group-hover/media:scale-105"
            />
          ) : (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <video
                src={attachments[0].url}
                className="w-full h-full object-cover"
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                <div className="rounded-full bg-black/60 p-3 text-white backdrop-blur-sm border border-white/20">
                  <Play className="size-6 fill-white" />
                </div>
              </div>
            </div>
          )}
        </div>
        {attachments.slice(1, 3).map((media, idx) => (
          <div
            key={media.id}
            onClick={(e) => {
              e.stopPropagation();
              onOpenLightbox(idx + 1);
            }}
            className="group/media relative overflow-hidden rounded-2xl border border-border/40 bg-muted/30 cursor-pointer"
          >
            {media.type === "IMAGE" ? (
              <Image
                src={media.url}
                alt="Post media attachment"
                fill
                sizes="(max-width: 640px) 50vw, 350px"
                className="object-cover transition-transform duration-300 group-hover/media:scale-105"
              />
            ) : (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <video
                  src={media.url}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                  <div className="rounded-full bg-black/60 p-3 text-white backdrop-blur-sm border border-white/20">
                    <Play className="size-6 fill-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Four or more attachments: 2x2 grid with +N overlay if > 4
  return (
    <div className="grid grid-cols-2 gap-2 h-64 sm:h-80 md:h-96">
      {attachments.slice(0, 4).map((media, idx) => {
        const isLastVisible = idx === 3;
        const remainingCount = attachments.length - 4;
        return (
          <div
            key={media.id}
            onClick={(e) => {
              e.stopPropagation();
              onOpenLightbox(idx);
            }}
            className="group/media relative overflow-hidden rounded-2xl border border-border/40 bg-muted/30 cursor-pointer"
          >
            {media.type === "IMAGE" ? (
              <Image
                src={media.url}
                alt="Post media attachment"
                fill
                sizes="(max-width: 640px) 50vw, 350px"
                className="object-cover transition-transform duration-300 group-hover/media:scale-105"
              />
            ) : (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <video
                  src={media.url}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                  <div className="rounded-full bg-black/60 p-3 text-white backdrop-blur-sm border border-white/20">
                    <Play className="size-6 fill-white" />
                  </div>
                </div>
              </div>
            )}
            {isLastVisible && remainingCount > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-colors group-hover/media:bg-black/50">
                <span className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
                  +{remainingCount}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface CommentButtonProps {
  post: PostData;
  onClick: () => void;
}

function CommentButton(props: CommentButtonProps) {
  const { post, onClick } = props;
  return (
    <button onClick={onClick} className={"flex items-center gap-2"}>
      <MessageSquareIcon className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {post._count.comments}{" "}
        <span className="hidden sm:inline">comments</span>
      </span>
    </button>
  );
}
