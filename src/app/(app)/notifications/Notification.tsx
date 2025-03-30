import UserAvatar from "@/components/UserAvatar";
import RouteConfig from "@/constrants/RouteConfig";
import { NotificationData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NotificationType } from "@prisma/client";
import { Heart, MessageCircle, User2 } from "lucide-react";
import Link from "next/link";
import { JSX } from "react";

interface NotificationProps {
  notification: NotificationData;
}

export default function Notification({ notification }: NotificationProps) {
  const notificationTypeMap: Record<
    NotificationType,
    { message: string; icon: JSX.Element; href: string }
  > = {
    [NotificationType.FOLLOW]: {
      message: `${notification.issuer.displayName} followed you`,
      icon: <User2 className="size-7 text-primary" />,
      href: RouteConfig.protectedRoute.PROFILE.replace(
        ":username",
        notification.issuer.username
      ),
    },
    [NotificationType.LIKE]: {
      message: `${notification.issuer.displayName} liked your post`,
      icon: <Heart className="size-7 text-red-500 fill-red-500" />,
      href: RouteConfig.protectedRoute.POST.replace(
        ":postId",
        notification.postId || ""
      ),
    },
    [NotificationType.COMMENT]: {
      message: `${notification.issuer.displayName} commented on your post`,
      icon: <MessageCircle className="size-7 text-primary" />,
      href: RouteConfig.protectedRoute.POST.replace(
        ":postId",
        notification.postId || ""
      ),
    },
  };

  const { message, icon, href } = notificationTypeMap[notification.type];

  return (
    <Link href={href} className="block">
      <article
        className={cn(
          "flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70",
          !notification.read && "bg-primary/10"
        )}
      >
        <div className="my-1">{icon}</div>
        <div className="space-y-3">
          <UserAvatar avatarUrl={notification.issuer.avatarUrl} size={36} />
          <div>
            <span className="font-bold">{notification.issuer.displayName}</span>{" "}
            <span>{message}</span>
          </div>
          {notification.post && (
            <div className="line-clamp-3 whitespace-pre-line text-muted-foreground">
              {notification.post.content}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
