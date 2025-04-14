"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Plus, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface FeaturedImageArticleProps {
  onChange: (imageData: { url: string; alt: string } | null) => void;
  value?: { url: string; alt: string } | null;
  className?: string;
}

function FeaturedImageArticle({
  onChange,
  value,
  className,
}: FeaturedImageArticleProps) {
  const [preview, setPreview] = useState<string | null>(value?.url ?? null);
  const [altText, setAltText] = useState<string>(value?.alt ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Create a ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Create a ref to track if a file dialog is open
  const fileDialogOpenRef = useRef<boolean>(false);
  // Create a safety timeout ref
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setPreview(value?.url ?? null);
    setAltText(value?.alt ?? "");
  }, [value]);

  // Clean up any timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to extract publicId from Cloudinary URL
  const extractPublicId = (url: string) => {
    const parts = url.split("/");
    const filenameWithExt = parts.pop() || "";
    const publicId = filenameWithExt.split(".")[0];
    return publicId;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    fileDialogOpenRef.current = false; // Dialog is now closed

    // Cancel any pending safety timeout
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }

    // If no file is selected (user canceled), reset the editing state
    if (!file) {
      setIsEditing(false);
      return;
    }

    // Set uploading states
    setIsUploading(true);
    if (preview) {
      setIsEditing(true);
    }

    try {
      const formData = new FormData();
      formData.append("image", file);

      let response;

      if (preview) {
        const publicId = extractPublicId(preview);
        formData.append("publicId", publicId);

        response = await fetch("/api/cloudinary/update-image", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/upload/image-article", {
          method: "POST",
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const imageUrl = result.secure_url;

      setPreview(imageUrl);
      onChange({ url: imageUrl, alt: altText });

      toast({
        title: preview ? "Gambar diperbarui" : "Gambar diunggah",
        description: preview
          ? "Gambar berhasil diperbarui tanpa menghapus gambar lama"
          : "Gambar berhasil diunggah",
      });
    } catch (error) {
      console.error("Error uploading/updating image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengunggah gambar. Silakan coba lagi.",
      });
    } finally {
      setIsUploading(false);
      setIsEditing(false);

      // Reset the file input value
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    if (value?.url) {
      try {
        setIsDeleting(true);
        const response = await fetch("/api/cloudinary/delete-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: value.url }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete image");
        }

        setPreview(null);
        onChange({ url: "", alt: "" });
        toast({
          title: "Gambar dihapus",
          description: "Gambar berhasil dihapus dari Cloudinary",
        });
      } catch (error) {
        console.error("Error removing image:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal menghapus gambar. Silakan coba lagi.",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = () => {
    // If already editing, don't do anything
    if (isEditing || isUploading || isDeleting) return;

    setIsEditing(true);
    fileDialogOpenRef.current = true;

    // Create a safety timeout to reset editing state if dialog is canceled
    safetyTimeoutRef.current = setTimeout(() => {
      // If the dialog was opened but handleFileChange wasn't called,
      // it means the user likely canceled
      if (fileDialogOpenRef.current) {
        setIsEditing(false);
        fileDialogOpenRef.current = false;
      }
    }, 1000); // Give enough time for the dialog to be handled

    // Trigger the file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // This function will be called before showing the file picker dialog
  const handleFileInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    fileDialogOpenRef.current = true;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative w-full">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          onClick={handleFileInputClick}
          className="hidden"
          id="featured-image-upload"
          ref={fileInputRef}
        />
        {preview ? (
          <div className="relative w-full h-[300px]">
            {/* Show loading overlay */}
            {(isUploading || isEditing || isDeleting) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/75 rounded-lg text-white z-10">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>
                  {isDeleting
                    ? "Menghapus gambar..."
                    : isEditing
                    ? "Mengganti gambar..."
                    : "Mengunggah gambar..."}
                </p>
              </div>
            )}
            <Image
              src={preview}
              alt={altText}
              fill
              className="object-cover rounded-lg"
            />
            <div className="absolute bottom-2 left-2 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleEdit}
                disabled={isUploading || isEditing || isDeleting}
              >
                {isEditing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleRemoveImage}
                disabled={isUploading || isEditing || isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Empty state UI
          <label
            htmlFor="featured-image-upload"
            className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Mengunggah Gambar...</p>
                </>
              ) : (
                <>
                  <Plus className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500">Unggah Gambar Utama</p>
                </>
              )}
            </div>
          </label>
        )}
      </div>

      {/* Alt text input */}
      {preview && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="alt-text">Teks Alt</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Teks alt menjelaskan gambar untuk pembaca layar dan SEO.
                  </p>
                  <p>Buatlah deskripsi yang jelas namun singkat.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="alt-text"
            type="text"
            value={altText}
            onChange={(e) => {
              setAltText(e.target.value);
              onChange({ url: preview, alt: e.target.value });
            }}
            placeholder="Deskripsikan gambar tersebut"
            className="w-full"
            disabled={isUploading || isEditing || isDeleting}
          />
        </div>
      )}
    </div>
  );
}

export default FeaturedImageArticle;
