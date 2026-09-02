import { getCurrentUser } from "@/app/action";
import Misc from "@/constrants/Misc";
import prisma from "@/lib/prisma";
import { getPostDataInclude, getUserDataSelect } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const loggedInUser = await getCurrentUser();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get("q")?.trim() || "";
    const pageSize = 10;

    if (!q) {
      return Response.json({
        success: true,
        data: {
          users: [],
          posts: [],
        },
      });
    }

    const [users, posts] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { displayName: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
            { bio: { contains: q, mode: "insensitive" } },
          ],
        },
        select: getUserDataSelect(loggedInUser.userId),
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.post.findMany({
        where: {
          content: {
            contains: q,
            mode: "insensitive",
          },
        },
        include: getPostDataInclude(loggedInUser.userId),
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return Response.json({
      success: true,
      data: {
        users,
        posts,
      },
      [Misc.API_RESPONSE_MESSAGE_KEY]: "Search results fetched successfully",
    });
  } catch (error) {
    console.error("Error in search route:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
