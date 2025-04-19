"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  getBannerByIdAction,
  updateBannerAction,
} from "@/app/actions/banner-actions";
import BannerForm from "@/components/admin/banner/BannerForm";
import { Skeleton } from "@/components/ui/skeleton";
import { BannerFormData } from "@/types/banner";

/**
 * Halaman untuk mengedit banner
 */
export default function EditBannerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [banner, setBanner] = useState<BannerFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { id } = useParams<{ id: string }>();

  /**
   * Mengambil data banner berdasarkan ID
   */
  useEffect(() => {
    const loadBanner = async () => {
      try {
        setIsLoading(true);
        const data = await getBannerByIdAction(id);
        if (!data) {
          throw new Error("Banner tidak ditemukan");
        }
        setBanner({
          ...data,
          url: data.url || "", // Pastikan url selalu string, bukan null
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Banner tidak ditemukan atau terjadi kesalahan.",
        });
        router.push("/dashboard/admin/banner");
      } finally {
        setIsLoading(false);
      }
    };

    loadBanner();
  }, [id, router, toast]);

  /**
   * Menangani pembaruan banner
   * @param data Data banner yang diperbarui
   */
  const handleUpdate = async (data: BannerFormData) => {
    try {
      setIsProcessing(true);
      await updateBannerAction(id, data);

      toast({
        title: "Berhasil",
        description: "Banner telah diperbarui",
      });

      router.push("/dashboard/admin/banner");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memperbarui banner. Silakan coba lagi.",
      });
      setIsProcessing(false);
    }
  };

  // Tampilkan skeleton loading selama data dimuat
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <BannerForm
      initialData={banner || undefined}
      onSubmit={handleUpdate}
      submitButtonText="Perbarui Banner"
      isProcessing={isProcessing}
    />
  );
}
