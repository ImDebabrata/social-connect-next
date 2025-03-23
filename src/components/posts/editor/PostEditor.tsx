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

function PostEditor() {
    const { user } = useCurrentSession();
    const [postValue, setPostValue] = useState("");

    const { attachments, isUploading, startUpload, removeAttachment, clearAttachments, getMediaIds } = useMediaUpload();

    const onSubmitPost = useSubmitPostMutation();

    function handleSubmitPost() {
        onSubmitPost.mutate(
            { content: postValue, mediaIds: getMediaIds() },
            {
                onSuccess: () => {
                    setPostValue("");
                    clearAttachments();
                },
            }
        );
    }

    function handleFileSelected(files: File[]) {
        startUpload(files);
    }

    return (
        <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
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
        </div>
    );
}

export default PostEditor;

interface AddAttachmentsButtonProps {
    onFilesSelected: (files: File[]) => void;
    disabled: boolean;
}

function AddAttachmentsButton(props: AddAttachmentsButtonProps) {
    const { onFilesSelected, disabled } = props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (
        <>
            <Button variant={"ghost"} size={"icon"} className="text-primary hover:text-primary" disabled={disabled} onClick={() => fileInputRef?.current?.click()}>
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
            />
        </>
    );
}

interface AttachmentPreviewsProps {
    attachments: Attachment[];
    removeAttachment: (index: number) => void;
}

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

interface AttachmentPreviewProps {
    attachment: Attachment;
    onRemoveClick: () => void;
}

function AttachmentPreview(props: AttachmentPreviewProps) {
    const {
        attachment: { file, isUploading, progress },
        onRemoveClick,
    } = props;

    const src = URL.createObjectURL(file);
    return (
        <div className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}>
            {file.type.startsWith("image") ? (
                <Image src={src} alt="attachment preview" width={500} height={500} className="size-fit max-h-[30rem] rounded-2xl" />
            ) : (
                <video controls className="size-fit max-h-[30rem] rounded-2xl">
                    <source src={src} type={file.type} />
                </video>
            )}
            {!isUploading && (
                <button onClick={onRemoveClick} className="absolute top-3 right-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60">
                    <ImageConfig.CloseIcon size={20} />
                </button>
            )}
            {isUploading && (
                <div className="absolute bottom-3 left-3 right-3 h-1.5 overflow-hidden rounded-full bg-background/30">
                    <div 
                        className="h-full bg-primary transition-all duration-300 ease-out" 
                        style={{ width: `${progress}%` }} 
                    />
                </div>
            )}
        </div>
    );
}
