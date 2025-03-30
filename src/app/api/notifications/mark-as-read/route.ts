import { getCurrentUser } from "@/app/action";
import prisma from "@/lib/prisma";

export async function PATCH() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.notification.updateMany({
      where: {
        recipientId: user.userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return Response.json(
      { message: "Notifications marked as read" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
