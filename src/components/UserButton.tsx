"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
import { LogOutIcon, UserIcon } from "lucide-react";
import { getCurrentUser, handleLogOut } from "@/app/action";
import { useQuery } from "@tanstack/react-query";

interface UserButtonProps {
  className?: string;
}

function UserButton(props: UserButtonProps) {
  const { className } = props;

  const { data } = useQuery({
    queryKey: ["current user info"],
    staleTime: Infinity,
    queryFn: getCurrentUser,
  });
  const { avatarUrl = "" } = data || {};
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className}>
        <UserAvatar size={40} avatarUrl={avatarUrl} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon className="mr-2 size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLogOut()}>
          <LogOutIcon className="mr-2 size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserButton;
