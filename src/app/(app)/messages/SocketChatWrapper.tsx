"use client";
import ChatChannel from "./ChatChannel";
import ChatSidebar from "./ChatSidebar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UserData, ChatMessage as Message } from "@/lib/types";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { useSocket } from "@/hooks/useSocket";
import { useSearchParams } from "next/navigation";
import ImageConfig from "@/constrants/ImageConfig";

export interface UserWithMessageInfo extends UserData {
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

export default function SocketChatWrapper() {
  const socket = useSocket();
  const { user } = useCurrentSession();
  const [usersWithMessages, setUsersWithMessages] = useState<UserWithMessageInfo[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState(false);
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get("userId");

  // At most one unknown-partner roster refetch in flight at a time.
  const rosterRefetchPending = useRef(false);

  const loadLastMessages = useCallback(() => {
    if (!socket || !user?.userId) return;
    socket.emit(
      "getLastMessages",
      { userId: user.userId },
      (response: {
        success: boolean;
        data: { userId: string; message: Message | null; unreadCount: number }[];
      }) => {
        if (!response.success) return;
        const byId = new Map(response.data.map((d) => [d.userId, d]));
        setUsersWithMessages((prev) =>
          prev.map((item) => {
            const d = byId.get(item.id);
            if (d && d.message) {
              return {
                ...item,
                lastMessage: d.message.content,
                lastMessageTime: new Date(d.message.createdAt),
                unreadCount: d.unreadCount,
              };
            }
            return item;
          })
        );
      }
    );
  }, [socket, user?.userId]);

  const loadUsers = useCallback(() => {
    if (!socket || !user?.userId) return;
    // Re-sync presence in case this component mounted after connect.
    socket.emit("presence:get", (ids: string[]) => setOnlineUserIds(new Set(ids)));
    socket.emit("getUsers", user.userId, (users: UserData[]) => {
      rosterRefetchPending.current = false;
      setUsersWithMessages((prev) => {
        const byId = new Map(prev.map((u) => [u.id, u]));
        return users.map((u) => ({
          ...u,
          lastMessage: byId.get(u.id)?.lastMessage,
          lastMessageTime: byId.get(u.id)?.lastMessageTime,
          unreadCount: byId.get(u.id)?.unreadCount ?? 0,
        }));
      });
      loadLastMessages();
    });
  }, [socket, user?.userId, loadLastMessages]);

  // Connect + fetch users, and track presence.
  useEffect(() => {
    if (!socket || !user?.userId) return;

    const onPresenceInit = (ids: string[]) => setOnlineUserIds(new Set(ids));
    const onPresenceUpdate = ({ userId: id, online }: { userId: string; online: boolean }) =>
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (online) next.add(id);
        else next.delete(id);
        return next;
      });

    const onConnect = () => {
      setConnected(true);
      loadUsers();
    };
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("presence:init", onPresenceInit);
    socket.on("presence:update", onPresenceUpdate);
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("presence:init", onPresenceInit);
      socket.off("presence:update", onPresenceUpdate);
    };
  }, [socket, user?.userId, loadUsers]);

  // The open conversation, read inside the message listener without making it a
  // dependency (so the listener binds once, not on every conversation switch).
  const selectedUserIdRef = useRef(selectedUserId);
  selectedUserIdRef.current = selectedUserId;

  // Keep the sidebar's last message / unread badge in sync with live messages.
  useEffect(() => {
    if (!socket || !user?.userId) return;

    const handleNewMessage = (message: Message) => {
      const isMine = message.senderId === user.userId;
      const otherUserId = isMine ? message.receiverId : message.senderId;
      const bumpUnread = !isMine && otherUserId !== selectedUserIdRef.current;

      setUsersWithMessages((prev) => {
        // Unknown conversation partner (e.g. a user created after getUsers ran):
        // refetch the roster once (coalesced) so a row for them appears.
        if (!prev.some((item) => item.id === otherUserId)) {
          if (!rosterRefetchPending.current) {
            rosterRefetchPending.current = true;
            loadUsers();
          }
          return prev;
        }
        return prev.map((item) =>
          item.id === otherUserId
            ? {
                ...item,
                lastMessage: message.content,
                lastMessageTime: new Date(message.createdAt),
                unreadCount: bumpUnread ? item.unreadCount + 1 : item.unreadCount,
              }
            : item
        );
      });
    };

    socket.on("chatMessage", handleNewMessage);
    return () => {
      socket.off("chatMessage", handleNewMessage);
    };
  }, [socket, user?.userId, loadUsers]);

  // Clear unread when a conversation is opened. The server marks the messages
  // read via getConversation (fired by ChatChannel), so no emit is needed here.
  useEffect(() => {
    if (!selectedUserId || !user?.userId) return;
    setUsersWithMessages((prev) =>
      prev.map((item) =>
        item.id === selectedUserId ? { ...item, unreadCount: 0 } : item
      )
    );
  }, [selectedUserId, user?.userId]);

  const selectedUser = useMemo(
    () => usersWithMessages.find((u) => u.id === selectedUserId) ?? null,
    [usersWithMessages, selectedUserId]
  );

  return (
    <div className="flex h-full w-full flex-col">
      {/* The chat service is a separate free-tier deployment, so the first
          connection after it idles can take up to a minute. */}
      {!connected && (
        <div className="flex items-center gap-2 border-b bg-muted px-4 py-2 text-xs text-muted-foreground">
          <ImageConfig.LoadingIcon className="size-3.5 shrink-0 animate-spin" />
          <span>
            Connecting to the chat service… it&apos;s hosted on a free tier and
            can take up to a minute to wake up.
          </span>
        </div>
      )}

      <div className="flex min-h-0 w-full flex-1">
        {/* Conversation list: full-width on mobile, fixed rail on desktop.
            Hidden on mobile once a conversation is open. */}
        <div
          className={`${
            selectedUserId ? "hidden md:flex" : "flex"
          } w-full shrink-0 flex-col border-e md:w-80`}
        >
          <ChatSidebar userList={usersWithMessages} onlineUserIds={onlineUserIds} />
        </div>

        {/* Thread: hidden on mobile until a conversation is open. */}
        <div
          className={`${
            selectedUserId ? "flex" : "hidden md:flex"
          } min-w-0 flex-1`}
        >
          <ChatChannel
            selectedUser={selectedUser}
            isOnline={selectedUserId ? onlineUserIds.has(selectedUserId) : false}
          />
        </div>
      </div>
    </div>
  );
}
