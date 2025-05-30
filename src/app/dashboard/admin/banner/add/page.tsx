"use client";

import BannerForm from "@/components/admin/banner/BannerForm";
import { createBannerAction } from "@/app/actions/banner-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { BannerCreateInput } from "@/types/banner";

/**
 * Halaman untuk menambahkan banner baru
 */
export default function AddBannerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Menangani pembuatan banner baru
   * @param data Data banner yang akan dibuat
   */ const handleCreate = async (data: BannerCreateInput) => {
    try {
      setIsProcessing(true);
      await createBannerAction(data);

      toast({
        title: "Berhasil",
        description: "Banner telah ditambahkan",
      });

      router.push("/dashboard/admin/banner");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal membuat banner. Silakan coba lagi.",
      });
      setIsProcessing(false);
    }
  };

  return (
    <BannerForm
      onSubmit={handleCreate}
      submitButtonText="Tambah Banner"
      isProcessing={isProcessing}
    />
  );
}
