"use client";
import { TextareaComponent } from "@/components/Textarea";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import React, { useRef, useState } from "react";
import { useSubmitPostMutation } from "./mutation";
import ImageConfig from "@/constrants/ImageConfig";
import useMediaUpload, { Attachment } from "./useMediaUpload";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

// Define allowed media types and constraints
enum MediaType {
    IMAGE = 'image',
    VIDEO = 'video'
}

const FILE_CONSTRAINTS = {
    maxSizeInBytes: 10 * 1024 * 1024, // 10MB
    allowedTypes: [MediaType.IMAGE, MediaType.VIDEO],
    maxFiles: 5
};

/**
 * PostEditor component that handles creating and submitting new posts
 * Includes drag and drop file upload capabilities and media attachment previews
 */
function PostEditor() {
    const { toast } = useToast();
    const { user } = useCurrentSession();
    const [postValue, setPostValue] = useState("");
    // Track if files are being dragged over the component
    const [isDragActive, setIsDragActive] = useState(false);
    // Counter for nested drag events - solves the flickering issue when moving between child elements
    // When dragging over nested elements, dragEnter and dragLeave fire multiple times
    // This counter ensures we only reset the active state when truly leaving the drop zone
    const dragCounter = useRef(0);

    const { attachments, isUploading, startUpload, removeAttachment, clearAttachments, getMediaIds } = useMediaUpload();

    const onSubmitPost = useSubmitPostMutation();

    /**
     * Handles post submission
     * Sends post content and media IDs to the server and resets the form on success
     */
    function handleSubmitPost() {
        onSubmitPost.mutate(
            { content: postValue, mediaIds: getMediaIds() },
            {
                onSuccess: () => {
                    setPostValue("");
                    clearAttachments();
                },
                onError: (error) => {
                    // Handle submission errors
                    console.error("Failed to submit post:", error);
                    // Could integrate with a toast notification system here
                }
            }
        );
    }

    /**
     * Processes and validates selected files before uploading
     * @param {File[]} files - Array of files selected by the user
     */
    function handleFileSelected(files: File[]) {
        // Validate file count
        if (attachments.length + files.length > FILE_CONSTRAINTS.maxFiles) {
            console.error(`Cannot upload more than ${FILE_CONSTRAINTS.maxFiles} files`);
            // Could show a toast error notification here
            return;
        }

        // Validate each file
        const validFiles = files.filter(file => {
            // Check file size
            if (file.size > FILE_CONSTRAINTS.maxSizeInBytes) {
                console.error(`File ${file.name} exceeds the maximum size of ${FILE_CONSTRAINTS.maxSizeInBytes / (1024 * 1024)}MB`);
                return false;
            }

            // Check file type
            const fileType = file.type.split('/')[0] as MediaType;
            if (!FILE_CONSTRAINTS.allowedTypes.includes(fileType)) {
                console.error(`File ${file.name} has an unsupported type: ${fileType}`);
                return false;
            }

            return true;
        });

        if (validFiles.length > 0) {
            startUpload(validFiles);
        }
    }

    // ---- Drag and Drop Event Handlers ----

    // Drag over - prevent default browser behavior (like opening the file)
    // and keep the drop effect for visual feedback
    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Drag enter - triggered when a dragged item enters the drop zone
    // Increment counter each time we enter an element (including children)
    function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current += 1;
        setIsDragActive(true);
    }

    // Drag leave - triggered when a dragged item leaves an element
    // Decrement counter and only deactivate drop state when counter reaches 0
    // This prevents flickering when moving between child elements
    function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current === 0) {
            setIsDragActive(false);
        }
    }

    // Drop - triggered when files are dropped onto the drop zone
    // Reset counter and active state, then process the dropped files
    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        dragCounter.current = 0;
        
        // Extract files from the drop event and pass them to the upload handler
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            // Convert FileList to Array and filter by allowed types
            const files = Array.from(e.dataTransfer.files).filter(file => {
                const fileType = file.type.split('/')[0] as MediaType;
                const isValidType = FILE_CONSTRAINTS.allowedTypes.includes(fileType);
                
                if (!isValidType) {
                    console.error(`File ${file.name} has an unsupported type: ${fileType}`);
                    // Could show toast error here
                    toast({
                        title: `File ${file.name} has an unsupported type: ${fileType}`,
                        description: "Please select a valid file type",
                        variant: "destructive"
                    });
                }
                
                return isValidType;
            });
            
            if (files.length > 0) {
                handleFileSelected(files);
            }
        }
    }

    return (
        <div 
            className={cn(
                "flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm transition-colors relative",
                // Apply visual feedback styles when drag is active
                isDragActive && "bg-primary/10 border-2 border-dashed border-primary"
            )}
            // Attach drag and drop event handlers to the container
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex gap-5">
                <UserAvatar avatarUrl={user?.avatarUrl} className="hidden sm:inline" />
                <TextareaComponent
                    value={postValue}
                    onChange={(e) => {
                        setPostValue(e.target.value);
                    }}
                />
            </div>
            
            {/* Display attachment previews when there are attachments */}
            {attachments.length > 0 && (
                <div className="mx-auto w-full max-w-[40rem]">
                    <AttachmentPreviews attachments={attachments} removeAttachment={removeAttachment} />
                </div>
            )}
            
            <div className="flex justify-end gap-3 items-center">
                {isUploading && (
                    <>
                        <span className="text-sm">Uploading...</span>
                        <ImageConfig.LoadingIcon className="size-5 animate-spin text-primary" />
                    </>
                )}
                <AddAttachmentsButton onFilesSelected={handleFileSelected} disabled={onSubmitPost.isPending || attachments.length >= 5} />
                <Button className="min-w-20" onClick={handleSubmitPost} disabled={!postValue.trim() || isUploading}>
                    Post
                </Button>
            </div>
            {/* Overlay message shown when dragging files - pointer-events-none ensures it doesn't interfere with drag events */}
            {isDragActive && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-primary/5 z-10 pointer-events-none">
                    <span className="text-primary font-medium bg-background/80 px-4 py-2 rounded-lg">Drop files to upload</span>
                </div>
            )}
        </div>
    );
}

export default PostEditor;

/**
 * Interface for attachment button props
 */
interface AddAttachmentsButtonProps {
    /** Callback function when files are selected */
    onFilesSelected: (files: File[]) => void;
    /** Whether the button is disabled */
    disabled: boolean;
}

/**
 * Button component that handles file selection via input[type=file]
 * @param {Object} props - Component props
 * @param {Function} props.onFilesSelected - Callback function when files are selected
 * @param {boolean} props.disabled - Whether the button is disabled
 */
function AddAttachmentsButton(props: AddAttachmentsButtonProps) {
    const { onFilesSelected, disabled } = props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (
        <>
            <Button 
                variant={"ghost"} 
                size={"icon"} 
                className="text-primary hover:text-primary" 
                disabled={disabled} 
                onClick={() => fileInputRef?.current?.click()}
                aria-label="Add images or videos"
            >
                <ImageConfig.ImageIcon size={20} />
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden sr-only"
                accept="image/*, video/*"
                multiple
                onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length) {
                        onFilesSelected(files);
                        e.target.value = "";
                    }
                }}
                aria-hidden="true"
            />
        </>
    );
}

/**
 * Interface for media attachments shown in the editor
 */
interface AttachmentPreviewsProps {
    /** List of file attachments with their metadata */
    attachments: Attachment[];
    /** Function to remove an attachment by its index */
    removeAttachment: (index: number) => void;
}

/**
 * Component to display all attachment previews
 */
function AttachmentPreviews(props: AttachmentPreviewsProps) {
    const { attachments, removeAttachment } = props;
    return (
        <div className={cn("flex flex-col gap-3", attachments?.length > 1 && "sm:grid sm:grid-cols-2")}>
            {attachments.map((attachment, index) => (
                <AttachmentPreview 
                    key={attachment.file.name + index} 
                    attachment={attachment} 
                    onRemoveClick={() => removeAttachment(index)} 
                />
            ))}
        </div>
    );
}

/**
 * Interface for a single attachment preview
 */
interface AttachmentPreviewProps {
    /** The attachment to display with upload status */
    attachment: Attachment;
    /** Callback when removal button is clicked */
    onRemoveClick: () => void;
}

/**
 * Renders a preview for a single file attachment
 * Handles both image and video files with upload progress
 */
function AttachmentPreview(props: AttachmentPreviewProps) {
    const {
        attachment: { file, isUploading, progress },
        onRemoveClick,
    } = props;

    const src = URL.createObjectURL(file);
    
    // Clean up object URL when component unmounts
    React.useEffect(() => {
        return () => {
            URL.revokeObjectURL(src);
        };
    }, [src]);
    
    return (
        <div className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}>
            {file.type.startsWith("image") ? (
                <Image src={src} alt={`Preview of ${file.name}`} width={500} height={500} className="size-fit max-h-[30rem] rounded-2xl" />
            ) : (
                <video controls className="size-fit max-h-[30rem] rounded-2xl" aria-label={`Video preview of ${file.name}`}>
                    <source src={src} type={file.type} />
                    Your browser does not support the video tag.
                </video>
            )}
            {!isUploading && (
                <button 
                    onClick={onRemoveClick} 
                    className="absolute top-3 right-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60"
                    aria-label={`Remove ${file.name}`}
                >
                    <ImageConfig.CloseIcon size={20} />
                </button>
            )}
            {isUploading && (
                <div 
                    className="absolute bottom-3 left-3 right-3 h-1.5 overflow-hidden rounded-full bg-background/30"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div 
                        className="h-full bg-primary transition-all duration-300 ease-out" 
                        style={{ width: `${progress}%` }} 
                    />
                </div>
            )}
        </div>
    );
}
