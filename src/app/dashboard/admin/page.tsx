import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  FileText,
  ImageIcon,
  HelpCircle,
  Search,
  LayoutDashboard,
} from "lucide-react";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header dengan pola konsisten seperti halaman admin lain */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Selamat datang di dashboard admin. Kelola toko Al-Quran custom
            bymayscarf dengan mudah.
          </p>
        </div>
      </div>

      {/* Quick Actions Grid - dengan pola yang konsisten */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Kelola Produk</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Tambah, edit, atau hapus produk Al-Quran custom cover
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard/admin/product">Kelola Produk</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">Kelola Artikel</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Buat dan kelola artikel blog untuk website
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/admin/artikel">Kelola Artikel</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
              <ImageIcon className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Kelola Banner</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Atur banner yang ditampilkan pada halaman beranda
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/admin/banner">Kelola Banner</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
              <HelpCircle className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-lg">Kelola FAQ</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Kelola pertanyaan dan jawaban untuk membantu pelanggan
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/admin/faq">Kelola FAQ</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
              <Search className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-lg">Pengaturan SEO</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Kelola pengaturan SEO untuk halaman statis website
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/admin/seo">Pengaturan SEO</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-200 transition-colors">
              <LayoutDashboard className="h-6 w-6 text-teal-600" />
            </div>
            <CardTitle className="text-lg">Kategori & Koleksi</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Organisir produk dengan kategori dan koleksi
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/admin/product/category">
                Kelola Kategori
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
