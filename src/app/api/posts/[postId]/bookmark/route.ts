import { getCurrentUser } from "@/app/action";
import prisma from "@/lib/prisma";

interface BookmarkInfo {
  isBookmarkedByUser: boolean;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const loggedInUser = await getCurrentUser();
    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: loggedInUser.userId,
          postId,
        },
      },
    });

    const data: BookmarkInfo = {
      isBookmarkedByUser: !!bookmark,
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

    await prisma.bookmark.upsert({
      where: {
        userId_postId: {
          userId: loggedInUser.userId,
          postId,
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
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const loggedInUser = await getCurrentUser();
    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.bookmark.deleteMany({
      where: {
        userId: loggedInUser.userId,
        postId: postId,
      },
    });

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}
