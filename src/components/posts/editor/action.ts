"use server";

import { getCurrentUser } from "@/app/action";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
}) {
  const { content, mediaIds } = createPostSchema.parse(input);

  const user = await getCurrentUser();

  if (!user) throw Error("Unauthorized");

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user?.userId,
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: getPostDataInclude(user.userId),
  });

  return newPost;
}
