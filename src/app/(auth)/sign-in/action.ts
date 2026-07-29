"use server";

import prisma from "@/lib/prisma";
import { createSession } from "@/lib/stateless-session";
import { loginSchema, LoginValues } from "@/lib/validation";
import { compare } from "bcryptjs";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const GUEST_USERNAME = "guest";

/**
 * One shared demo account so anyone (e.g. a recruiter) can look around without
 * signing up. Created on first use, so no seed step is needed on deploy.
 * It has no passwordHash — the only way in is this button.
 */
export async function guestSignin(): Promise<{ error?: string }> {
  try {
    const guest =
      (await prisma.user.findUnique({ where: { username: GUEST_USERNAME } })) ??
      (await prisma.user.create({
        data: {
          username: GUEST_USERNAME,
          displayName: "Guest",
          bio: "Just looking around 👀",
        },
      }));

    await createSession({
      userId: guest.id,
      username: guest.username,
      avatarUrl: guest.avatarUrl,
    });

    return {};
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: "Guest login failed, the server may still be waking up. Please try again." };
  }
}

export async function signin(
  credentials: LoginValues
): Promise<{ error?: string; success?: string }> {
  try {
    // 1. Validate fields
    const { username, password } = loginSchema.parse(credentials);

    // 2. Check is user available
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (!existingUser || !existingUser.passwordHash) {
      return {
        error: "Incorrect username or password!",
      };
    }

    const isValidPassword = await compare(password, existingUser.passwordHash);
    if (!isValidPassword) {
      return {
        error: "Incorrect username or password",
      };
    }
    await createSession({
      userId: existingUser.id,
      username: existingUser.username,
      avatarUrl: existingUser.avatarUrl,
    });

    return {
      success: "Login Success",
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    // console.log(error);
    return {
      error: "Something went wrong!",
    };
  }
}
