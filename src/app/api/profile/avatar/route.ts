import { NextRequest } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/action";

/**
 * Constants for avatar upload restrictions
 */
// Profile avatar constraints
const MAX_AVATAR_SIZE = 1 * 1024 * 1024; // 1MB limit
const ALLOWED_AVATAR_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
];

/**
 * API route handler for profile avatar uploads
 * 
 * Processes profile picture uploads to Cloudinary and updates user record
 * 
 * @route POST /api/profile/avatar
 * @param req - Next.js request object containing form data with "avatar" file
 * @returns JSON response with updated user data or error message
 * 
 * @example
 * // Client-side usage:
 * const formData = new FormData();
 * formData.append("avatar", file);
 * const response = await fetch("/api/profile/avatar", {
 *   method: "POST",
 *   body: formData
 * });
 */
export async function POST(req: NextRequest) {
    try {
        // Step 1: Check if user is logged in
        const user = await getCurrentUser();
        if (!user) return Response.json({ error: "Please log in first" }, { status: 401 });

        // Step 2: Get the avatar image from the request
        const formData = await req.formData();
        const file = formData.get("avatar") as File;

        // Step 3: Check if avatar was provided
        if (!file) return Response.json({ error: "No avatar image selected" }, { status: 400 });

        // Step 4: Check if avatar type is allowed
        if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
            return Response.json({ error: "We only accept JPG, PNG, WEBP, or GIF for profile avatars" }, { status: 400 });
        }

        // Step 5: Check if avatar isn't too big
        if (file.size > MAX_AVATAR_SIZE) {
            return Response.json({ error: "Avatar image is too big (max 1MB)" }, { status: 400 });
        }

        // Step 6: Prepare the file for upload
        const buffer = Buffer.from(await file.arrayBuffer());

        // Step 7: Upload to Cloudinary using shared utility
        const result = await uploadToCloudinary(buffer, {
            folder: "avatars",
            publicId: `user_${user.userId}`,
            resourceType: "image",
            transformation: [{ quality: "auto" } as Record<string, unknown>],
            overwrite: true
        });

        // Step 8: Check if upload was successful
        if (!result?.secure_url) {
            throw new Error('Avatar upload failed');
        }
        
        // Step 9: Save the new avatar URL to user's profile
        const updatedUser = await prisma.user.update({
            where: { id: user.userId },
            data: { avatarUrl: result.secure_url },
        });

        // Step 10: Return success response
        return Response.json({ data: updatedUser }, { status: 200 });
    } catch (error) {
        console.error("Avatar upload failed:", error);
        return Response.json({ error: "Oops! Something went wrong. Please try again." }, { status: 500 });
    }
} 