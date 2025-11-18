// import { getCurrentUser } from "@/app/action";
"use client";
import UserAvatar from "@/components/UserAvatar";
import RouteConfig from "@/constrants/RouteConfig";
import { UserData } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

interface UserWithMessageInfo extends UserData {
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

export default function ChatSidebar({
  userList,
}: {
  userList: UserWithMessageInfo[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get("userId");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectUser = (userId: string) => {
    console.log(userId);
    // Set user id to search params
    router.push(`${RouteConfig.protectedRoute.MESSAGES}?userId=${userId}`);
  };

  // On click on esc key should delete the search params
  const handleEscapeKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push(RouteConfig.protectedRoute.MESSAGES);
      }
    },
    [router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleEscapeKey);
    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [handleEscapeKey]);

  // Filter users based on search query
  const filteredUsers = userList.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort users: first by unread messages, then by last message time
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    // First sort by unread count (descending)
    if (a.unreadCount !== b.unreadCount) {
      return b.unreadCount - a.unreadCount;
    }

    // Then sort by message time (newest first)
    if (a.lastMessageTime && b.lastMessageTime) {
      return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
    }

    // Put users with messages above those without
    if (a.lastMessageTime && !b.lastMessageTime) return -1;
    if (!a.lastMessageTime && b.lastMessageTime) return 1;

    // Default sorting by name
    return a.displayName.localeCompare(b.displayName);
  });

  return (
    <div className="size-full flex flex-col border-e md:w-72">
      {/* Search bar */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* User list */}
      <div className="overflow-y-auto flex-1">
        {sortedUsers.length === 0 ? (
          <p className="text-center p-4 text-muted-foreground">
            No users found
          </p>
        ) : (
          sortedUsers.map((user, index) => (
            <div
              onClick={() => handleSelectUser(user.id)}
              key={index}
              className={`flex items-center gap-2 p-3 hover:bg-accent cursor-pointer ${
                selectedUserId === user.id ? "bg-accent" : ""
              }`}
            >
              <UserAvatar avatarUrl={user.avatarUrl} size={40} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium truncate">
                    {user.displayName}
                  </p>
                  {user.lastMessageTime && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {new Date(user.lastMessageTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                    {user.lastMessage || "Start a conversation"}
                  </p>
                  {user.unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                      {user.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
