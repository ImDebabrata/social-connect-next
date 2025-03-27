import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

// Configure Cloudinary connection
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary
 * 
 * @param buffer - The buffer containing file data to upload
 * @param options - Configuration options for the upload
 * @param options.folder - Destination folder in Cloudinary
 * @param options.publicId - Optional custom public ID for the uploaded file
 * @param options.resourceType - Type of resource ('image' or 'video')
 * @param options.transformation - Array of Cloudinary transformation objects
 * @param options.overwrite - Whether to overwrite existing file with same publicId
 * 
 * @returns Promise resolving to Cloudinary upload response
 * 
 * @example
 * // Upload an image to the 'avatars' folder
 * const result = await uploadToCloudinary(buffer, {
 *   folder: 'avatars',
 *   publicId: 'user_123',
 *   resourceType: 'image',
 *   transformation: [{ quality: 'auto' } as Record<string, unknown>],
 *   overwrite: true
 * });
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    publicId?: string;
    resourceType?: "image" | "video";
    transformation?: Array<Record<string, unknown>>;
    overwrite?: boolean;
  }
): Promise<UploadApiResponse> {
  const { folder, publicId, resourceType = "image", transformation, overwrite } = options;

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder,
      resource_type: resourceType,
    };

    // Add optional parameters if they exist
    if (publicId) uploadOptions.public_id = publicId;
    if (transformation) uploadOptions.transformation = transformation;
    if (overwrite !== undefined) uploadOptions.overwrite = overwrite;

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
} 