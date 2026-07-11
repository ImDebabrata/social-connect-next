import { Socket } from "socket.io";
import { jwtVerify } from "jose";

/**
 * Minimal cookie-header parser (avoids a dependency whose package `exports`
 * map trips up CommonJS module resolution). Handles the standard
 * `k=v; k2=v2` header format.
 */
function parseCookie(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

/**
 * Name of the session cookie set by the Next.js app (see src/constrants/Misc.ts).
 * Keep this in sync with `Misc.SESSION_COOKIE`.
 */
const SESSION_COOKIE = "session";

// Read the secret lazily (and memoize) so it's resolved *after* dotenv has run
// in index.ts, not at import time.
let cachedKey: Uint8Array | null = null;
function getKey(): Uint8Array {
  if (cachedKey) return cachedKey;
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error(
      "JWT_SECRET is not set. The chat-service cannot verify session tokens without it."
    );
  }
  cachedKey = new TextEncoder().encode(secretKey);
  return cachedKey;
}

/**
 * Shape of the JWT payload issued by the web app's stateless session
 * (see src/lib/stateless-session.ts / SessionPayload).
 */
interface SessionPayload {
  userId: string;
  username: string;
  avatarUrl?: string | null;
}

/**
 * Socket.IO middleware that authenticates a connection using the httpOnly
 * `session` cookie sent during the handshake (requires withCredentials on the
 * client and a non-wildcard CORS origin on the server).
 *
 * On success it stamps the authenticated identity onto `socket.data` so every
 * handler can trust `socket.data.userId` instead of a client-supplied value.
 */
export async function authenticateSocket(
  socket: Socket,
  next: (err?: Error) => void
) {
  try {
    // Prefer the httpOnly cookie; fall back to an explicit auth token
    // (useful for native clients that can't send cookies).
    const cookieHeader = socket.handshake.headers.cookie;
    const cookies = cookieHeader ? parseCookie(cookieHeader) : {};
    const token =
      cookies[SESSION_COOKIE] ||
      (socket.handshake.auth?.token as string | undefined);

    if (!token) {
      return next(new Error("Unauthorized: no session token"));
    }

    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    });

    const session = payload as unknown as SessionPayload;
    if (!session.userId) {
      return next(new Error("Unauthorized: invalid session"));
    }

    socket.data.userId = String(session.userId);
    socket.data.username = session.username;

    return next();
  } catch (error) {
    console.error("Socket auth failed:", error);
    return next(new Error("Unauthorized: token verification failed"));
  }
}
