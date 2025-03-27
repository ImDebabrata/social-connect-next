import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// Extract the public id from the url
function extractPublicId(url: string): string | null {
    const regex = /upload\/v\d+\/(post_images|post_videos)\/([^\.]+)/;
    const match = url.match(regex);
    
    return match ? `${match[1]}/${match[2]}` : null;
  }

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("Authorization");
        console.log(authHeader);
        if(authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return Response.json({ error: "Invalid secret" }, { status: 401 });
        }

        const unUsedMedia = await prisma.media.findMany({
            where: {
                postId: null,
                ...(process.env.NODE_ENV === "production" ? {
                    createdAt: {
                        // 24 hours ago
                        lte: new Date(Date.now() - 1000 * 60 * 60 * 24)
                    }
                } : {})
            },
            select: {
                id: true,
                url: true,
            }
        });

        // We are not storing the public id in the database, so we need to extract it from the url
        for (const media of unUsedMedia) {
            const publicId = extractPublicId(media.url);
            if(publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }

        await prisma.media.deleteMany({
            where: {
                id: {
                    in: unUsedMedia.map((media) => media.id)
                }
            }
        });

        return Response.json({ message: "Unused media deleted" }, { status: 200 });
        
        
        
        
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}