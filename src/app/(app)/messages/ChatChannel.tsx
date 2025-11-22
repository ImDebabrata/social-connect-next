"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import UserAvatar from "@/components/UserAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useMemo } from "react";
import { UserData } from "@/lib/types";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
}

export default function ChatChannel() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const socket = useSocket();
  const { user } = useCurrentSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get available users from socket context
  const [availableUsers, setAvailableUsers] = useState<UserData[]>([]);

  // Get selected user details
  useEffect(() => {
    if (!userId || !socket) return;
    
    // Get users list if we don't have it yet
    if (availableUsers.length === 0) {
      socket.emit('getUsers', user?.userId, (users: UserData[]) => {
        setAvailableUsers(users);
        const selectedUserData = users.find(u => u.id === userId);
        if (selectedUserData) {
          setSelectedUser(selectedUserData);
        }
      });
    } else {
      // Find user in existing list
      const selectedUserData = availableUsers.find(u => u.id === userId);
      if (selectedUserData) {
        setSelectedUser(selectedUserData);
      }
    }
  }, [userId, availableUsers, socket, user?.userId]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation when userId changes
  useEffect(() => {
    if (!userId || !user?.userId || !socket) return;

    // Get conversation history
    socket.emit(
      "getConversation",
      { senderId: user.userId, receiverId: userId },
      (response: { success: boolean; data: Message[] }) => {
        if (response.success) {
          setMessages(response.data);
        }
      }
    );

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      if (
        (message.senderId === user.userId && message.receiverId === userId) ||
        (message.senderId === userId && message.receiverId === user.userId)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    // Listen for typing indicators
    const handleTyping = (data: { senderId: string; receiverId: string }) => {
      if (data.senderId === userId && data.receiverId === user.userId) {
        setIsTyping(true);
      }
    };

    const handleStoppedTyping = (data: { senderId: string; receiverId: string }) => {
      if (data.senderId === userId && data.receiverId === user.userId) {
        setIsTyping(false);
      }
    };

    socket.on("chatMessage", handleNewMessage);
    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStoppedTyping);

    return () => {
      socket.off("chatMessage", handleNewMessage);
      socket.off("userTyping", handleTyping);
      socket.off("userStoppedTyping", handleStoppedTyping);
    };
  }, [userId, user?.userId, socket]);

  // Handle typing indicator
  useEffect(() => {
    if (!userId || !user?.userId || !socket) return;

    let typingTimeout: NodeJS.Timeout | null = null;
    
    if (messageInput.trim()) {
      socket.emit("typingStarted", { senderId: user.userId, receiverId: userId });
      
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit("typingStopped", { senderId: user.userId, receiverId: userId });
      }, 2000);
    }

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [userId, user?.userId, socket, messageInput]);

  const sendMessage = () => {
    if (!messageInput.trim() || !userId || !user?.userId || !socket) return;

    socket.emit(
      "chatMessage",
      {
        senderId: user.userId,
        receiverId: userId,
        content: messageInput.trim(),
      },
      () => {
        setMessageInput("");
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format messages for display, grouping consecutive messages from the same user
  const formattedMessages = useMemo(() => {
    const result: { sender: string; messages: Message[]; isCurrentUser: boolean }[] = [];
    let currentGroup: { sender: string; messages: Message[]; isCurrentUser: boolean } | null = null;

    messages.forEach(message => {
      const isCurrentUser = message.senderId === user?.userId;
      const sender = message.senderId;

      if (!currentGroup || currentGroup.sender !== sender) {
        if (currentGroup) {
          result.push(currentGroup);
        }
        currentGroup = { sender, messages: [message], isCurrentUser };
      } else {
        currentGroup.messages.push(message);
      }
    });

    if (currentGroup) {
      result.push(currentGroup);
    }

    return result;
  }, [messages, user?.userId]);

  if (!userId) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium">Select a conversation</h3>
          <p className="text-sm text-muted-foreground">
            Choose a user from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Chat header */}
      {selectedUser && (
        <div className="border-b p-3 flex items-center gap-3">
          <UserAvatar avatarUrl={selectedUser.avatarUrl} size={40} />
          <div>
            <h3 className="font-medium">{selectedUser.displayName}</h3>
            {isTyping && <p className="text-xs text-muted-foreground">Typing...</p>}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {formattedMessages.map((group, groupIndex) => (
          <div key={groupIndex} className={`flex ${group.isCurrentUser ? "justify-end" : "justify-start"}`}>
            <div className="flex flex-col gap-1 max-w-[70%]">
              {group.messages.map((message, messageIndex) => (
                <div
                  key={message.id}
                  className={`rounded-lg p-3 ${
                    group.isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p>{message.content}</p>
                  {messageIndex === group.messages.length - 1 && (
                    <span className="text-xs opacity-70">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t p-3 flex gap-2">
        <Input
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button size="icon" onClick={sendMessage} disabled={!messageInput.trim()}>
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
}