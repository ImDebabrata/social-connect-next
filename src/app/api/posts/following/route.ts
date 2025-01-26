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
    const posts = await prisma.post.findMany({
      where: {
        user: {
          followers: {
            some: {
              followerId: user.userId,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: getPostDataInclude(user.userId),
    });

    const nextCursor=posts.length>pageSize?posts[pageSize].id:null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };
    

    return Response.json({
      success: true,
      data: data,
      [Misc.API_RESPONSE_MESSAGE_KEY]: "Post fetched success",
    });

  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}
