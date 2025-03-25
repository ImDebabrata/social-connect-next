import { NextRequest } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/action";

// Setting up our connection to Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Media file constraints
const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB for images
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB for videos
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

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
      // Determine file type
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

      // Check if file type is allowed
      if (!isImage && !isVideo) {
        return Response.json({
          error:
            "Unsupported file format. Please upload JPG, PNG, WEBP, GIF, MP4, WEBM, or MOV.",
        }, { status: 400 });
      }

      // Check file size based on type
      const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
      if (file.size > maxSize) {
        const sizeLimit = isImage ? "1MB" : "20MB";
        return Response.json({
          error: `File is too large (max ${sizeLimit})`,
        }, { status: 400 });
      }

      // Prepare file for upload
      const buffer = Buffer.from(await file.arrayBuffer());

      // Upload to Cloudinary
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadOptions = {
          folder: isImage ? "post_images" : "post_videos",
          resource_type: isImage ? "image" : ("video" as "image" | "video"),
          transformation: isImage ? [{ quality: "auto" }] : undefined,
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
          type: isImage ? "IMAGE" : "VIDEO",
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
