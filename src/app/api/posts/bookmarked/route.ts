import { getCurrentUser } from "@/app/action";
import Misc from "@/constrants/Misc";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;
    const user = await getCurrentUser();
    
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find bookmarked posts for the current user
    const bookmarkedPosts = await prisma.bookmark.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        post:{
            include:getPostDataInclude(user.userId)
        }
      },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = bookmarkedPosts.length > pageSize ? bookmarkedPosts[pageSize].id : null;

    const data: PostsPage = {
      posts: bookmarkedPosts.slice(0, pageSize).map((bookmark) => bookmark.post),
      nextCursor,
    };

    return Response.json({
      success: true,
      data: data,
      [Misc.API_RESPONSE_MESSAGE_KEY]: "Bookmarked posts fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
