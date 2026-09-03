// frontend/src/hooks/useSocket.ts
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getSessionToken } from "@/app/action";

/**
 * A shared socket connection for the whole app.
 *
 * Auth is now token-based: we fetch the session JWT from a server action
 * (same-origin, so the httpOnly cookie is accessible) and pass it via
 * Socket.IO's `auth` handshake. This avoids the cross-domain cookie
 * limitation when the chat service is on a different domain (e.g. Render).
 */
let socket: Socket | null = null;
let tokenFetched = false;

async function initSocket(): Promise<Socket> {
  if (socket) return socket;

  // Fetch the JWT from the server action (reads the httpOnly cookie server-side)
  const token = await getSessionToken();

  socket = io(process.env.NEXT_PUBLIC_CHAT_SERVICE_URL, {
    withCredentials: true, // still useful if same-domain (local dev)
    auth: { token: token ?? undefined }, // explicit token for cross-domain
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  });

  tokenFetched = true;
  return socket;
}

export const useSocket = (): Socket | null => {
  const [sock, setSock] = useState<Socket | null>(socket);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    initSocket().then((s) => setSock(s));
  }, []);

  return sock;
};

