"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  Pencil,
  PlusCircle,
  Trash,
  FileImage,
  Loader2,
  CircleSlashed,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useBannerStore, BannerFilterStatus } from "@/store/useBannerStore";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Halaman pengelolaan banner untuk admin
 * Menampilkan daftar banner dan aksi-aksi terkait
 */
function AdminBannerPage() {
  const { toast } = useToast();
  const {
    banners,
    loading,
    error,
    fetchBanners,
    deleteBanner,
    filter,
    setFilterStatus,
    getFilteredBanners,
    deletingBanners,
  } = useBannerStore();

  // Ambil data banner saat halaman dimuat
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Tampilkan pesan error jika ada
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error, toast]);

  // Dapatkan banner yang difilter
  const filteredBanners = getFilteredBanners();

  /**
   * Menangani penghapusan banner
   * @param bannerId ID banner yang akan dihapus
   */
  const handleDelete = async (bannerId: string) => {
    try {
      await deleteBanner(bannerId);

      toast({
        title: "Berhasil",
        description: "Banner telah dihapus",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus banner",
      });
    }
  };

  /**
   * Mendapatkan badge status banner
   */
  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-500">Aktif</Badge>;
    }
    return <Badge variant="secondary">Nonaktif</Badge>;
  };

  /**
   * Render state kosong atau tidak ditemukan
   */
  const renderEmptyState = () => {
    if (loading && banners.length === 0) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    if (filter.status !== "all" && filteredBanners.length === 0) {
      // Tampilkan pesan saat filter status tidak menampilkan hasil
      return (
        <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
          <CircleSlashed className="h-8 w-8" />
          <p>
            Tidak ada banner dengan status{" "}
            {filter.status === "active" ? "Aktif" : "Nonaktif"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterStatus("all")}
            className="mt-2"
          >
            Tampilkan Semua
          </Button>
        </div>
      );
    }

    // Tampilkan pesan "tidak ada banner" saat belum ada banner
    return (
      <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
        <FileImage className="h-8 w-8" />
        <p>Belum ada banner</p>
        <Link href="/dashboard/admin/banner/add">
          <Button size="sm" className="mt-2">
            <PlusCircle className="h-4 w-4 mr-2" /> Tambah Banner
          </Button>
        </Link>
      </div>
    );
  };

  // Tampilkan skeleton loader saat loading pertama kali
  if (loading && banners.length === 0) {
    return (
      <div className="space-y-4">
        <div className="w-full flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header halaman */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Kelola Banner</h1>
          <p className="text-muted-foreground">
            Atur banner yang ditampilkan pada halaman beranda
          </p>
        </div>
        <Link href="/dashboard/admin/banner/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Banner
          </Button>
        </Link>
      </div>

      {/* Filter dengan tabs saja, tanpa dropdown */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          {/* Tabs Filter */}
          <Tabs
            value={filter.status}
            onValueChange={(value) =>
              setFilterStatus(value as BannerFilterStatus)
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="active">Aktif</TabsTrigger>
              <TabsTrigger value="inactive">Nonaktif</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="text-sm text-gray-500">
            {filteredBanners.length} banner ditampilkan
          </div>
        </div>
      </div>

      {/* Tabel banner */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 relative">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && filteredBanners.length === 0 ? (
              Array(3)
                .fill(null)
                .map((_, index) => (
                  <TableRow key={`skeleton-${index}`} className="animate-pulse">
                    <TableCell>
                      <Skeleton className="h-5 w-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-20 w-40 rounded-md" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            ) : filteredBanners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {renderEmptyState()}
                </TableCell>
              </TableRow>
            ) : (
              filteredBanners.map((banner, index) => (
                <TableRow key={banner.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{banner.title}</TableCell>
                  <TableCell>
                    <div className="relative w-40 h-20 overflow-hidden rounded-md">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {banner.url || "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(banner.active)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {banner.url && (
                        <Link href={banner.url} target="_blank">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Lihat Banner"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      <Link href={`/dashboard/admin/banner/edit/${banner.id}`}>
                        <Button variant="ghost" size="sm" title="Edit Banner">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            title="Hapus Banner"
                            disabled={deletingBanners[banner.id]}
                          >
                            {deletingBanners[banner.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Banner</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus banner ini?
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(banner.id)}
                              disabled={deletingBanners[banner.id]}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingBanners[banner.id] ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Menghapus...
                                </>
                              ) : (
                                "Hapus"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}

            {/* Indikator loading inline */}
            {loading && filteredBanners.length > 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2 text-sm text-muted-foreground">
                      Memuat data...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default AdminBannerPage;
