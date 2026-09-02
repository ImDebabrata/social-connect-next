import { getCurrentUser } from "@/app/action";
import RouteConfig from "@/constrants/RouteConfig";
import prisma from "@/lib/prisma";
import {
  Bell,
  Bookmark,
  Home,
  Mail,
  Users,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import NotificationButton from "./NotificationButton";
import { Button } from "./ui/button";

interface MenuBarProps {
  className?: string;
}

const buttonItems = [
  {
    title: "Home",
    icon: <Home className="h-5 w-5" />,
    route: RouteConfig.protectedRoute.MAIN_SCREEN,
  },
  {
    title: "Friends",
    icon: <Users className="h-5 w-5" />,
    route: RouteConfig.protectedRoute.FIND_FRIENDS,
  },
  {
    title: "Notifications",
    icon: <Bell className="h-5 w-5" />,
    route: RouteConfig.protectedRoute.NOTIFICATIONS,
  },
  {
    title: "Messages",
    icon: <Mail className="h-5 w-5" />,
    route: RouteConfig.protectedRoute.MESSAGES,
  },
  {
    title: "Bookmarks",
    icon: <Bookmark className="h-5 w-5" />,
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
        if (buttonConfig.title === "Notifications") {
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
