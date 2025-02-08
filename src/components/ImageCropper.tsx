/**
 * ImageCropper Component
 * 
 * A modal-based image cropping tool using Cropper.js with rotation, zoom, and flip capabilities.
 * 
 * Features:
 * - Drag-to-crop interface
 * - Rotation control (-180° to 180°)
 * - Zoom control (0.1x to 3x)
 * - Horizontal/Vertical flip
 * - Aspect ratio locking
 * - Returns cropped image as Blob
 * 
 * Dependencies:
 * - Cropper.js for core cropping functionality
 * - Shadcn UI components for interface elements
 * 
 * Usage:
 * <ImageCropper
 *   src={imageSource}
 *   cropAspectRatio={desiredAspect}
 *   onCropped={(blob) => handleCroppedImage(blob)}
 *   onClose={closeModalHandler}
 * />
 */

import { useEffect, useRef, useState } from "react";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import Image from "next/image";

interface ImageCropperProps {
  /** 
   * Source URL of the image to crop 
   */
  src: string;
  /** 
   * Aspect ratio for cropping (NaN for free ratio)
   */
  cropAspectRatio: number;
  /** 
   * Callback function that receives the cropped image Blob
   */
  onCropped: (blob: Blob | null) => void;
  /** 
   * Callback to close the modal
   */
  onClose: () => void;
}

const ImageCropper = (props: ImageCropperProps) => {
  const { src, cropAspectRatio, onCropped, onClose } = props;
  // Refs for Cropper.js instance and image element
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);
  
  // Component state
  const [rotate, setRotate] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  // Lifecycle management
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Initialize Cropper.js when component mounts or source changes
  useEffect(() => {
    if (!isMounted || !imageRef.current || !src) return;

    // Cleanup existing Cropper instance
    if (cropperRef.current) {
      cropperRef.current.destroy();
    }

    // Initialize new Cropper instance
    cropperRef.current = new Cropper(imageRef.current, {
      viewMode: 0,
      autoCrop: true,
      guides: true,
      zoomOnTouch: false,
      zoomOnWheel: false,
      aspectRatio: cropAspectRatio,
      crop: () => {
        // Sync rotation and zoom states with Cropper data
        if (cropperRef.current) {
          const data = cropperRef.current.getData();
          setRotate(data.rotate);
          setZoom(Math.abs(data.scaleX || 1));
        }
      },
      ready() {
        // Initialize state with current Cropper values
        setZoom(cropperRef.current?.getData().scaleX || 1);
        setRotate(cropperRef.current?.getData().rotate || 0);
      }
    });

    return () => {
      cropperRef.current?.destroy();
    };
  }, [src, cropAspectRatio, isMounted]);

  /** 
   * Handles rotation changes
   * @param {number} value - Rotation angle in degrees (-180 to 180)
   */
  const handleRotateChange = (value: number) => {
    setRotate(value);
    cropperRef.current?.rotateTo(value);
  };

  /** 
   * Handles zoom level changes
   * @param {number} value - Zoom multiplier (0.1 to 3)
   */
  const handleZoomChange = (value: number) => {
    setZoom(value);
    cropperRef.current?.scale(value);
  };

  /** 
   * Flips the image horizontally or vertically
   * @param {"horizontal" | "vertical"} direction - Flip direction
   */
  const handleFlip = (direction: "horizontal" | "vertical") => {
    if (cropperRef.current) {
      const data = cropperRef.current.getData();
      if (direction === "horizontal") {
        cropperRef.current.scaleX(-data.scaleX);
      } else {
        cropperRef.current.scaleY(-data.scaleY);
      }
      setZoom(Math.abs(data.scaleX || 1));
    }
  };

  /** 
   * Finalizes the crop and returns the result
   */
  const handleCrop = async () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCroppedCanvas();
      canvas.toBlob((blob) => {
        onCropped(blob);
        onClose();
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
          <DialogDescription>
            Adjust the image using the controls below
          </DialogDescription>
        </DialogHeader>
        
        {/* Image Container */}
        <div className="space-y-4">
          {src && (
            <div className="space-y-4">
              <div className=" bg-gray-100 relative">
                {/*
                  Using regular img element instead of Next.js Image because:
                  1. Cropper.js requires direct DOM manipulation
                  2. Next.js Image component uses complex layout handling
                  3. We need direct access to the image element reference
                */}
                <Image
                  ref={imageRef}
                  src={src}
                  alt="Source"
                  width={150}
                  height={150}
                  className="max-h-full max-w-full"
                />
              </div>

              {/* Controls Container */}
              <div className="space-y-6">
                {/* Rotation Control */}
                <div className="space-y-2">
                  <Label>Rotation: {rotate}°</Label>
                  <Slider
                    min={-180}
                    max={180}
                    step={1}
                    value={[rotate]}
                    onValueChange={([value]) => handleRotateChange(value)}
                  />
                </div>

                {/* Zoom Control */}
                <div className="space-y-2">
                  <Label>Zoom: {zoom.toFixed(1)}x</Label>
                  <Slider
                    min={0.1}
                    max={3}
                    step={0.1}
                    value={[zoom]}
                    onValueChange={([value]) => handleZoomChange(value)}
                  />
                </div>

                {/* Flip Controls */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleFlip("horizontal")}
                  >
                    Flip Horizontal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleFlip("vertical")}
                  >
                    Flip Vertical
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Dialog Footer */}
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCrop}>
            Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;