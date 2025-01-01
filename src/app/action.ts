"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import RouteConfig from "@/constrants/RouteConfig";

export async function handleLogOut() {
  (await cookies()).delete("session");
  redirect(RouteConfig.authScreens.SIGN_IN);
}
