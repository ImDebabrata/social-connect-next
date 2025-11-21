import { Server, Socket } from "socket.io";
import http from "http";
import { PrismaClient, Message } from "@prisma/client";
import { 
  getUserDataSelect, 
  UserData,
  SuccessResponse,
  ErrorResponse,
  SocketResponse,
  LastMessageResult,
  ChatMessageResponse,
  UnreadMessageCount
} from "../lib/types";

const prisma = new PrismaClient();

// Keep track of unread messages in memory
// In a production app, this would be stored in a database
const unreadMessages: UnreadMessageCount = {};

export function initializeSocket(
  server: http.Server
) {
  const io = new Server(server, {
    cors: {
      origin: process.env.APP_URL || "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  io.on("connection", (socket: Socket) => {
    // console.log(`User connected: ${socket.id}`);

    // Get all users
    socket.on('getUsers',async(userId:string,callback:(users:UserData[])=>void)=>{
      try{
        const users = await prisma.user.findMany({
          where: {
            NOT: {
              id: userId,
            },
            // followers: {
            //   none: {
            //     followerId: userId,
            //   },
            // },
          },
          select: getUserDataSelect(userId),
        });
        console.log(users,'the users is here');
        callback(users);
      }catch(error){
        console.error("Error fetching users:",error);
      }
    })

    // Get last messages for each conversation
    socket.on("getLastMessages", async (data: { userId: string }, callback: (response: SocketResponse<LastMessageResult[]>) => void) => {
      try {
        const { userId } = data;
        
        // Get users that the current user has had conversations with
        const conversations = await prisma.message.findMany({
          where: {
            OR: [
              { senderId: userId },
              { receiverId: userId }
            ]
          },
          orderBy: {
            createdAt: 'desc'
          },
          distinct: ['senderId', 'receiverId']
        });
        
        // For each conversation, get the latest message and unread count
        const results = await Promise.all(
          conversations.map(async (conv: Message): Promise<LastMessageResult> => {
            // Determine the other user in the conversation
            const otherUserId = conv.senderId === userId ? conv.receiverId : conv.senderId;
            
            // Get latest message
            const latestMessage = await prisma.message.findFirst({
              where: {
                OR: [
                  { 
                    senderId: userId,
                    receiverId: otherUserId 
                  },
                  { 
                    senderId: otherUserId,
                    receiverId: userId 
                  }
                ]
              },
              orderBy: {
                createdAt: 'desc'
              }
            });
            
            // Get unread count
            let unreadCount = 0;
            if (unreadMessages[userId] && unreadMessages[userId][otherUserId]) {
              unreadCount = unreadMessages[userId][otherUserId];
            }
            
            return {
              userId: otherUserId,
              message: latestMessage,
              unreadCount
            };
          })
        );
        
        callback({ success: true, data: results });
      } catch (error) {
        console.error("Error fetching last messages:", error);
        callback({ success: false, error: "Failed to fetch last messages" });
      }
    });

    // Mark messages as read
    socket.on("markMessagesAsRead", async (data: { senderId: string, receiverId: string }) => {
      try {
        const { senderId, receiverId } = data;
        
        // Clear unread message count
        if (!unreadMessages[receiverId]) {
          unreadMessages[receiverId] = {};
        }
        unreadMessages[receiverId][senderId] = 0;
        
        // In a real app, you would also update the database
        // For now, we're just using in-memory storage
        
        console.log(`Marked messages from ${senderId} to ${receiverId} as read`);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // Get conversation history
    socket.on("getConversation", async (data: { senderId: string; receiverId: string }, callback: (response: SocketResponse<Message[]>) => void) => {
      try {
        const messages = await prisma.message.findMany({
          where: {
            OR: [
              { 
                senderId: data.senderId,
                receiverId: data.receiverId 
              },
              { 
                senderId: data.receiverId,
                receiverId: data.senderId 
              }
            ]
          },
          orderBy: {
            createdAt: 'asc'
          }
        });
        
        // Mark messages as read when conversation is opened
        if (!unreadMessages[data.senderId]) {
          unreadMessages[data.senderId] = {};
        }
        unreadMessages[data.senderId][data.receiverId] = 0;
        
        callback({ success: true, data: messages });
      } catch (error) {
        console.error("Error fetching conversation:", error);
        callback({ success: false, error: "Failed to fetch conversation" });
      }
    });

    // Listen for chat messages
    socket.on("chatMessage", async (data: { senderId: string; receiverId: string; content: string }, callback?: (response: SocketResponse<ChatMessageResponse>) => void) => {
      try {
        // Store message in database
        const message = await prisma.message.create({
          data: {
            content: data.content,
            senderId: data.senderId,
            receiverId: data.receiverId
          }
        });
        
        // Increment unread message count for the recipient
        if (!unreadMessages[data.receiverId]) {
          unreadMessages[data.receiverId] = {};
        }
        if (!unreadMessages[data.receiverId][data.senderId]) {
          unreadMessages[data.receiverId][data.senderId] = 0;
        }
        unreadMessages[data.receiverId][data.senderId]++;
        
        // Broadcast the message to all clients
        io.emit("chatMessage", message);
        
        // Return success with the created message for acknowledgment
        if (callback) callback({ success: true, data: { ...message, success: true } });
      } catch (error) {
        console.error("Error saving message:", error);
        if (callback) callback({ success: false, error: "Failed to save message" });
      }
    });

    // Listen for typing indicator events
    socket.on("typingStarted", (data: { senderId: string; receiverId: string }) => {
      // Broadcast to everyone except the sender
      socket.broadcast.emit("userTyping", data);
    });

    socket.on("typingStopped", (data: { senderId: string; receiverId: string }) => {
      // Broadcast to everyone except the sender
      socket.broadcast.emit("userStoppedTyping", data);
    });

    // Listen for status update (online/offline)
    // socket.on("updateStatus", async (data: { userId: string; status: string }) => {
    //   try {
    //     // Update user status in database
    //     await prisma.user.update({
    //       where: { id: data.userId },
    //       data: { status: data.status }
    //     });
        
    //     // Broadcast status update
    //     io.emit("updateStatus", data);
    //   } catch (error) {
    //     console.error("Error updating status:", error);
    //   }
    // });

    // socket.on("disconnect", async () => {
    //   console.log(`User disconnected: ${socket.id}`);
      
    //   // If you have the user ID stored in socket, you can update their status to offline
    //   const userId = socket.data?.userId;
    //   if (userId) {
    //     try {
    //       await prisma.user.update({
    //         where: { id: userId },
    //         data: { status: "offline" }
    //       });
          
    //       io.emit("updateStatus", { userId, status: "offline" });
    //     } catch (error) {
    //       console.error("Error updating status on disconnect:", error);
    //     }
    //   }
    // });
  });
}
