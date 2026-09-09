"use client";

import React, { useCallback, useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Media } from "@prisma/client";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface MediaLightboxProps {
  mediaList: Media[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

export default function MediaLightbox({
  mediaList,
  initialIndex,
  open,
  onClose,
}: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  const hasMultiple = mediaList.length > 1;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaList.length - 1));
  }, [mediaList.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < mediaList.length - 1 ? prev + 1 : 0));
  }, [mediaList.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handlePrev, handleNext, onClose]);

  const currentMedia = mediaList[currentIndex];
  if (!currentMedia) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col justify-between p-3 sm:p-6 outline-none select-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">
            Media preview {currentIndex + 1} of {mediaList.length}
          </DialogPrimitive.Title>

          {/* Top Bar */}
          <div className="flex items-center justify-between text-white/80 z-10 py-1">
            <div className="text-sm font-medium tracking-wide bg-black/40 px-3 py-1 rounded-full border border-white/10">
              {hasMultiple ? `${currentIndex + 1} / ${mediaList.length}` : "Photo"}
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-black/50 p-2 text-white/80 transition-all hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white border border-white/10"
              aria-label="Close media preview"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Media Container */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden my-2">
            {currentMedia.type === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={currentMedia.id}
                src={currentMedia.url}
                alt="Post attachment full view"
                className="max-h-[82vh] max-w-[95vw] rounded-xl object-contain drop-shadow-2xl transition-all duration-150 animate-in fade-in-50 zoom-in-95"
              />
            ) : (
              <video
                key={currentMedia.id}
                src={currentMedia.url}
                controls
                autoPlay
                className="max-h-[82vh] max-w-[95vw] rounded-xl drop-shadow-2xl"
              />
            )}

            {/* Prev / Next Navigation Buttons for Multi-Media */}
            {hasMultiple && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2.5 sm:p-3 text-white/90 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110 hover:text-white border border-white/10 focus:outline-none"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-6 sm:size-7" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2.5 sm:p-3 text-white/90 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110 hover:text-white border border-white/10 focus:outline-none"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-6 sm:size-7" />
                </button>
              </>
            )}
          </div>

          {/* Bottom spacer for centering balance */}
          <div className="h-6" />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
