import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash, Upload, Pencil } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface BannerImage {
  url: string;
  alt?: string;
}

interface BannerImageUploadProps {
  value: BannerImage;
  onChange: (imageData: BannerImage) => void;
  disabled?: boolean;
}

export default function BannerImageUpload({
  value,
  onChange,
  disabled = false,
}: BannerImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = useCallback(
    async (file: File) => {
      if (!file) return;

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload/banner", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();

        onChange({
          url: data.secure_url,
          alt: value.alt || "",
        });

        toast({
          title: "Gambar berhasil diupload",
          description: "Gambar banner telah berhasil diupload.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Upload gagal",
          description:
            "Terjadi kesalahan saat mengupload gambar. Silakan coba lagi.",
        });
        console.error("Error uploading image:", error);
      } finally {
        setUploading(false);
      }
    },
    [onChange, toast, value.alt]
  );

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDeleteImage = () => {
    onChange({ url: "", alt: "" });
  };

  return (
    <div className="space-y-4">
      {value.url ? (
        <div className="relative">
          <div className="relative w-full h-[200px] rounded-lg overflow-hidden border">
            <Image
              src={value.url}
              alt={value.alt || "Banner image"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full bg-white/80 hover:bg-white"
              disabled={disabled || uploading}
              onClick={() =>
                document.getElementById("banner-image-upload")?.click()
              }
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="rounded-full"
              disabled={disabled || uploading}
              onClick={handleDeleteImage}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() =>
            document.getElementById("banner-image-upload")?.click()
          }
        >
          <input
            type="file"
            id="banner-image-upload"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
            disabled={disabled || uploading}
          />
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <p className="font-medium">
            {uploading ? "Mengupload..." : "Klik untuk upload gambar banner"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            PNG, JPG atau WEBP (maks. 5MB, disarankan ukuran 1200x300px)
          </p>
        </div>
      )}
      {/* Removed the alt text input field as banner title will be used for alt text */}
    </div>
  );
}
