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
import { handleLogOut } from "@/app/action";

interface UserButtonProps {
  className?: string;
}

function UserButton(props: UserButtonProps) {
  const { className } = props;
  //   console.log(document.cookie,'the cookie')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar size={40} avatarUrl={""} className={className} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon className="mr-2 size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={()=>handleLogOut()}>
          <LogOutIcon className="mr-2 size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserButton;
