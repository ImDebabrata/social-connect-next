"use server";
import prisma from "@/lib/prisma";
import { resetPasswordSchema, ResetPasswordValues } from "@/lib/validation";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
export async function resetPassword(
  credentials: ResetPasswordValues
): Promise<{ error?: string; success?: string }> {
  try {
    const { password, token } = resetPasswordSchema.parse(credentials);

    const hashedToken = createHash('sha256').update(token).digest('hex');

    const resetToken = await prisma.passwordResetToken.findUnique({
        where:{
            tokenHash:hashedToken
        }
    })

    if(!resetToken || resetToken.expiresAt < new Date()){
        return {
            error: "Invalid or expired token!",
        }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx)=>{
        await tx.user.update({
            where:{
                id:resetToken.userId
            },
            data:{
                passwordHash
            }
        })
        await tx.passwordResetToken.deleteMany({
            where:{
                id:resetToken.id
            }
        })
    });

    return { success: "Password reset successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong!" };
  }
}