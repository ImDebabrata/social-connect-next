// This is like a magic box that handles profile picture uploads
import { NextRequest } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/app/action";

// Setting up our connection to Cloudinary (like a photo storage cloud)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloud name
    api_key: process.env.CLOUDINARY_API_KEY,      // Special key
    api_secret: process.env.CLOUDINARY_API_SECRET,// Secret password
});

// Rules for the pictures we accept:
const MAX_FILE_SIZE = 1 * 1024 * 1024; // Picture can't be bigger than 1MB
const ALLOWED_MIME_TYPES = [           // Only these picture types allowed
    "image/jpeg",                      // Regular photos
    "image/png",                       // Transparent images
    "image/webp",                      // Modern web images
    "image/gif"                        // Animated pictures
];

// This is the main function that handles picture uploads
export async function POST(req: NextRequest) {
    try {
        // Step 1: Check if user is logged in
        const user = await getCurrentUser();
        if (!user) return Response.json({ error: "Please log in first" }, { status: 401 });

        // Step 2: Get the picture from the request
        const formData = await req.formData();
        const file = formData.get("avatar") as File;

        // Step 3: Check if picture was provided
        if (!file) return Response.json({ error: "No picture selected" }, { status: 400 });

        // Step 4: Check if picture type is allowed
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return Response.json({ error: "We only accept JPG, PNG, WEBP, or GIF pictures" }, { status: 400 });
        }

        // Step 5: Check if picture isn't too big
        if (file.size > MAX_FILE_SIZE) {
            return Response.json({ error: "Picture is too big (max 1MB)" }, { status: 400 });
        }

        // Step 6: Prepare the picture for upload
        const buffer = Buffer.from(await file.arrayBuffer());

        // Step 7: Upload to Cloudinary (our photo storage cloud)
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            // Create a special pipe to send the picture
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "avatars",                     // Store in avatars folder
                    public_id: `user_${user.userId}`,     // Use user ID as picture name
                    overwrite: true,                      // Replace old picture
                    transformation: [{ quality: "auto" }],// Make picture look good
                },
                (error, result) => {
                    if (error) {
                        reject(error); // Oops, something went wrong
                    } else if (result) {
                        resolve(result); // Yay, picture uploaded!
                    } else {
                        reject(new Error('Cloudinary upload returned no result'));
                    }
                }
            );
            uploadStream.end(buffer); // Send the picture through the pipe
        });

        // Step 8: Check if upload was successful
        if (!result?.secure_url) {
            throw new Error('Picture upload failed');
        }
        
        // Step 9: Save the new picture URL to user's profile
        const updatedUser = await prisma.user.update({
            where: { id: user.userId },
            data: { avatarUrl: result.secure_url },
        });

        // Step 10: Tell the browser everything worked!
        return Response.json({ data: updatedUser }, { status: 200 });
    } catch (error) {
        // If something goes wrong, tell the browser
        console.error("Picture upload failed:", error);
        return Response.json({ error: "Oops! Something went wrong. Please try again." }, { status: 500 });
    }
}
