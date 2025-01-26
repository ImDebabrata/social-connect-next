'use server'

import { getCurrentUser } from "@/app/action";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";

export async function deletePost(id: string) {
    const user = await getCurrentUser();
    if (!user) throw Error("Unauthorized");

    const post = await prisma.post.findUnique({
      where: { id },
    });
    if (!post) {
      throw Error("Post not found");
    }
    if (post.userId !== user.userId) {
      throw Error("Unauthorized");
    }

    const deletedPost=await prisma.post.delete({
      where: { id },
      include: getPostDataInclude(user.userId)
    });
    return deletedPost;
}