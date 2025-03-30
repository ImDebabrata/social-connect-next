"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { NotificationCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/lib/utils";
import APIConfig from "@/constrants/ApiConfig";

interface NotificationButtonProps {
  initialState: NotificationCountInfo;
  title: string;
  icon: React.ReactNode;
  route: string;
}

export default function NotificationButton(props: NotificationButtonProps) {
  const { initialState, title, icon, route } = props;

  const { data } = useQuery({
    queryKey: ["un-read-notification-count"],
    queryFn: (): Promise<NotificationCountInfo> =>
      fetchData({
        url: APIConfig.GET_UNREAD_NOTIFICATION_COUNT.URL as string,
        method: APIConfig.GET_UNREAD_NOTIFICATION_COUNT.METHOD,
      }),
    initialData: initialState,
    refetchInterval: 60 * 1000,
  });

  return (
    <Button
      variant={"ghost"}
      className="flex items-center justify-start gap-3"
      title={title}
      asChild
    >
      <Link href={route}>
        <div className="relative">
          {icon}
          {!!data.unreadCount && (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary text-primary-foreground px-1 text-xs font-medium tabular-nums">
              {data.unreadCount}
            </span>
          )}
        </div>
        <span className="hidden lg:inline">{title}</span>
      </Link>
    </Button>
  );
}
