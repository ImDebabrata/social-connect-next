import { getCurrentUser } from "@/app/action";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";
import { NotificationType } from "@prisma/client";

export async function GET(
  request: Request,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const loggedInUser = await getCurrentUser();
    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: {
            followerId: loggedInUser.userId,
          },
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length,
    };

    return Response.json({ data }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const loggedInUser = await getCurrentUser();
    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.$transaction([
      prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: loggedInUser.userId,
            followingId: userId,
          },
        },
        create: {
          followerId: loggedInUser.userId,
          followingId: userId,
        },
        update: {},
      }),
      prisma.notification.create({
        data: {
          issuerId: loggedInUser.userId,
          recipientId: userId,
          type: NotificationType.FOLLOW,
        },
      }),
    ]);

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: {
          followerId: loggedInUser.userId,
          followingId: userId,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.userId,
          recipientId: userId,
          type: NotificationType.FOLLOW,
        },
      }),
    ]);

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}
