"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Plus, Info } from "lucide-react";
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

  useEffect(() => {
    setPreview(value?.url ?? null);
    setAltText(value?.alt ?? "");
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

        const response = await fetch("/api/upload/image-article", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        const imageUrl = result.secure_url;
        setPreview(imageUrl);
        onChange({ url: imageUrl, alt: altText });
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsUploading(false);
      }
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
    setAltText("");
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
    <div className={cn("space-y-4", className)}>
      <div className="relative w-full">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="featured-image-upload"
        />
        {preview ? (
          <div className="relative w-full h-[300px]">
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                <Spinner size="lg" />
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
            htmlFor="featured-image-upload"
            className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? (
                <Spinner size="lg" />
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
          />
        </div>
      )}
    </div>
  );
}

export default FeaturedImageArticle;
