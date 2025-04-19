"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Props untuk komponen BannerImageUpload
 */
interface BannerImageProps {
  /** Nilai gambar saat ini */
  value: {
    url: string;
    alt?: string;
  };
  /** Handler untuk perubahan gambar */
  onChange: (value: { url: string; alt?: string }) => void;
  /** Class CSS tambahan */
  className?: string;
  /** Status disabled */
  disabled?: boolean;
}

/**
 * Komponen untuk upload dan pengelolaan gambar banner
 * Mendukung upload baru, update gambar, dan hapus gambar
 */
export default function BannerImageUpload({
  value,
  onChange,
  className,
  disabled = false,
}: BannerImageProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileDialogOpenRef = useRef<boolean>(false);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Bersihkan timeout saat komponen unmount
   */
  useEffect(() => {
    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Ekstrak publicId dari URL Cloudinary untuk pembaruan gambar
   * @param url URL gambar Cloudinary
   * @returns PublicId gambar
   */
  const extractPublicId = (url: string) => {
    const parts = url.split("/");
    const filenameWithExt = parts.pop() || "";
    const publicId = filenameWithExt.split(".")[0];
    return publicId;
  };

  /**
   * Menangani perubahan file yang dipilih
   * @param e Event perubahan input file
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

    // Validasi ukuran file (maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File terlalu besar",
        description: "Ukuran file maksimal 5MB",
      });
      setIsEditing(false);
      return;
    }

    // Validasi tipe file
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
    if (value.url) {
      setIsEditing(true);
    }

    try {
      const formData = new FormData();
      let response;

      if (value.url) {
        // Update gambar yang sudah ada
        const publicId = extractPublicId(value.url);
        formData.append("image", file);
        formData.append("publicId", publicId);

        response = await fetch("/api/cloudinary/update-image", {
          method: "POST",
          body: formData,
        });
      } else {
        // Upload gambar baru
        formData.append("file", file);
        formData.append("folder", "bymay-banners");
        formData.append("upload_preset", "bymay-banner");
        formData.append("tags", "banner,homepage");

        response = await fetch("/api/cloudinary/upload", {
          method: "POST",
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error(`Upload gagal: ${response.statusText}`);
      }

      const data = await response.json();
      const imageUrl = data.secure_url;

      onChange({
        url: imageUrl,
        alt: value.alt || "",
      });

      toast({
        title: value.url ? "Gambar diperbarui" : "Upload berhasil",
        description: value.url
          ? "Gambar berhasil diperbarui tanpa menghapus gambar lama"
          : "Gambar berhasil diupload",
      });
    } catch (error) {
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

  /**
   * Menangani penghapusan gambar
   */
  const handleRemove = async () => {
    if (!value.url) return;

    try {
      setIsDeleting(true);

      const response = await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: value.url }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      onChange({ url: "", alt: "" });

      toast({
        title: "Hapus berhasil",
        description: "Gambar berhasil dihapus",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hapus gagal",
        description: "Gagal menghapus gambar, silakan coba lagi",
      });
    } finally {
      setIsDeleting(false);
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
      {value.url ? (
        <div className="flex flex-col gap-4">
          {/* Preview image */}
          <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
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
              src={value.url}
              alt={value.alt || "Banner preview"}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 500px"
            />
          </div>

          <div className="flex gap-2">
            {/* Upload new button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEdit}
              disabled={isUploading || isEditing || isDeleting || disabled}
            >
              <Upload className="h-4 w-4 mr-2" />
              Ganti Gambar
            </Button>

            {/* Remove button */}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading || isEditing || isDeleting || disabled}
            >
              <X className="h-4 w-4 mr-2" />
              Hapus Gambar
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            onClick={handleFileInputClick}
            disabled={isUploading || isEditing || isDeleting || disabled}
          />
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col items-center justify-center w-full h-48 bg-gray-50 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-100 transition-colors",
            (isUploading || disabled) && "opacity-50 cursor-not-allowed"
          )}
          onClick={() =>
            !isUploading && !disabled && fileInputRef.current?.click()
          }
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 font-medium">
                Mengunggah gambar...
              </p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-medium">
                Klik untuk upload gambar banner
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Ukuran optimal: 1200x300px
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Format: JPG, PNG, atau WebP (Maks. 5MB)
              </p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            onClick={handleFileInputClick}
            disabled={isUploading || disabled}
          />
        </div>
      )}
    </div>
  );
}
