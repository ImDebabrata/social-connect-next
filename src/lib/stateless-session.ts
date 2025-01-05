import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RouteConfig from "@/constrants/RouteConfig";
import { SessionPayload } from "./validation";

const secretKey = process.env.JWT_SECRET;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1hr")
    .sign(key);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createSession(
  sessionPayload: Omit<SessionPayload, "expiresAt">
) {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const session = await encrypt({ ...sessionPayload, expiresAt });

  const cookiesStore = await cookies();
  cookiesStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  redirect(RouteConfig.protectedRoute.MAIN_SCREEN);
}

export async function verifySession() {
  const cookiesStore = await cookies();
  const cookie = cookiesStore.get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect(RouteConfig.protectedRoute.MAIN_SCREEN);
  }

  return { isAuth: true, userId: Number(session.userId) };
}

export async function updateSession() {
  const cookiesStore = await cookies();
  const session = cookiesStore.get("session")?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  cookiesStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookiesStore = await cookies();
  cookiesStore.delete("session");
  redirect(RouteConfig.authScreens.SIGN_IN);
}
