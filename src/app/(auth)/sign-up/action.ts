"use server";
import bcrypt from "bcryptjs";
import { signUpSchema, SignUpValues } from "@/lib/validation";
// import streamServerClient from "@/lib/stream";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
// import { createSession } from "@/lib/stateless-session";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import RouteConfig from "@/constrants/RouteConfig";

export async function signup(
  credentials: SignUpValues
): Promise<{ error?: string; success?: string }> {
  try {
    // 1. Validate form fields
    const { username, email, password } = signUpSchema.parse(credentials);

    // 2. Check if the user's email already exists
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUsername) {
      return {
        error: "Username already taken",
      };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return {
        error: "Email already taken",
      };
    }
    const userId = uuidv4(); // Generate a unique user ID using UUIDv4

    // Hash the user's password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Insert the user into the database or call an Auth Provider's API
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: username,
          email,
          passwordHash,
        },
      });

      // await streamServerClient.upsertUser({
      //   id: userId,
      //   username,
      //   name: username,
      // });
    });

    // 4. Create a session for the user
    // await createSession(userId);
    redirect(RouteConfig.authScreens.SIGN_IN);
    return {
      success: "Created success",
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.log(error);
    return {
      error: "Something went wrong",
    };
  }
}
