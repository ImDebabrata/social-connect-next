// Media file constraints
export const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB for images
export const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB for videos
export const MAX_FILES = 5; // Maximum number of files allowed

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

// Reusable file validation
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  isImage?: boolean;
  isVideo?: boolean;
}

export const validateFile = (file: File): ValidationResult => {
  // Determine file type
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  // Check if file type is allowed
  if (!isImage && !isVideo) {
    return {
      isValid: false,
      error: "Unsupported file format. Please upload JPG, PNG, WEBP, GIF, MP4, WEBM, or MOV.",
    };
  }

  // Check file size based on type
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  if (file.size > maxSize) {
    const sizeLimit = isImage ? "1MB" : "20MB";
    return {
      isValid: false,
      error: `File is too large (max ${sizeLimit})`,
    };
  }

  return {
    isValid: true,
    isImage,
    isVideo,
  };
};

// Validate multiple files
export const validateFiles = (files: File[], currentCount = 0): {
  validFiles: File[];
  errors: string[];
} => {
  const errors: string[] = [];
  const validFiles: File[] = [];

  // Check total file count including existing files
  if (files.length + currentCount > MAX_FILES) {
    errors.push(`Cannot upload more than ${MAX_FILES} files in total.`);
    // Only process up to the maximum allowed
    const availableSlots = Math.max(0, MAX_FILES - currentCount);
    files = files.slice(0, availableSlots);
  }

  // Validate each file
  for (const file of files) {
    const result = validateFile(file);
    if (result.isValid) {
      validFiles.push(file);
    } else if (result.error) {
      errors.push(`${file.name}: ${result.error}`);
    }
  }

  return { validFiles, errors };
}; 