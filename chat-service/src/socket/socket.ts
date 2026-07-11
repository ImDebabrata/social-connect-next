import { Server, Socket } from "socket.io";
import http from "http";
import { PrismaClient, Message, Prisma } from "@prisma/client";
import {
  getUserDataSelect,
  UserData,
  SocketResponse,
  LastMessageResult,
  ChatMessageResponse,
} from "../lib/types";
import { authenticateSocket } from "./auth";

export const prisma = new PrismaClient();

const MAX_MESSAGE_LENGTH = 4000;
const CONVERSATION_PAGE_SIZE = 50;

/**
 * In-memory presence map: userId -> set of that user's live socket ids.
 * A user is "online" while they have at least one socket connected.
 *
 * NOTE: this is per-process. To scale to multiple chat-service instances you
 * must add the Redis adapter (@socket.io/redis-adapter) so rooms/emits fan out
 * across processes, and back presence with Redis instead of this Map.
 */
const onlineUsers = new Map<string, Set<string>>();

function addOnline(userId: string, socketId: string): boolean {
  let sockets = onlineUsers.get(userId);
  const wasOffline = !sockets || sockets.size === 0;
  if (!sockets) {
    sockets = new Set();
    onlineUsers.set(userId, sockets);
  }
  sockets.add(socketId);
  return wasOffline; // true when this is the user's first live socket
}

function removeOnline(userId: string, socketId: string): boolean {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineUsers.delete(userId);
    return true; // true when the user's last socket just left
  }
  return false;
}

export function initializeSocket(server: http.Server): Server {
  const io = new Server(server, {
    cors: {
      origin: process.env.APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Reject any connection without a valid session cookie/token.
  io.use(authenticateSocket);

  io.on("connection", (socket: Socket) => {
    const userId: string = socket.data.userId;

    // Join a room named after the user so we can target them across all their
    // devices/tabs with io.to(userId).
    socket.join(userId);

    // Presence: tell everyone else this user came online (only on first socket),
    // and hand the newcomer the current online roster.
    const cameOnline = addOnline(userId, socket.id);
    if (cameOnline) {
      socket.broadcast.emit("presence:update", { userId, online: true });
    }
    socket.emit("presence:init", Array.from(onlineUsers.keys()));

    // Allow a (re)mounted client to re-sync the online roster on demand, since
    // presence:init only fires once per physical connection.
    socket.on("presence:get", (callback: (ids: string[]) => void) => {
      if (typeof callback === "function") callback(Array.from(onlineUsers.keys()));
    });

    // Mark all unread messages from `otherUserId` to this user as read, and let
    // the sender know (read receipts). Shared by markMessagesAsRead + getConversation.
    const markConversationRead = async (otherUserId: string) => {
      const { count } = await prisma.message.updateMany({
        where: { senderId: otherUserId, receiverId: userId, read: false },
        data: { read: true, readAt: new Date() },
      });
      if (count > 0) {
        io.to(otherUserId).emit("messagesRead", { readerId: userId });
      }
    };

    // ---- Get all other users --------------------------------------------
    socket.on("getUsers", async (_arg, callback: (users: UserData[]) => void) => {
      try {
        const users = await prisma.user.findMany({
          where: { NOT: { id: userId } },
          select: getUserDataSelect(userId),
        });
        if (typeof callback === "function") callback(users as UserData[]);
      } catch (error) {
        console.error("Error fetching users:", error);
        if (typeof callback === "function") callback([]);
      }
    });

    // ---- Last message + unread count per conversation --------------------
    socket.on(
      "getLastMessages",
      async (
        _data: unknown,
        callback: (response: SocketResponse<LastMessageResult[]>) => void
      ) => {
        try {
          // Latest message per partner (DISTINCT ON) and unread counts grouped
          // by sender are independent — run them in parallel.
          const [latest, unreadGroups] = await Promise.all([
            prisma.$queryRaw<(Message & { partner: string })[]>(Prisma.sql`
              SELECT DISTINCT ON (partner) *
              FROM (
                SELECT *,
                  CASE WHEN "senderId" = ${userId}
                       THEN "receiverId" ELSE "senderId" END AS partner
                FROM "Message"
                WHERE "senderId" = ${userId} OR "receiverId" = ${userId}
              ) sub
              ORDER BY partner, "createdAt" DESC
            `),
            prisma.message.groupBy({
              by: ["senderId"],
              where: { receiverId: userId, read: false },
              _count: { _all: true },
            }),
          ]);

          const unreadBySender = new Map(
            unreadGroups.map((g) => [g.senderId, g._count._all])
          );

          const results: LastMessageResult[] = latest.map((row) => {
            const { partner, ...message } = row;
            return {
              userId: partner,
              message,
              unreadCount: unreadBySender.get(partner) ?? 0,
            };
          });

          callback({ success: true, data: results });
        } catch (error) {
          console.error("Error fetching last messages:", error);
          callback({ success: false, error: "Failed to fetch last messages" });
        }
      }
    );

    // ---- Mark a conversation's incoming messages as read -----------------
    socket.on(
      "markMessagesAsRead",
      async (data: { otherUserId: string }) => {
        try {
          const { otherUserId } = data;
          if (!otherUserId) return;
          await markConversationRead(otherUserId);
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      }
    );

    // ---- Conversation history (and mark incoming as read) ----------------
    socket.on(
      "getConversation",
      async (
        data: { otherUserId: string },
        callback: (response: SocketResponse<Message[]>) => void
      ) => {
        try {
          const otherUserId = data.otherUserId;
          if (!otherUserId) {
            return callback({ success: false, error: "otherUserId is required" });
          }

          // Mark incoming messages read first, then fetch, so the returned rows
          // are correct by construction (no read-after-write race, no patching).
          await markConversationRead(otherUserId);
          const messages = await prisma.message.findMany({
            where: {
              OR: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId },
              ],
            },
            orderBy: { createdAt: "desc" },
            take: CONVERSATION_PAGE_SIZE,
          });
          messages.reverse(); // oldest -> newest for display

          callback({ success: true, data: messages });
        } catch (error) {
          console.error("Error fetching conversation:", error);
          callback({ success: false, error: "Failed to fetch conversation" });
        }
      }
    );

    // ---- Send a chat message --------------------------------------------
    socket.on(
      "chatMessage",
      async (
        data: { receiverId: string; content: string },
        callback?: (response: SocketResponse<ChatMessageResponse>) => void
      ) => {
        try {
          const receiverId = data?.receiverId;
          const content = (data?.content ?? "").trim();

          // Validate: senderId comes from the authenticated socket, never the
          // client, so a user can only ever send *as themselves*.
          if (!receiverId || receiverId === userId) {
            return callback?.({ success: false, error: "Invalid recipient" });
          }
          if (!content) {
            return callback?.({ success: false, error: "Message is empty" });
          }
          if (content.length > MAX_MESSAGE_LENGTH) {
            return callback?.({ success: false, error: "Message too long" });
          }

          const message = await prisma.message.create({
            data: { content, senderId: userId, receiverId, read: false },
          });

          // Deliver only to the two participants (their rooms), not everyone.
          io.to(userId).to(receiverId).emit("chatMessage", message);

          callback?.({ success: true, data: { ...message, success: true } });
        } catch (error) {
          console.error("Error saving message:", error);
          callback?.({ success: false, error: "Failed to save message" });
        }
      }
    );

    // ---- Typing indicators (targeted to the recipient only) --------------
    // Track who we're typing to so we can send a stop if the socket drops.
    let typingTo: string | null = null;

    socket.on("typingStarted", (data: { receiverId: string }) => {
      if (data?.receiverId) {
        typingTo = data.receiverId;
        io.to(data.receiverId).emit("userTyping", { senderId: userId });
      }
    });

    socket.on("typingStopped", (data: { receiverId: string }) => {
      if (data?.receiverId) {
        if (typingTo === data.receiverId) typingTo = null;
        io.to(data.receiverId).emit("userStoppedTyping", { senderId: userId });
      }
    });

    // ---- Disconnect / presence ------------------------------------------
    socket.on("disconnect", () => {
      // Clear a dangling typing indicator on the peer if we dropped mid-type.
      if (typingTo) {
        io.to(typingTo).emit("userStoppedTyping", { senderId: userId });
      }
      const wentOffline = removeOnline(userId, socket.id);
      if (wentOffline) {
        socket.broadcast.emit("presence:update", { userId, online: false });
      }
    });
  });

  return io;
}
