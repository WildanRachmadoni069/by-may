"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, HelpCircle, Info, AlertCircle } from "lucide-react";
import { useSEOSettings } from "@/hooks/useSEOSettings";
import { useSEOStore } from "@/store/useSEOStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

export default function SEODashboardPage() {
  const { seoSettings, isLoading, error, mutate } = useSEOSettings();
  const { loading, setLoading, error: storeError, setError } = useSEOStore();
  // Sync loading and error states with Zustand store
  useEffect(() => {
    setLoading(isLoading);
    // Only treat non-404 errors as actual errors
    if (error && !error.message?.includes("not found")) {
      setError(error.message);
    } else {
      setError(null);
    }
  }, [isLoading, error, setLoading, setError]);

  // Get settings for specific pages
  const homepageSetting = seoSettings?.find(
    (setting) => setting.pageId === "homepage"
  );
  const faqSetting = seoSettings?.find((setting) => setting.pageId === "faq");
  const aboutSetting = seoSettings?.find(
    (setting) => setting.pageId === "about"
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-full max-w-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Gagal memuat pengaturan SEO: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pengaturan SEO</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan SEO untuk halaman statis website Anda
        </p>
      </div>{" "}
      {isLoading ? null : (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {seoSettings?.length === 0
              ? "Belum ada data SEO. Silahkan buat data SEO untuk setiap halaman dengan mengklik tombol di bawah masing-masing kartu."
              : "Klik pada masing-masing kartu untuk mengelola pengaturan SEO halaman tersebut."}
          </AlertDescription>
        </Alert>
      )}{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Home Page SEO Card */}
        <Card
          className={`flex flex-col h-full ${
            !homepageSetting ? "border-dashed border-gray-300" : ""
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Halaman Beranda
              {!homepageSetting && <Badge className="ml-2">Perlu dibuat</Badge>}
            </CardTitle>
            <CardDescription>
              Konfigurasi pengaturan SEO untuk halaman beranda website Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm">
              {homepageSetting ? (
                <>
                  Judul:{" "}
                  {homepageSetting.title.length > 50
                    ? `${homepageSetting.title.substring(0, 50)}...`
                    : homepageSetting.title}
                </>
              ) : (
                "Atur judul, meta deskripsi, dan optimalkan untuk mesin pencari untuk meningkatkan visibilitas halaman beranda Anda."
              )}
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Link href="/dashboard/admin/seo/home" className="w-full">
              <Button className="w-full">
                {homepageSetting ? "Edit" : "Buat"} SEO Beranda
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* FAQ Page SEO Card */}
        <Card
          className={`flex flex-col h-full ${
            !faqSetting ? "border-dashed border-gray-300" : ""
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Halaman FAQ
              {!faqSetting && <Badge className="ml-2">Perlu dibuat</Badge>}
            </CardTitle>
            <CardDescription>
              Konfigurasi pengaturan SEO untuk halaman FAQ Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm">
              {faqSetting ? (
                <>
                  Judul:{" "}
                  {faqSetting.title.length > 50
                    ? `${faqSetting.title.substring(0, 50)}...`
                    : faqSetting.title}
                </>
              ) : (
                "Optimalkan halaman FAQ Anda untuk membantu pelanggan menemukan jawaban atas pertanyaan umum melalui mesin pencari."
              )}
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Link href="/dashboard/admin/seo/faq" className="w-full">
              <Button className="w-full">
                {faqSetting ? "Edit" : "Buat"} SEO FAQ
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* About Us Page SEO Card */}
        <Card
          className={`flex flex-col h-full ${
            !aboutSetting ? "border-dashed border-gray-300" : ""
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Halaman Tentang Kami
              {!aboutSetting && <Badge className="ml-2">Perlu dibuat</Badge>}
            </CardTitle>
            <CardDescription>
              Konfigurasi pengaturan SEO untuk halaman Tentang Kami Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm">
              {aboutSetting ? (
                <>
                  Judul:{" "}
                  {aboutSetting.title.length > 50
                    ? `${aboutSetting.title.substring(0, 50)}...`
                    : aboutSetting.title}
                </>
              ) : (
                "Optimalkan halaman Tentang Kami untuk membantu pelanggan mengenal bisnis Anda melalui mesin pencari."
              )}
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Link href="/dashboard/admin/seo/about" className="w-full">
              <Button className="w-full">
                {aboutSetting ? "Edit" : "Buat"} SEO Tentang Kami
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
