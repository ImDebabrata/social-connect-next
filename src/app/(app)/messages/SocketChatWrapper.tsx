"use client";
// import { useSocket } from "@/hooks/useSocket";
import ChatChannel from "./ChatChannel";
import ChatSidebar from "./ChatSidebar";
import { useEffect, useState } from "react";
import { UserData } from "@/lib/types";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { useSocket } from "@/hooks/useSocket";
import { useSearchParams } from "next/navigation";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
}

interface UserWithMessageInfo extends UserData {
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

export default function SocketChatWrapper() {
  const socket = useSocket();
  const { user } = useCurrentSession();
  const [usersWithMessages, setUsersWithMessages] = useState<UserWithMessageInfo[]>([]);
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get("userId");

  // Connect to socket and fetch users
  useEffect(() => {
    if (!socket || !user?.userId) return;

    const onConnect = () => {
      console.log('Connected to chat service');
      // Fetch users after connection
      socket.emit('getUsers', user.userId, (users: UserData[]) => {
        console.log('Users received:', users.length);
        // Initialize users with empty message data
        const initialUsers = users.map(user => ({
          ...user,
          unreadCount: 0
        }));
        setUsersWithMessages(initialUsers);
      });
    };

    const onDisconnect = () => {
      console.log('Disconnected from chat service');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // If already connected, fetch users
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket, user?.userId]);

  // Listen for new messages to update the user list
  useEffect(() => {
    if (!socket || !user?.userId) return;

    const handleNewMessage = (message: Message) => {
      const isMessageSentByUser = message.senderId === user.userId;
      const otherUserId = isMessageSentByUser ? message.receiverId : message.senderId;
      
      setUsersWithMessages(prevUsers => {
        return prevUsers.map(userItem => {
          // If this user is involved in the message
          if (userItem.id === otherUserId) {
            // Only increase unread count if:
            // 1. The message is not from the current user
            // 2. The message's sender is not the currently selected user
            const shouldIncreaseUnreadCount = 
              !isMessageSentByUser && otherUserId !== selectedUserId;
            
            return {
              ...userItem,
              lastMessage: message.content,
              lastMessageTime: new Date(message.createdAt),
              unreadCount: shouldIncreaseUnreadCount ? 
                userItem.unreadCount + 1 : userItem.unreadCount
            };
          }
          return userItem;
        });
      });
    };

    socket.on('chatMessage', handleNewMessage);

    // Initial loading of last messages for each user
    socket.emit('getLastMessages', { userId: user.userId }, (response: {
      success: boolean;
      data: { userId: string; message: Message | null; unreadCount: number }[]
    }) => {
      if (response.success) {
        setUsersWithMessages(prevUsers => {
          return prevUsers.map(userItem => {
            const userData = response.data.find(data => data.userId === userItem.id);
            if (userData && userData.message) {
              return {
                ...userItem,
                lastMessage: userData.message.content,
                lastMessageTime: new Date(userData.message.createdAt),
                unreadCount: userData.unreadCount
              };
            }
            return userItem;
          });
        });
      }
    });

    return () => {
      socket.off('chatMessage', handleNewMessage);
    };
  }, [socket, user?.userId, selectedUserId]);

  // Reset unread count when a user is selected
  useEffect(() => {
    if (!selectedUserId || !user?.userId) return;

    setUsersWithMessages(prevUsers => {
      return prevUsers.map(userItem => {
        if (userItem.id === selectedUserId) {
          return {
            ...userItem,
            unreadCount: 0
          };
        }
        return userItem;
      });
    });

    // Let the server know messages have been read
    if (socket) {
      socket.emit('markMessagesAsRead', {
        senderId: selectedUserId,
        receiverId: user.userId
      });
    }
  }, [selectedUserId, user?.userId, socket]);

//   if (!socket)
//     return <ImageConfig.LoadingIcon className="mx-auto my-3 animate-spin" />;
  return (
    <>
      <ChatSidebar userList={usersWithMessages} />
      <ChatChannel />
    </>
  );
}
