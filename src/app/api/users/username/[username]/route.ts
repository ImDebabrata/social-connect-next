import { getCurrentUser } from "@/app/action";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
      select: getUserDataSelect(loggedInUser.userId),
    });

    if (!user)
      return Response.json({ error: "User not found" }, { status: 404 });

    return Response.json({ data: user }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}
