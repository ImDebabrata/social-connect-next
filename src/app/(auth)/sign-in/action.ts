"use server";

import prisma from "@/lib/prisma";
import { createSession } from "@/lib/stateless-session";
import { loginSchema, LoginValues } from "@/lib/validation";
import { compare } from "bcryptjs";

export async function signin(
  credentials: LoginValues
): Promise<{ error?: string; success?: string }> {
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
  await createSession(existingUser.id);

  return {
    success: "Login Success",
  };
}
