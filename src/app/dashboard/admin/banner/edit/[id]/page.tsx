"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import BannerForm, { Banner } from "@/components/admin/banner/BannerForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useBannerStore } from "@/store/useBannerStore";

export default function EditBannerPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bannerData, setBannerData] = useState<Banner | null>(null);
  const { getBanner, updateBanner, error, resetError } = useBannerStore();

  // Reset any previous errors when mounting
  useEffect(() => {
    resetError();
  }, [resetError]);

  // Fetch the banner data
  useEffect(() => {
    async function loadBanner() {
      setIsLoading(true);
      try {
        const data = await getBanner(params.id as string);

        if (data) {
          setBannerData({
            id: params.id as string,
            title: data.title || "",
            imageUrl: data.imageUrl || "",
            url: data.url || "",
            active: data.active ?? true,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Banner tidak ditemukan",
          });
          router.push("/dashboard/admin/banner");
        }
      } catch (error) {
        console.error("Error fetching banner:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data banner",
        });
        router.push("/dashboard/admin/banner");
      } finally {
        setIsLoading(false);
      }
    }

    loadBanner();
  }, [params.id, getBanner, toast, router]);

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

  const handleSubmit = async (formData: Banner) => {
    setIsSubmitting(true);

    try {
      await updateBanner(params.id as string, {
        title: formData.title,
        imageUrl: formData.imageUrl,
        url: formData.url,
        active: formData.active,
      });

      toast({
        title: "Banner berhasil diperbarui",
        description: "Perubahan telah berhasil disimpan.",
      });

      router.push("/dashboard/admin/banner");
    } catch (error) {
      // Error already handled by the store and displayed via useEffect
      console.error("Error updating banner:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!bannerData) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground mb-4">
          Banner tidak ditemukan
        </p>
        <button
          onClick={() => router.push("/dashboard/admin/banner")}
          className="text-primary hover:underline"
        >
          Kembali ke daftar banner
        </button>
      </div>
    );
  }

  return (
    <BannerForm
      initialData={bannerData}
      onSubmit={handleSubmit}
      submitButtonText="Perbarui Banner"
      isProcessing={isSubmitting}
    />
  );
}
