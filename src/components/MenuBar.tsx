import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import RouteConfig from "@/constrants/RouteConfig";
import { Bell, Bookmark, Home, Mail } from "lucide-react";

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
    route: "",
  },
  {
    title: "Messages",
    icon: <Mail />,
    route: "",
  },
  {
    title: "Bookmarks",
    icon: <Bookmark />,
    route: RouteConfig.protectedRoute.BOOKMARKS,
  },
];

function MenuBar(props: MenuBarProps) {
  const { className } = props;
  return (
    <div className={className}>
      {buttonItems.map((buttonConfig, index) => {
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
