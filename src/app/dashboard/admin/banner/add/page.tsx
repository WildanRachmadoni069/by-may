"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import BannerForm, { Banner } from "@/components/admin/banner/BannerForm";
import { useBannerStore } from "@/store/useBannerStore";

export default function AddBannerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addBanner, error, resetError } = useBannerStore();

  // Reset any previous errors when mounting
  useEffect(() => {
    resetError();
  }, [resetError]);

  // Show error toast when there's an error from the store
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error, toast]);

  const handleSubmit = async (bannerData: Banner) => {
    setIsSubmitting(true);

    try {
      await addBanner({
        title: bannerData.title,
        imageUrl: bannerData.imageUrl,
        url: bannerData.url,
        active: bannerData.active,
      });

      toast({
        title: "Banner berhasil dibuat",
        description: "Banner telah berhasil disimpan.",
      });

      router.push("/dashboard/admin/banner");
    } catch (error) {
      // Error already handled by the store and displayed via useEffect
      console.error("Error creating banner:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BannerForm
      onSubmit={handleSubmit}
      submitButtonText="Simpan Banner"
      isProcessing={isSubmitting}
    />
  );
}
