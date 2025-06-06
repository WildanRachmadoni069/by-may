"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadPreviewProps {
  onChange: (url: string | null) => void;
  value?: string | null;
  className?: string;
  id: string;
}

function ImageUploadPreview({
  onChange,
  value,
  className,
  id,
}: ImageUploadPreviewProps) {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileDialogOpenRef = useRef<boolean>(false);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setPreview(value ?? null);
  }, [value]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Extract publicId from URL Cloudinary for image updates
   * @param url Cloudinary image URL
   * @returns PublicId of the image
   */
  const extractPublicId = (url: string) => {
    try {
      if (!url) return null;

      // Match pattern for Cloudinary URLs
      // Example: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/filename.jpg
      const match = url.match(/\/v\d+\/(.+?)(?:\.[^.]+)?$/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    fileDialogOpenRef.current = false;

    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }

    if (!file) {
      setIsEditing(false);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File terlalu besar",
        description: "Ukuran file maksimal 5MB",
      });
      setIsEditing(false);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Format file tidak didukung",
        description: "Silakan upload file gambar (JPG, PNG, atau WebP)",
      });
      setIsEditing(false);
      return;
    }

    setIsUploading(true);
    if (preview) {
      setIsEditing(true);
    }

    try {
      const formData = new FormData();
      let response;

      if (preview) {
        // Update existing image
        const publicId = extractPublicId(preview);
        formData.append("image", file);
        formData.append("publicId", publicId || "");

        response = await fetch("/api/cloudinary/update-image", {
          method: "POST",
          body: formData,
        });
      } else {
        // Upload new image
        formData.append("file", file);
        formData.append("folder", "products");
        formData.append("upload_preset", "product_bymay");
        formData.append("tags", "product,catalog");

        response = await fetch("/api/cloudinary/upload", {
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
      onChange(imageUrl);

      toast({
        title: preview ? "Gambar diperbarui" : "Upload berhasil",
        description: preview
          ? "Gambar berhasil diperbarui tanpa menghapus gambar lama"
          : "Gambar produk berhasil diupload",
      });
    } catch (error) {
      console.error("Error handling image:", error);
      toast({
        variant: "destructive",
        title: "Operasi gagal",
        description: "Gagal memproses gambar. Silakan coba lagi.",
      });
    } finally {
      setIsUploading(false);
      setIsEditing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!preview) return;

    setIsDeleting(true);

    try {
      const response = await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: preview }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      setPreview(null);
      onChange(null);

      toast({
        title: "Hapus berhasil",
        description: "Gambar produk berhasil dihapus",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        variant: "destructive",
        title: "Hapus gagal",
        description: "Gagal menghapus gambar. Silakan coba lagi.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (isEditing || isUploading || isDeleting) return;

    setIsEditing(true);
    fileDialogOpenRef.current = true;

    safetyTimeoutRef.current = setTimeout(() => {
      if (fileDialogOpenRef.current) {
        setIsEditing(false);
        fileDialogOpenRef.current = false;
      }
    }, 1000);

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputClick = () => {
    fileDialogOpenRef.current = true;
  };

  return (
    <div className={cn("relative aspect-square w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        onClick={handleFileInputClick}
        className="hidden"
        id={`image-upload-${id}`}
        disabled={isUploading || isEditing || isDeleting}
      />

      {preview ? (
        <div className="relative h-full w-full">
          {(isUploading || isEditing || isDeleting) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/75 rounded-lg text-white z-10">
              <Loader2 className="h-6 w-6 animate-spin mb-1" />
              <p className="text-xs">
                {isDeleting
                  ? "Menghapus..."
                  : isEditing
                  ? "Mengganti..."
                  : "Mengunggah..."}
              </p>
            </div>
          )}

          <Image
            src={preview}
            alt="Preview image"
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 300px"
          />

          <div className="absolute bottom-2 left-2 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full opacity-90 hover:opacity-100"
              onClick={handleEdit}
              disabled={isUploading || isEditing || isDeleting}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full opacity-90 hover:opacity-100"
              onClick={handleRemove}
              disabled={isUploading || isEditing || isDeleting}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={`image-upload-${id}`}
          className={cn(
            "flex flex-col items-center justify-center h-full border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
            (isUploading || isEditing || isDeleting) &&
              "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin mb-2 text-gray-400" />
            ) : (
              <>
                <Plus className="h-8 w-8 text-gray-400 mb-1" />
                <p className="text-xs text-center text-gray-500">
                  Unggah Gambar
                </p>
              </>
            )}
          </div>
        </label>
      )}
    </div>
  );
}

export default ImageUploadPreview;
