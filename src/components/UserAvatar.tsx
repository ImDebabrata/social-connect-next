import ImageConfig from "@/constrants/ImageConfig";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";


interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
}
function UserAvatar(props:UserAvatarProps) {
  const { avatarUrl, size, className } = props;
  
  return (
    <Image
      src={avatarUrl || ImageConfig.avatarPlaceholder}
      alt="UserAvatar"
      width={size ?? 48}
      height={size ?? 48}
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        className
      )}
    />
  );
}

export default UserAvatar;
