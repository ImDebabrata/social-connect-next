import { NextRequest } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/action";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get("avatar") as File;

        if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

        // Security validations
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return Response.json({ error: "Unsupported file type" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return Response.json({ error: "File size exceeds 1MB limit" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Stream upload directly to Cloudinary
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "avatars",
                    public_id: `user_${user.userId}`,
                    overwrite: true,
                    transformation: [{ quality: "auto" }],
                },
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

        if (!result?.secure_url) {
            throw new Error("Cloudinary upload failed");
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.userId },
            data: { avatarUrl: result.secure_url },
        });

        return Response.json({ data: updatedUser }, { status: 200 });
    } catch (error) {
        console.error("File upload failed:", error);
        return Response.json({ error: "Upload failed. Please try again." }, { status: 500 });
    }
}
