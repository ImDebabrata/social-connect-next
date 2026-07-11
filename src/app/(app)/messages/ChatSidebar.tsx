"use client";
import UserAvatar from "@/components/UserAvatar";
import RouteConfig from "@/constrants/RouteConfig";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { UserWithMessageInfo } from "./SocketChatWrapper";
import { formatChatListTime } from "@/lib/utils";

export default function ChatSidebar({
  userList,
  onlineUserIds,
}: {
  userList: UserWithMessageInfo[];
  onlineUserIds: Set<string>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get("userId");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectUser = (userId: string) => {
    router.push(`${RouteConfig.protectedRoute.MESSAGES}?userId=${userId}`);
  };

  const handleEscapeKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push(RouteConfig.protectedRoute.MESSAGES);
    },
    [router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [handleEscapeKey]);

  const sortedUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return userList
      .filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          (u.bio && u.bio.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
        if (a.lastMessageTime && b.lastMessageTime)
          return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
        if (a.lastMessageTime) return -1;
        if (b.lastMessageTime) return 1;
        return a.displayName.localeCompare(b.displayName);
      });
  }, [userList, searchQuery]);

  return (
    <div className="flex size-full flex-col bg-card">
      {/* Header */}
      <div className="border-b p-3">
        <h2 className="mb-3 px-1 text-lg font-semibold">Messages</h2>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search people…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-full pl-9"
            aria-label="Search people"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-1.5">
        {sortedUsers.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No people found
          </p>
        ) : (
          sortedUsers.map((user) => {
            const active = selectedUserId === user.id;
            const online = onlineUserIds.has(user.id);
            const hasUnread = user.unreadCount > 0;
            return (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user.id)}
                className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors ${
                  active ? "bg-accent" : "hover:bg-accent/60"
                }`}
              >
                <div className="relative shrink-0">
                  <UserAvatar avatarUrl={user.avatarUrl} size={44} />
                  {online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={`truncate text-sm ${
                        hasUnread ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {user.displayName}
                    </p>
                    {user.lastMessageTime && (
                      <span
                        className={`shrink-0 text-[11px] ${
                          hasUnread
                            ? "font-medium text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatChatListTime(user.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p
                      className={`truncate text-xs ${
                        hasUnread
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {user.lastMessage || "Start a conversation"}
                    </p>
                    {hasUnread && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                        {user.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
