"use client";

import { useEffect } from "react";
import { PageSeoForm } from "@/components/admin/seo/PageSeoForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSEOSetting } from "@/hooks/useSEOSettings";
import { useSEOStore } from "@/store/useSEOStore";
import { createSEOSetting } from "@/lib/api/seo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function AboutPageSEO() {
  const pageId = "about";
  const { toast } = useToast();
  const { seoSetting, isLoading, error, mutate } = useSEOSetting(pageId);
  const {
    currentSEOSetting,
    loading,
    error: storeError,
    setCurrentSEOSetting,
    setLoading,
    setError,
  } = useSEOStore();
  // Sync with Zustand store
  useEffect(() => {
    setLoading(isLoading);

    // Handle error state - but don't treat 404 (not found) as an error
    if (error && !error.message?.includes("not found")) {
      setError(error.message);
    } else {
      setError(null);
    }

    // If seoSetting is explicitly null (API returned 404), clear the current setting
    // This ensures we show the "create" UI when needed
    if (seoSetting === null) {
      setCurrentSEOSetting(null);
    } else if (seoSetting) {
      // If we got a valid setting, store it
      setCurrentSEOSetting(seoSetting);
    }
  }, [
    seoSetting,
    isLoading,
    error,
    setCurrentSEOSetting,
    setLoading,
    setError,
  ]);
  // Removed automatic creation of SEO data
  // We will instead show a UI to let the user manually create it

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (storeError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{storeError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/seo">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">SEO Halaman Tentang Kami</h1>
          <p className="text-sm text-muted-foreground">
            Optimalisasi halaman Tentang Kami untuk mesin pencari
          </p>
        </div>
      </div>

      {/* Tampilkan pesan jika data SEO tidak ada */}
      {!isLoading && !currentSEOSetting && !storeError && (
        <div className="mb-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Data SEO belum ada. Klik tombol di bawah untuk membuatnya.
            </AlertDescription>
          </Alert>
          <Button
            className="mt-4"
            onClick={async () => {
              try {
                setLoading(true);
                const defaultData = {
                  pageId: "about",
                  title: "Tentang Kami | Al-Quran Custom Surabaya",
                  description:
                    "By May Scarf adalah spesialis Al-Quran custom nama dan perlengkapan ibadah berkualitas di Surabaya. Ketahui lebih lanjut tentang kami.",
                  keywords:
                    "tentang kami, by may scarf, al-quran custom surabaya, perlengkapan ibadah",
                  ogImage: "",
                };
                const newSeoSetting = await createSEOSetting(defaultData);
                setCurrentSEOSetting(newSeoSetting);
                mutate(newSeoSetting);
                toast({
                  title: "Data SEO berhasil dibuat",
                  description:
                    "Pengaturan SEO untuk halaman tentang kami telah dibuat",
                });
              } catch (err: any) {
                setError(err.message || "Gagal membuat data SEO");
                toast({
                  variant: "destructive",
                  title: "Gagal membuat data SEO",
                  description:
                    err.message || "Terjadi kesalahan saat membuat data SEO",
                });
              } finally {
                setLoading(false);
              }
            }}
          >
            Buat Data SEO Default
          </Button>
        </div>
      )}

      {currentSEOSetting && (
        <PageSeoForm
          initialValues={{
            title: currentSEOSetting.title || "",
            description: currentSEOSetting.description || "",
            keywords: currentSEOSetting.keywords || "",
            ogImage: currentSEOSetting.ogImage || "",
          }}
          pageId="about"
          pageSlug="tentang-kami"
          pageType="Tentang Kami"
          onSuccess={() => mutate()}
        />
      )}
    </div>
  );
}
