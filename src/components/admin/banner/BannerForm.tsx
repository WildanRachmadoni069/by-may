"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import BannerImageUpload from "./BannerImageUpload";
import { BannerFormData, BannerCreateInput } from "@/types/banner";

/**
 * Interface untuk data gambar banner
 */
interface BannerImage {
  url: string;
  alt?: string;
}

/**
 * Props untuk komponen BannerForm
 */
interface BannerFormProps {
  /** Data awal untuk form (opsional) */
  initialData?: BannerFormData;
  /** Fungsi yang dipanggil saat form disubmit */
  onSubmit: (data: BannerCreateInput) => Promise<void>;
  /** Teks untuk tombol submit */
  submitButtonText?: string;
  /** State loading saat proses submit */
  isProcessing?: boolean;
}

/**
 * Komponen form untuk pengelolaan banner
 * Digunakan untuk menambah dan mengedit banner
 */
export default function BannerForm({
  initialData,
  onSubmit,
  submitButtonText = "Simpan Banner",
  isProcessing = false,
}: BannerFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!initialData?.id;

  const [formData, setFormData] = React.useState<BannerFormData>({
    id: initialData?.id || undefined,
    title: initialData?.title || "",
    imageUrl: initialData?.imageUrl || "",
    url: initialData?.url || "",
    active: initialData?.active ?? true,
  });

  const [imageData, setImageData] = React.useState<BannerImage>({
    url: initialData?.imageUrl || "",
    alt: initialData?.title || "",
  });

  /**
   * Menangani perubahan data gambar
   */
  const handleImageChange = (newImageData: BannerImage) => {
    setImageData(newImageData);
  };

  /**
   * Memperbarui URL gambar saat imageData berubah
   */
  React.useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: imageData.url,
    }));
  }, [imageData.url]);

  /**
   * Memperbarui alt text gambar saat judul berubah
   */
  React.useEffect(() => {
    if (imageData.url) {
      setImageData((prev) => ({
        ...prev,
        alt: formData.title,
      }));
    }
  }, [formData.title]);

  /**
   * Menangani perubahan input teks
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Menangani perubahan status aktif/nonaktif
   */
  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      active: checked,
    }));
  };

  /**
   * Menangani submit form
   */ const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Judul banner tidak boleh kosong",
      });
      return;
    }

    if (!formData.imageUrl?.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gambar banner harus diupload",
      });
      return;
    } // Convert form data to BannerCreateInput
    const submitData: BannerCreateInput = {
      title: formData.title.trim(),
      imageUrl: formData.imageUrl.trim(),
      url: formData.url.trim() || null,
      active: Boolean(formData.active),
    };
    try {
      console.log("Submitting banner data:", submitData);
      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting banner:", error);
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
