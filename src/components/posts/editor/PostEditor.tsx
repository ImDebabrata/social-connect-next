"use client";
import { TextareaComponent } from "@/components/Textarea";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSubmitPostMutation } from "./mutation";
import ImageConfig from "@/constrants/ImageConfig";
import useMediaUpload, { Attachment } from "./useMediaUpload";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { MAX_FILES } from "@/lib/mediaValidation";
import LoadingButton from "@/components/LoadingButton";

/**
 * PostEditor component that handles creating and submitting new posts
 * Includes drag and drop file upload capabilities and media attachment previews
 */
function PostEditor() {
    const { user } = useCurrentSession();
    const [postValue, setPostValue] = useState("");
    // Track if files are being dragged over the component
    const [isDragActive, setIsDragActive] = useState(false);
    // Counter for nested drag events - solves the flickering issue when moving between child elements
    // When dragging over nested elements, dragEnter and dragLeave fire multiple times
    // This counter ensures we only reset the active state when truly leaving the drop zone
    const dragCounter = useRef(0);
    const editorRef = useRef<HTMLDivElement>(null);

    const { attachments, isUploading, startUpload, removeAttachment, clearAttachments, getMediaIds } = useMediaUpload();

    const onSubmitPost = useSubmitPostMutation();

    /**
     * Processes selected files before uploading
     * Wrapped in useCallback to prevent recreation on each render
     * This stabilizes the function reference for useEffect dependencies
     * 
     * @param {File[]} files - Array of files selected by the user
     */
    const handleFileSelected = useCallback((files: File[]) => {
        startUpload(files);
    }, [startUpload]); // Only depends on the startUpload function which has its own validation

    /**
     * Sets up clipboard paste event handling for the editor
     * Allows users to paste images/files directly into the post editor
     * 
     * Two paste scenarios are handled:
     * 1. Files directly available in clipboardData.files (common in some browsers)
     * 2. Image data available in clipboardData.items (for screenshots, etc.)
     */
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            // Scenario 1: Handle files already available as File objects in clipboard
            if (e.clipboardData && e.clipboardData.files.length > 0) {
                e.preventDefault(); // Prevent default paste behavior
                const files = Array.from(e.clipboardData.files);
                handleFileSelected(files);
                return;
            }
            
            // Scenario 2: Handle image data in clipboard items (e.g., screenshots)
            if (e.clipboardData && e.clipboardData.items) {
                for (const item of Array.from(e.clipboardData.items)) {
                    // Only process image type items
                    if (item.type.startsWith('image/')) {
                        e.preventDefault(); // Prevent default paste behavior
                        const blob = item.getAsFile();
                        if (blob) {
                            // Convert blob to File with proper name and MIME type
                            // Timestamps ensure unique filenames for pasted images
                            const file = new File(
                                [blob], 
                                `pasted-image-${new Date().getTime()}.${item.type.split('/')[1] || 'png'}`,
                                { type: item.type }
                            );
                            handleFileSelected([file]);
                        }
                        break;
                    }
                }
            }
        };

        // Register paste event handler on the editor element
        const editorElement = editorRef.current;
        if (editorElement) {
            editorElement.addEventListener('paste', handlePaste);
        }

        // Clean up event listener when component unmounts or dependencies change
        return () => {
            if (editorElement) {
                editorElement.removeEventListener('paste', handlePaste);
            }
        };
    }, [handleFileSelected]); // Only re-run if handleFileSelected changes (stable due to useCallback)

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
            // Convert FileList to Array and process with our handler
            const files = Array.from(e.dataTransfer.files);
            handleFileSelected(files);
        }
    }

    return (
        <div 
            ref={editorRef}
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
                <AddAttachmentsButton onFilesSelected={handleFileSelected} disabled={onSubmitPost.isPending || attachments.length >= MAX_FILES} />
                <LoadingButton loading={onSubmitPost.isPending} className="min-w-20" onClick={handleSubmitPost} disabled={!postValue.trim() || isUploading}>
                    Post
                </LoadingButton>
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
 * 
 * Features:
 * - Manages object URLs for file previews with proper cleanup
 * - Handles loading states and errors gracefully
 * - Shows upload progress for files being uploaded
 * - Allows removal of attachments when not uploading
 * 
 * @param {AttachmentPreviewProps} props - Component props
 */
function AttachmentPreview(props: AttachmentPreviewProps) {
    const {
        attachment: { file, isUploading, progress },
        onRemoveClick,
    } = props;

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [loadError, setLoadError] = useState(false);

    // Create and manage object URL
    useEffect(() => {
        // Create object URL from file
        const objectUrl = URL.createObjectURL(file);
        setImageSrc(objectUrl);
        setLoadError(false);

        // Clean up object URL when component unmounts or file changes
        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [file]);

    // Handler for image loading errors
    const handleImageError = () => {
        setLoadError(true);
    };
    
    return (
        <div className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}>
            {file.type.startsWith("image") ? (
                loadError || !imageSrc ? (
                    <div className="flex items-center justify-center size-[300px] bg-muted rounded-2xl">
                        <p className="text-sm text-muted-foreground">
                            {loadError ? "Image preview unavailable" : "Loading preview..."}
                        </p>
                    </div>
                ) : (
                    <div className="max-w-[500px] max-h-[30rem] rounded-2xl overflow-hidden bg-muted">
                        <Image 
                            src={imageSrc} 
                            alt={`Preview of ${file.name}`} 
                            width={500} 
                            height={500} 
                            className="size-fit max-h-[30rem] rounded-2xl object-contain" 
                            onError={handleImageError}
                            unoptimized
                        />
                    </div>
                )
            ) : (
                imageSrc ? (
                    <video controls className="size-fit max-h-[30rem] rounded-2xl" aria-label={`Video preview of ${file.name}`}>
                        <source src={imageSrc} type={file.type} />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <div className="flex items-center justify-center size-[300px] bg-muted rounded-2xl">
                        <p className="text-sm text-muted-foreground">Loading video preview...</p>
                    </div>
                )
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
