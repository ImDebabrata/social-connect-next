"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import UserAvatar from "@/components/UserAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, Check, CheckCheck, MessagesSquare } from "lucide-react";
import RouteConfig from "@/constrants/RouteConfig";
import { UserData, ChatMessage as Message } from "@/lib/types";
import { formatDayLabel, formatMessageTime } from "@/lib/utils";

interface ChatChannelProps {
  selectedUser: UserData | null;
  isOnline: boolean;
}

export default function ChatChannel({ selectedUser, isOnline }: ChatChannelProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId");
  const socket = useSocket();
  const { user } = useCurrentSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load conversation + subscribe to live events for this thread.
  useEffect(() => {
    if (!userId || !user?.userId || !socket) return;

    // Clear the previous thread's messages so they don't flash under the new
    // header (and never linger if getConversation fails).
    setMessages([]);

    socket.emit(
      "getConversation",
      { otherUserId: userId },
      (response: { success: boolean; data: Message[] }) => {
        if (response.success) setMessages(response.data);
      }
    );

    const handleNewMessage = (message: Message) => {
      const inThisThread =
        (message.senderId === user.userId && message.receiverId === userId) ||
        (message.senderId === userId && message.receiverId === user.userId);
      if (!inThisThread) return;

      // Ignore a message we already have (send/load race can echo a duplicate).
      setMessages((prev) =>
        prev.some((m) => m.id === message.id) ? prev : [...prev, message]
      );

      // If it's an incoming message and we're looking at the thread, read it now.
      if (message.senderId === userId) {
        socket.emit("markMessagesAsRead", { otherUserId: userId });
      }
    };

    // The other user read our messages -> flip our sent messages to read.
    const handleMessagesRead = (data: { readerId: string }) => {
      if (data.readerId !== userId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === user.userId ? { ...m, read: true } : m
        )
      );
    };

    const handleTyping = (data: { senderId: string }) => {
      if (data.senderId === userId) setIsTyping(true);
    };
    const handleStoppedTyping = (data: { senderId: string }) => {
      if (data.senderId === userId) setIsTyping(false);
    };

    socket.on("chatMessage", handleNewMessage);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStoppedTyping);

    return () => {
      socket.off("chatMessage", handleNewMessage);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("userTyping", handleTyping);
      socket.off("userStoppedTyping", handleStoppedTyping);
      setIsTyping(false);
    };
  }, [userId, user?.userId, socket]);

  // Whether we currently have an active "typing" signalled to the peer. Lets us
  // emit typingStarted/Stopped only on transitions (not once per keystroke).
  const typingRef = useRef(false);
  const stopTyping = () => {
    if (typingRef.current && userId && socket) {
      typingRef.current = false;
      socket.emit("typingStopped", { receiverId: userId });
    }
  };

  // Typing indicator: start on the first keystroke, auto-stop after 2s idle.
  useEffect(() => {
    if (!userId || !user?.userId || !socket) return;
    if (!messageInput.trim()) {
      stopTyping();
      return;
    }
    if (!typingRef.current) {
      typingRef.current = true;
      socket.emit("typingStarted", { receiverId: userId });
    }
    const t = setTimeout(stopTyping, 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, user?.userId, socket, messageInput]);

  // Clear a lingering "typing…" on the peer when we leave the thread / unmount.
  useEffect(() => stopTyping, [userId, socket]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = () => {
    const content = messageInput.trim();
    if (!content || !userId || !user?.userId || !socket) return;
    stopTyping();
    socket.emit("chatMessage", { receiverId: userId, content });
    setMessageInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Group consecutive messages from the same sender for tighter bubbles.
  const groups = useMemo(() => {
    const messageGroups: { senderId: string; isMine: boolean; messages: Message[] }[] = [];
    for (const message of messages) {
      const isMine = message.senderId === user?.userId;
      const currentGroup = messageGroups[messageGroups.length - 1];
      if (currentGroup && currentGroup.senderId === message.senderId) {
        currentGroup.messages.push(message);
      } else {
        messageGroups.push({ senderId: message.senderId, isMine, messages: [message] });
      }
    }
    return messageGroups;
  }, [messages, user?.userId]);

  // My most recent message (single backward scan, memoized) — drives the receipt tick.
  const lastMine = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId === user?.userId) return messages[i];
    }
    return undefined;
  }, [messages, user?.userId]);

  // Empty state — no conversation selected (desktop only; mobile shows the list).
  if (!userId) {
    return (
      <div className="hidden md:flex h-full w-full flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <MessagesSquare className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium">Your messages</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a conversation to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-3 py-2.5">
        <button
          onClick={() => router.push(RouteConfig.protectedRoute.MESSAGES)}
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent md:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative">
          <UserAvatar avatarUrl={selectedUser?.avatarUrl ?? null} size={40} />
          {isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold leading-tight">
            {selectedUser?.displayName ?? "…"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isTyping ? (
              <span className="text-primary">typing…</span>
            ) : isOnline ? (
              "Active now"
            ) : (
              "Offline"
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-1 overflow-y-auto px-3 py-4 sm:px-4">
        {groups.map((group, gi) => {
          const prevGroup = groups[gi - 1];
          const showDay =
            !prevGroup ||
            new Date(prevGroup.messages[0].createdAt).toDateString() !==
              new Date(group.messages[0].createdAt).toDateString();
          return (
            <div key={gi}>
              {showDay && (
                <div className="my-4 flex justify-center">
                  <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
                    {formatDayLabel(group.messages[0].createdAt)}
                  </span>
                </div>
              )}
              <div
                className={`flex ${group.isMine ? "justify-end" : "justify-start"}`}
              >
                <div className="flex max-w-[78%] flex-col gap-0.5 sm:max-w-[65%]">
                  {group.messages.map((message, mi) => {
                    const isLast = mi === group.messages.length - 1;
                    return (
                      <div
                        key={message.id}
                        className={`group/msg w-fit ${group.isMine ? "self-end" : "self-start"}`}
                      >
                        <div
                          className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                            group.isMine
                              ? `bg-primary text-primary-foreground ${isLast ? "rounded-br-md" : ""}`
                              : `bg-muted text-foreground ${isLast ? "rounded-bl-md" : ""}`
                          }`}
                        >
                          <span className="whitespace-pre-wrap break-words">
                            {message.content}
                          </span>
                        </div>
                        {isLast && (
                          <div
                            className={`mt-0.5 flex items-center gap-1 px-1 text-[10px] text-muted-foreground ${
                              group.isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <span>{formatMessageTime(message.createdAt)}</span>
                            {group.isMine &&
                              message.id === lastMine?.id &&
                              (lastMine?.read ? (
                                <CheckCheck className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="flex items-end gap-2 border-t p-3">
        <Input
          placeholder="Type a message…"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-full"
          aria-label="Message"
        />
        <Button
          size="icon"
          onClick={sendMessage}
          disabled={!messageInput.trim()}
          className="h-10 w-10 shrink-0 rounded-full"
          aria-label="Send message"
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
}
