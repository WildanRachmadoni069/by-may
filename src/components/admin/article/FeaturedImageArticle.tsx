"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Plus, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
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

/**
 * Komponen untuk mengelola gambar utama artikel
 * Memungkinkan mengunggah, memperbarui, dan menghapus gambar dengan pengelolaan teks alt
 */
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileDialogOpenRef = useRef<boolean>(false);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Perbarui state saat nilai prop berubah
  useEffect(() => {
    setPreview(value?.url ?? null);
    setAltText(value?.alt ?? "");
  }, [value]);

  // Bersihkan timeout saat komponen unmount
  useEffect(() => {
    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Ekstrak publicId dari URL Cloudinary untuk pembaruan gambar
   */
  const extractPublicId = (url: string) => {
    const parts = url.split("/");
    const filenameWithExt = parts.pop() || "";
    const publicId = filenameWithExt.split(".")[0];
    return publicId;
  };

  /**
   * Menangani pemilihan file dan unggahan
   */
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
        throw new Error(`Gagal mengunggah: ${response.statusText}`);
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengunggah gambar. Silakan coba lagi.",
      });
    } finally {
      setIsUploading(false);
      setIsEditing(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /**
   * Menangani penghapusan gambar
   */
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
          throw new Error("Gagal menghapus gambar");
        }

        setPreview(null);
        onChange({ url: "", alt: "" });
        toast({
          title: "Gambar dihapus",
          description: "Gambar berhasil dihapus dari Cloudinary",
        });
      } catch (error) {
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

  /**
   * Memicu dialog pemilihan file
   */
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
