"use server";

import prisma from "@/lib/prisma";
import { createSession } from "@/lib/stateless-session";
import { loginSchema, LoginValues } from "@/lib/validation";
import { compare } from "bcryptjs";
import { isRedirectError } from "next/dist/client/components/redirect-error";

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
      avatarUrl: existingUser.avatarUrl,
    });

    return {
      success: "Login Success",
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.log(error);
    return {
      error: "Something went wrong!",
    };
  }
}
