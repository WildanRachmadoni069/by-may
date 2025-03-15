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
import { Home, HelpCircle, Info } from "lucide-react";

export default function SEODashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pengaturan SEO</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan SEO untuk halaman statis website Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Home Page SEO Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Halaman Beranda
            </CardTitle>
            <CardDescription>
              Konfigurasi pengaturan SEO untuk halaman beranda website Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Atur judul, meta deskripsi, dan optimalkan untuk mesin pencari untuk
              meningkatkan visibilitas halaman beranda Anda.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/admin/seo/home" className="w-full">
              <Button className="w-full">Edit SEO Beranda</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* FAQ Page SEO Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Halaman FAQ
            </CardTitle>
            <CardDescription>
              Konfigurasi pengaturan SEO untuk halaman FAQ Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Optimalkan halaman FAQ Anda untuk membantu pelanggan menemukan jawaban
              atas pertanyaan umum melalui mesin pencari.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/admin/seo/faq" className="w-full">
              <Button className="w-full">Edit SEO FAQ</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* About Us Page SEO Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Halaman Tentang Kami
            </CardTitle>
            <CardDescription>
              Konfigurasi pengaturan SEO untuk halaman Tentang Kami Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Optimalkan halaman Tentang Kami untuk membantu pelanggan mengenal 
              bisnis Anda melalui mesin pencari.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/admin/seo/about" className="w-full">
              <Button className="w-full">Edit SEO Tentang Kami</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
