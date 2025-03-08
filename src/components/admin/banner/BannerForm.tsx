"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import BannerImageUpload from "./BannerImageUpload";

// Banner interface
export interface Banner {
  id?: string;
  title: string;
  imageUrl: string;
  url: string;
  active: boolean;
}

// Image interface to match BannerImageUpload component
interface BannerImage {
  url: string;
  alt?: string;
}

interface BannerFormProps {
  initialData?: Banner;
  onSubmit: (data: Banner) => Promise<void>;
  submitButtonText?: string;
  isProcessing?: boolean;
}

export default function BannerForm({
  initialData,
  onSubmit,
  submitButtonText = "Simpan Banner",
  isProcessing = false,
}: BannerFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!initialData?.id;

  const [formData, setFormData] = React.useState<Banner>({
    id: initialData?.id || undefined,
    title: initialData?.title || "",
    imageUrl: initialData?.imageUrl || "",
    url: initialData?.url || "",
    active: initialData?.active ?? true,
  });

  // For image
  const [imageData, setImageData] = React.useState<BannerImage>({
    url: initialData?.imageUrl || "",
    alt: initialData?.title || "",
  });

  // Function to handle image data changes with correct typing
  const handleImageChange = (newImageData: BannerImage) => {
    setImageData(newImageData);
  };

  // Update imageUrl when imageData changes
  React.useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: imageData.url,
    }));
  }, [imageData.url]);

  // Update image alt when title changes
  React.useEffect(() => {
    if (imageData.url) {
      setImageData((prev) => ({
        ...prev,
        alt: formData.title,
      }));
    }
  }, [formData.title]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      active: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Judul banner tidak boleh kosong",
      });
      return;
    }

    if (!formData.imageUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gambar banner harus diupload",
      });
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menyimpan banner. Silakan coba lagi.",
      });
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {isEditMode ? "Edit Banner" : "Tambah Banner Baru"}
        </h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Banner</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Masukkan judul banner"
                  required
                  disabled={isProcessing}
                />
                <p className="text-sm text-muted-foreground">
                  Judul akan digunakan sebagai alt text untuk gambar
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL Tujuan</Label>
                <Input
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="Contoh: /promo/lebaran atau https://example.com/promo"
                  disabled={isProcessing}
                />
                <p className="text-sm text-muted-foreground">
                  URL yang akan dituju saat banner diklik
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Gambar Banner</Label>
              <BannerImageUpload
                value={imageData}
                onChange={handleImageChange}
                disabled={isProcessing}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={handleSwitchChange}
                disabled={isProcessing}
              />
              <Label htmlFor="active">Aktifkan Banner</Label>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                variant="outline"
                type="button"
                disabled={isProcessing}
                onClick={() => router.push("/dashboard/admin/banner")}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? "Memproses..." : submitButtonText}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
