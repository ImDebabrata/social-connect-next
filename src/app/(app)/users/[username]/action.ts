"use server";

import { getCurrentUser } from "@/app/action";
import { updateSessionPayload } from "@/lib/stateless-session";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import {
  updateUserProfileSchema,
  UpdateUserProfileValues,
} from "@/lib/validation";

export async function updateUserProfile(values: UpdateUserProfileValues) {
  const validatedValues = updateUserProfileSchema.parse(values);

  const loggedInUser = await getCurrentUser();

  if (!loggedInUser) throw new Error("Unauthorized");

  if (validatedValues.username) {
    const existingUser = await prisma.user.findFirst({
      where: {
        username: { equals: validatedValues.username, mode: "insensitive" },
        id: { not: loggedInUser.userId },
      },
    });
    if (existingUser) return { error: "Username already taken" };
  }

  const updatedUser = await prisma.user.update({
    where: { id: loggedInUser.userId },
    data: validatedValues,
    select: getUserDataSelect(loggedInUser.userId),
  });
  await updateSessionPayload(updatedUser);
  return updatedUser;
}
