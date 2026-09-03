// frontend/src/hooks/useSocket.ts
import { io, Socket } from "socket.io-client";

/**
 * A single shared socket connection for the whole app.
 *
 * Auth is cookie-based: the httpOnly `session` cookie is sent automatically
 * because of `withCredentials: true` and `sameSite: "none"` on the cookie.
 */
let socket: Socket | null = null;

function getSocket(): Socket | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_CHAT_SERVICE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });
  }
  return socket;
}

export const useSocket = (): Socket | null => getSocket();
