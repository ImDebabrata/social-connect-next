"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
import {
  CheckIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
} from "@/constrants/ImageConfig";
import { getCurrentUser, handleLogOut } from "@/app/action";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import Link from "next/link";
import RouteConfig from "@/constrants/RouteConfig";

interface UserButtonProps {
  className?: string;
}

function UserButton(props: UserButtonProps) {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const { className } = props;

  const { data } = useQuery({
    queryKey: ["current user info"],
    staleTime: Infinity,
    queryFn: getCurrentUser,
  });
  const { avatarUrl = "", username = "" } = data || {};
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className}>
        <UserAvatar size={40} avatarUrl={avatarUrl} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={RouteConfig.protectedRoute.PROFILE.replace(
              ":username",
              username,
            )}
          >
            <UserIcon className="mr-2 size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <MonitorIcon className="mr-2 size-4" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <SunIcon className="mr-2 size-4" />
                Light
                {theme === "light" && <CheckIcon className="mr-2 size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <MoonIcon className="mr-2 size-4" />
                Dark
                {theme === "dark" && <CheckIcon className="mr-2 size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <MonitorIcon className="mr-2 size-4" />
                System
                {theme === "system" && <CheckIcon className="mr-2 size-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuItem
          onClick={() => {
            queryClient.clear();
            handleLogOut();
          }}
        >
          <LogOutIcon className="mr-2 size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserButton;
