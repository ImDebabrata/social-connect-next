import { getCurrentUser } from "@/app/action";
import prisma from "@/lib/prisma";
import { LikeInfo } from "@/lib/types";
import { NotificationType } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
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

    const data: LikeInfo = {
      likes: post._count.likes,
      isLikedByUser: !!post.likes.length,
    };

    return Response.json({ data }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const loggedInUser = await getCurrentUser();
    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        userId: true,
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

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

    await prisma.$transaction([
      prisma.notification.create({
        data: {
          issuerId: loggedInUser.userId,
          recipientId: post.userId,
          postId,
          type: NotificationType.LIKE,
        },
      }),
      ...(loggedInUser?.userId !== post.userId
        ? [
            prisma.notification.create({
              data: {
                issuerId: loggedInUser.userId,
                recipientId: post.userId,
                postId,
                type: NotificationType.LIKE,
              },
            }),
          ]
        : []),
    ]);

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const loggedInUser = await getCurrentUser();
    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        userId: true,
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.like.deleteMany({
        where: {
          userId: loggedInUser.userId,
          postId: postId,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.userId,
          recipientId: post.userId,
          postId,
          type: NotificationType.LIKE,
        },
      }),
    ]);

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}
