"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

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
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setPreview(value ?? null);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);

        if (preview) {
          await fetch("/api/delete", {
            method: "POST",
            body: JSON.stringify({ url: preview }),
            headers: {
              "Content-Type": "application/json",
            },
          });
        }

        const response = await fetch("/api/upload/image-product", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        const imageUrl = result.secure_url;
        setPreview(imageUrl);
        onChange(imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsUploading(false);
      }
    } else {
      setIsUploading(false); // Reset uploading state if no file is selected
    }
  };

  const handleRemove = async () => {
    if (preview) {
      await fetch("/api/delete", {
        method: "POST",
        body: JSON.stringify({ url: preview }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    setPreview(null);
    onChange(null);
  };

  const handleEdit = () => {
    setIsUploading(true);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) =>
      handleFileChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
    input.click();
  };

  return (
    <div className={cn("relative aspect-square w-full", className)}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id={`image-upload-${id}`}
      />
      {preview ? (
        <div className="relative h-full w-full">
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
              <Spinner size="lg" />
            </div>
          )}
          <Image
            src={preview || "/placeholder.svg"}
            alt="Preview"
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
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleRemove}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={`image-upload-${id}`}
          className="flex flex-col items-center justify-center h-full border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <Spinner size="lg" />
            ) : (
              <>
                <Plus className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500">Gambar</p>
              </>
            )}
          </div>
        </label>
      )}
    </div>
  );
}

export default ImageUploadPreview;
