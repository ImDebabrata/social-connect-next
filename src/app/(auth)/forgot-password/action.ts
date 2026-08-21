"use server";

import prisma from "@/lib/prisma";
import { forgotPasswordSchema, ForgotPasswordValues } from "@/lib/validation";
import { createHash, randomBytes } from "crypto";


export async function forgotPassword(
  credentials: ForgotPasswordValues
): Promise<{ error?: string; success?: string }> {
  try {
    // 1. Validate fields
    const { email } = forgotPasswordSchema.parse(credentials);

    // 2. Check is user available
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if(existingUser && existingUser.username!=='guest') {
        const resetToken = randomBytes(32).toString('hex');
        const hashedResetToken = createHash('sha256').update(resetToken).digest('hex');

        await prisma.passwordResetToken.deleteMany({
            where: {userId:existingUser.id}
        })

        await prisma.passwordResetToken.create({
            data: {
                tokenHash:hashedResetToken,
                userId:existingUser.id,
                expiresAt:new Date(Date.now() + 15*60*1000) // 15 Minutes
            }
        })

        // TODO: send reset email with Nodemailer instead of console.log
        console.log(`${process.env.NEXT_PUBLIC_API_URL}/reset-password?token=${resetToken}`);
    }


    return {
      success: "If the email is valid, you will receive a reset email.",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Something went wrong!",
    };
  }
}
