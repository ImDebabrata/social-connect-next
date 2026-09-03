// frontend/src/hooks/useSocket.ts
import { io, Socket } from "socket.io-client";

/**
 * A single shared socket connection for the whole app.
 *
 * Previously useSocket() created a new socket per component (via useMemo),
 * so each mounted chat component opened its own connection. We now keep one
 * module-level singleton and hand it to every caller.
 *
 * Auth is cookie-based: the httpOnly `session` cookie is sent automatically
 * because of `withCredentials: true` (the server verifies it in io.use()).
 */
let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_CHAT_SERVICE_URL, {
      withCredentials: true, // send the session cookie during the handshake
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });
  }
  return socket;
}

export const useSocket = (): Socket => getSocket();
