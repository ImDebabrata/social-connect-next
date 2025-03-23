import { useToast } from "@/hooks/use-toast";
import { useCallback, useState } from "react";
import APIConfig from "@/constrants/ApiConfig";
import { useMutation } from "@tanstack/react-query";
import { Media } from "@prisma/client";

export interface Attachment {
  file: File;
  mediaId?: string;
  isUploading: boolean;
  url?: string;
  progress: number;
}

export default function useMediaUpload() {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Get all successfully uploaded media IDs
  const getMediaIds = useCallback(() => {
    return attachments
      .filter((attachment) => attachment.mediaId)
      .map((attachment) => attachment.mediaId as string);
  }, [attachments]);

  // Add new attachments to the list
  const addAttachments = useCallback((files: File[]) => {
    setAttachments((prev) => [
      ...prev,
      ...files.map((file) => ({
        file,
        isUploading: false,
        progress: 0,
      })),
    ]);
  }, []);

  // Remove an attachment from the list
  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Clear all attachments
  const clearAttachments = useCallback(() => {
    setAttachments([]);
  }, []);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (filesToUpload: File[]): Promise<Media[]> => {
      if (!filesToUpload.length) {
        throw new Error("No files to upload");
      }

      // Create FormData with all files
      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append("media", file);
      });

      // Call API with all files, common function not working
      // return fetchData({
      //   url: APIConfig.UPLOAD_AVATAR.URL as string,
      //   method: APIConfig.UPLOAD_AVATAR.METHOD,
      //   payload: formData,
      // });

      const response = await fetch(APIConfig.UPLOAD_MEDIA.URL as string, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const responseData = await response.json();
      return responseData?.data;
    },
    onSuccess: (response) => {
      // Update all attachments with their media IDs and URLs
      if (Array.isArray(response)) {
        setAttachments((prev) => {
          const uploadingAttachments = prev.filter((a) => a.isUploading);
          const notUploadingAttachments = prev.filter((a) => !a.isUploading);

          // Map each uploading attachment to a result
          const updatedAttachments = uploadingAttachments.map(
            (attachment, index) => {
              if (index < response.length) {
                const mediaData = response[index];
                return {
                  ...attachment,
                  mediaId: mediaData.id,
                  url: mediaData.url,
                  isUploading: false,
                  progress: 100,
                };
              }
              return attachment;
            }
          );

          return [...notUploadingAttachments, ...updatedAttachments];
        });
      }
    },
    onError: (error: Error) => {
      console.error("Upload error:", error);

      // Reset uploading status for all attachments
      setAttachments((prev) =>
        prev.map((attachment) =>
          attachment.isUploading
            ? { ...attachment, isUploading: false, progress: 0 }
            : attachment
        )
      );

      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Something went wrong during upload",
      });
    },
  });

  // Start uploading files
  const startUpload = useCallback(
    async (files: File[]) => {
      if (uploadMutation.isPending) {
        toast({
          variant: "destructive",
          description: "Please wait for the current upload to finish.",
        });
        return;
      }

      if (attachments.length + files.length > 5) {
        toast({
          variant: "destructive",
          description: "You can only upload up to 5 attachments per post.",
        });
        return;
      }

      try {
        // Add files to attachment list
        addAttachments(files);

        // Mark all new attachments as uploading
        const startIndex = attachments.length;
        setAttachments((prev) =>
          prev.map((attachment, i) =>
            i >= startIndex
              ? { ...attachment, isUploading: true, progress: 0 }
              : attachment
          )
        );

        // Start upload with all files
        uploadMutation.mutate(files);
      } catch (error) {
        console.error("Upload batch error:", error);
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: "Failed to upload one or more files",
        });
      }
    },
    [attachments.length, uploadMutation, toast, addAttachments]
  );

  return {
    attachments,
    isUploading: uploadMutation.isPending,
    startUpload,
    removeAttachment,
    clearAttachments,
    getMediaIds,
    addAttachments,
  };
}
