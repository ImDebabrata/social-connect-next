// frontend/src/hooks/useSocket.ts
import { useMemo } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const socket: Socket = useMemo(
    () =>
      io(process.env.NEXT_PUBLIC_CHAT_SERVICE_URL, {
        auth: { token: localStorage.getItem("token") },
        // Add these options:
        transports: ["websocket"], // Force WebSocket transport
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
      }),
    []
  );

  return socket;
};
