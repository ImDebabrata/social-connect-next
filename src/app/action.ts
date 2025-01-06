"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import RouteConfig from "@/constrants/RouteConfig";
import { decrypt } from "@/lib/stateless-session";
import { SessionPayload } from "@/lib/validation";

export async function handleLogOut() {
  (await cookies()).delete("session");
  redirect(RouteConfig.authScreens.SIGN_IN);
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookie = (await cookies()).get("session")?.value;
  const user = (await decrypt(cookie)) as SessionPayload | null;
  console.log("the file is running",new Date());
  return { ...user, avatarUrl: user?.avatarUrl || "" } as SessionPayload | null;
}
