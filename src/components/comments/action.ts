"use server";

import { getCurrentUser } from "@/app/action";
import prisma from "@/lib/prisma";
import { PostData, getCommentDataInclude } from "@/lib/types";
import { createCommentSchema } from "@/lib/validation";
import { NotificationType } from "@prisma/client";

export async function submitComment({
  post,
  content,
}: {
  post: PostData;
  content: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const { content: contentValidated } = createCommentSchema.parse({ content });

  const [newComment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        content: contentValidated,
        postId: post.id,
        userId: user.userId,
      },
      include: getCommentDataInclude(user.userId),
    }),
    ...(post.user.id !== user.userId
      ? [
          prisma.notification.create({
            data: {
              issuerId: user.userId,
              recipientId: post.user.id,
              postId: post.id,
              type: NotificationType.COMMENT,
            },
          }),
        ]
      : []),
  ]);

  return newComment;
}

export async function deleteComment(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: {
      id,
    },
  });

  if (!comment) throw new Error("Comment not found");

  if (comment.userId !== user.userId) throw new Error("Unauthorized");

  const deletedComment = await prisma.comment.delete({
    where: { id },
    include: getCommentDataInclude(user.userId),
  });

  return deletedComment;
}
