import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import RouteConfig from "@/constrants/RouteConfig";
import { Bell, Bookmark, Home, Mail } from "lucide-react";
import NotificationButton from "./NotificationButton";
import { getCurrentUser } from "@/app/action";
import prisma from "@/lib/prisma";
interface MenuBarProps {
  className?: string;
}

const buttonItems = [
  {
    title: "Home",
    icon: <Home />,
    route: RouteConfig.protectedRoute.MAIN_SCREEN,
  },
  {
    title: "Notificatios",
    icon: <Bell />,
    route: RouteConfig.protectedRoute.NOTIFICATIONS,
  },
  {
    title: "Messages",
    icon: <Mail />,
    route: RouteConfig.protectedRoute.MESSAGES,
  },
  {
    title: "Bookmarks",
    icon: <Bookmark />,
    route: RouteConfig.protectedRoute.BOOKMARKS,
  },
];

async function MenuBar(props: MenuBarProps) {
  const { className } = props;

  const loggedInUser = await getCurrentUser();

  if (!loggedInUser) return null;

  const unreadNotificationCount = await prisma.notification.count({
    where: {
      recipientId: loggedInUser.userId,
      read: false,
    },
  });

  return (
    <div className={className}>
      {buttonItems.map((buttonConfig, index) => {
        if (buttonConfig.title === "Notificatios") {
          return (
            <NotificationButton
              key={index}
              initialState={{ unreadCount: unreadNotificationCount }}
              title={buttonConfig.title}
              icon={buttonConfig.icon}
              route={buttonConfig.route}
            />
          );
        }
        return (
          <Button
            key={index}
            variant={"ghost"}
            className="flex items-center justify-start gap-3"
            title={buttonConfig.title}
            asChild
          >
            <Link href={buttonConfig.route}>
              {buttonConfig.icon}
              <span className="hidden lg:inline">{buttonConfig.title}</span>
            </Link>
          </Button>
        );
      })}
    </div>
  );
}

export default MenuBar;
