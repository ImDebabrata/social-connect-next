'use server';

import { getCurrentUser } from "@/app/action";
import { updateSessionPayload } from "@/lib/stateless-session";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { updateUserProfileSchema,UpdateUserProfileValues } from "@/lib/validation";

export async function updateUserProfile(values:UpdateUserProfileValues){
    const validatedValues=updateUserProfileSchema.parse(values);

    const loggedInUser=await getCurrentUser();

    if(!loggedInUser)
      throw new Error("Unauthorized");

    const updatedUser=await prisma.user.update({
      where:{id:loggedInUser.userId},
      data:validatedValues,
      select:getUserDataSelect(loggedInUser.userId)
    })
    await updateSessionPayload(updatedUser);
    return updatedUser;
}