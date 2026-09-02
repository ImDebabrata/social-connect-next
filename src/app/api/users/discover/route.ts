import { getCurrentUser } from "@/app/action";
import Misc from "@/constrants/Misc";
import prisma from "@/lib/prisma";
import { FollowFilterType, getUserDataSelect, UsersPage } from "@/lib/types";
import { parsePageSize } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const loggedInUser = await getCurrentUser();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;
    const q = searchParams.get("q")?.trim() || "";
    const filter = (searchParams.get("filter") || "all") as FollowFilterType;
    const pageSize = parsePageSize(searchParams.get("pageSize"), 12);

    const whereClause: Prisma.UserWhereInput = {
      NOT: {
        id: loggedInUser.userId,
      },
    };

    if (q) {
      whereClause.OR = [
        { displayName: { contains: q, mode: "insensitive" } },
        { username: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
      ];
    }

    if (filter === "not_following") {
      whereClause.followers = {
        none: {
          followerId: loggedInUser.userId,
        },
      };
    } else if (filter === "mutual") {
      whereClause.followers = {
        some: {
          followerId: loggedInUser.userId,
        },
      };
      whereClause.following = {
        some: {
          followingId: loggedInUser.userId,
        },
      };
    }

    let orderBy:
      | Prisma.UserOrderByWithRelationInput
      | Prisma.UserOrderByWithRelationInput[] = {
      createdAt: "desc",
    };

    if (filter === "popular") {
      orderBy = [
        {
          followers: {
            _count: "desc",
          },
        },
        { createdAt: "desc" },
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: getUserDataSelect(loggedInUser.userId),
        take: pageSize + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy,
      }),
      prisma.user.count({
        where: whereClause,
      }),
    ]);

    const nextCursor =
      users.length > pageSize ? users[pageSize].id : null;

    const data: UsersPage = {
      users: users.slice(0, pageSize),
      nextCursor,
      totalCount,
    };

    return Response.json({
      success: true,
      data,
      [Misc.API_RESPONSE_MESSAGE_KEY]: "Users fetched successfully",
    });
  } catch (error) {
    console.error("Error in user discovery route:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
