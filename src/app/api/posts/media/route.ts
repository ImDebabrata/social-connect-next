import { NextRequest } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/action";
import { validateFile } from "@/lib/mediaValidation";

/**
 * API route handler for post media uploads (images and videos)
 * 
 * Processes media files for social posts, uploading to Cloudinary and creating database records
 * 
 * @route POST /api/posts/media
 * @param req - Next.js request object containing form data with "media" files
 * @returns JSON response with array of created media objects or error message
 * 
 * @example
 * // Client-side usage:
 * const formData = new FormData();
 * // Can add multiple files
 * formData.append("media", imageFile1);
 * formData.append("media", videoFile);
 * const response = await fetch("/api/posts/media", {
 *   method: "POST",
 *   body: formData
 * });
 */
export async function POST(req: NextRequest) {
  try {
    // Check if user is logged in
    const user = await getCurrentUser();
    if (!user)
      return Response.json({ error: "Please log in first" }, { status: 401 });

    // Get files from request
    const formData = await req.formData();
    const files = formData.getAll("media") as File[];

    // Check if any files were provided
    if (!files.length)
      return Response.json({ error: "No files selected" }, { status: 400 });

    const uploadResults = [];

    // Process each file
    for (const file of files) {
      const validation = validateFile(file);
      
      if (!validation.isValid) {
        return Response.json({
          error: validation.error,
        }, { status: 400 });
      }

      // Prepare file for upload
      const buffer = Buffer.from(await file.arrayBuffer());

      // Upload to Cloudinary using shared utility
      const result = await uploadToCloudinary(buffer, {
        folder: validation.isImage ? "post_images" : "post_videos",
        resourceType: validation.isImage ? "image" : "video",
        transformation: validation.isImage ? [{ quality: "auto" } as Record<string, unknown>] : undefined
      });

      // Check if upload was successful
      if (!result?.secure_url) {
        throw new Error("File upload failed");
      }

      // Create media record in database
      const media = await prisma.media.create({
        data: {
          type: validation.isImage ? "IMAGE" : "VIDEO",
          url: result.secure_url,
        },
      });

      uploadResults.push(media);
    }

    // Return all the new media objects
    return Response.json({ data: uploadResults }, { status: 200 });
  } catch (error) {
    console.error("Media upload failed:", error);
    return Response.json(
      {
        error: "Oops! Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
} 