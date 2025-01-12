import { getCurrentUser } from "@/app/action";
import Misc from "@/constrants/Misc";
import prisma from "@/lib/prisma";
import { postDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    console.log({cursor})
    const pageSize = 10;
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const posts = await prisma.post.findMany({
      include: postDataInclude,
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
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
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
