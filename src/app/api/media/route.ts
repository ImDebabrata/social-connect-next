import { NextRequest } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/action";
import { validateFile } from "@/lib/mediaValidation";

// Setting up our connection to Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

      // Upload to Cloudinary
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadOptions = {
          folder: validation.isImage ? "post_images" : "post_videos",
          resource_type: validation.isImage ? "image" : ("video" as "image" | "video"),
          transformation: validation.isImage ? [{ quality: "auto" }] : undefined,
        };

        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result);
            } else {
              reject(new Error("Cloudinary upload returned no result"));
            }
          }
        );
        uploadStream.end(buffer);
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
