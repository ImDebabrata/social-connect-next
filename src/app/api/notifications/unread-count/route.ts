import { getCurrentUser } from "@/app/action";
import prisma from "@/lib/prisma";
import { NotificationCountInfo } from "@/lib/types";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unreadCount = await prisma.notification.count({
      where: {
        recipientId: user.userId,
        read: false,
      },
    });

    const data: NotificationCountInfo = {
      unreadCount,
    };

    return Response.json({ data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
