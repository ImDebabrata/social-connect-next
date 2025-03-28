import { getCurrentUser } from "@/app/action";
import prisma from "@/lib/prisma";
import { LikeInfo } from "@/lib/types";

export async function GET(
  request: Request,
  { params: { postId } }: { params: { postId: string } }
) {
  try {
    const loggedInUser = await getCurrentUser();
    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        likes: {
          where: {
            userId: loggedInUser.userId,
          },
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const data:LikeInfo={
      likes:post._count.likes,
      isLikedByUser:!!post.likes.length
    }

    return Response.json({ data }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params: { postId } }: { params: { postId: string } }
) {
  try {
    const loggedInUser = await getCurrentUser();
    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.like.upsert({
      where: {
        userId_postId: {
          userId: loggedInUser.userId,
          postId: postId,
        },
      },
      create: {
        userId: loggedInUser.userId,
        postId: postId,
      },
      update: {},
    });

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params: { postId } }: { params: { postId: string } }
) {
  try {
    const loggedInUser = await getCurrentUser();
    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.like.deleteMany({
      where: {
        userId:loggedInUser.userId,
        postId:postId
      },
    });

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}
