"use server";

import { getCurrentUser } from "@/app/action";
import prisma from "@/lib/prisma";
import { postDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

export async function submitPost(input: string) {
  const { content } = createPostSchema.parse({ content: input, mediaIds: [] });

  const user = await getCurrentUser();

  if (!user) throw Error("Unauthorized");

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user?.userId,
    },
    include: postDataInclude,
  });

  return newPost;
}
