import { getCurrentUser } from "@/app/action";
import Misc from "@/constrants/Misc";
import prisma from "@/lib/prisma";
import { getUserDataSelect, UsersPage } from "@/lib/types";
import { parsePageSize } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const loggedInUser = await getCurrentUser();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;
    const pageSize = parsePageSize(searchParams.get("pageSize"), 12);

    // We want the users that `userId` is following
    // That means: user has a record in `followers` where `followerId = userId`
    const whereClause: Prisma.UserWhereInput = {
      followers: {
        some: {
          followerId: userId,
        },
      },
    };

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: getUserDataSelect(loggedInUser.userId),
        take: pageSize + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({
        where: whereClause,
      }),
    ]);

    const nextCursor = users.length > pageSize ? users[pageSize].id : null;

    const data: UsersPage = {
      users: users.slice(0, pageSize),
      nextCursor,
      totalCount,
    };

    return Response.json({
      success: true,
      data,
      [Misc.API_RESPONSE_MESSAGE_KEY]: "Following list fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching following list:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
