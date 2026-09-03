import { SignJWT, jwtVerify } from "jose"; // jose is Edge-compatible
import { cookies } from "next/headers";
import { SessionPayload } from "./validation";
import Misc from "@/constrants/Misc";

// Secret key for JWT signing and verification
const secretKey = process.env.JWT_SECRET;
const key = new TextEncoder().encode(secretKey);

// Encrypt the payload into a JWT
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}

// Decrypt and verify the session
export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.log("Failed to verify session", error);
    return null;
  }
}

// Create session by generating JWT and setting it in cookies
export async function createSession(
  sessionPayload: Omit<SessionPayload, "expiresAt">
) {
  const cookiesStore = await cookies();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
  const sessionToken = await encrypt({ ...sessionPayload, expiresAt });

  cookiesStore.set(Misc.SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "none",
    path: "/",
  });

  console.log("Session created and stored in cookies");
}

// Get session from cookies
export async function getSession() {
  const cookiesStore = await cookies();
  const sessionToken = cookiesStore.get(Misc.SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return null;
  }

  return await decrypt(sessionToken);
}
