/**
 * Halaman Manajemen Artikel (Admin)
 *
 * Halaman ini menyediakan antarmuka untuk admin mengelola artikel:
 * - Melihat daftar semua artikel dengan paginasi
 * - Mencari dan memfilter artikel
 * - Menambah, mengedit, dan menghapus artikel
 *
 * Menggunakan Zustand untuk state management dan server-side pagination.
 */
"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pencil,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown,
  Search,
  PlusCircle,
  Loader2,
  FileText,
  X,
  CircleSlashed,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useArticleStore } from "@/store/useArticleStore";

function ArtikelAdminPage() {
  const { toast } = useToast();

  // State untuk menandai artikel yang sedang dihapus
  const [deletingArticles, setDeletingArticles] = useState<
    Record<string, boolean>
  >({});

  // State untuk input pencarian
  const [searchInput, setSearchInput] = useState("");

  // Menggunakan Zustand store untuk artikel
  const {
    articles,
    isLoading,
    error,
    pagination,
    filters,
    fetchArticles,
    deleteArticle,
    setFilter,
    resetFilters,
  } = useArticleStore();

  // Load data awal saat komponen pertama kali dimuat
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  /**
   * Mengubah arah pengurutan artikel
   */
  const toggleSort = () => {
    const newDirection = filters.sortDirection === "desc" ? "asc" : "desc";
    setFilter("sortDirection", newDirection);
    fetchArticles({
      page: 1,
      sort: newDirection,
    });
  };

  /**
   * Menangani perpindahan halaman
   */
  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages || page === pagination.page)
      return;
    fetchArticles({ page });
  };

  /**
   * Menangani pencarian artikel
   */
  const handleSearch = () => {
    setFilter("searchQuery", searchInput);
    fetchArticles({
      page: 1,
      searchQuery: searchInput,
    });
  };

  /**
   * Mengatur ulang pencarian
   */
  const handleResetSearch = () => {
    setSearchInput("");
    setFilter("searchQuery", "");
    fetchArticles({ page: 1, searchQuery: "" });
  };

  /**
   * Menangani filter berdasarkan status artikel
   */
  const handleFilterStatus = (status: "all" | "draft" | "published") => {
    setFilter("status", status);
    fetchArticles({
      page: 1,
      status: status !== "all" ? status : undefined,
    });
  };

  /**
   * Menangani penghapusan artikel
   */
  const handleDelete = async (slug: string) => {
    try {
      setDeletingArticles((prev) => ({ ...prev, [slug]: true }));
      const success = await deleteArticle(slug);

      if (success) {
        toast({
          title: "Artikel berhasil dihapus",
          description: "Artikel telah dihapus dari database.",
        });
      } else {
        throw new Error("Gagal menghapus artikel");
      }
    } catch (error) {
      console.error("Error menghapus artikel:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus artikel. Silakan coba lagi.",
      });
    } finally {
      setDeletingArticles((prev) => ({ ...prev, [slug]: false }));
    }
  };

  // Fungsi format tanggal
  const formatDate = (date: Date | string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Mendapatkan badge status artikel
  const getStatusBadge = (status: "draft" | "published") => {
    if (status === "published") {
      return <Badge className="bg-green-500">Terbit</Badge>;
    }
    return <Badge variant="secondary">Draft</Badge>;
  };

  // Render skeleton loader untuk tabel artikel
  const renderArticleSkeletons = () => {
    return Array(pagination.itemsPerPage)
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
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </TableCell>
        </TableRow>
      ));
  };

  // Render state kosong atau tidak ditemukan
  const renderEmptyState = () => {
    if (isLoading && articles.length === 0) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    if (filters.searchQuery) {
      // Tampilkan pesan "tidak ditemukan" untuk hasil pencarian kosong
      return (
        <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
          <CircleSlashed className="h-8 w-8" />
          <p>
            Tidak ada artikel yang sesuai dengan pencarian "
            {filters.searchQuery}"
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetSearch}
            className="mt-2"
          >
            Hapus Pencarian
          </Button>
        </div>
      );
    }

    // Tampilkan pesan "tidak ada artikel" saat belum ada artikel
    return (
      <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
        <FileText className="h-8 w-8" />
        <p>Belum ada artikel</p>
        <Link href="/dashboard/admin/artikel/create">
          <Button size="sm" className="mt-2">
            <PlusCircle className="h-4 w-4 mr-2" /> Tambah Artikel
          </Button>
        </Link>
      </div>
    );
  };

  // Tampilkan skeleton loader saat loading pertama kali
  if (isLoading && !articles.length) {
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

  // Menghasilkan item paginasi
  const renderPaginationItems = () => {
    const items = [];
    const { page, totalPages } = pagination;

    // Selalu tampilkan halaman pertama
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          isActive={page === 1}
          onClick={() => handlePageChange(1)}
          className="cursor-pointer"
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Tambahkan ellipsis jika diperlukan
    if (page > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Tampilkan halaman saat ini dan tetangganya
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      if (i <= 1 || i >= totalPages) continue; // Lewati halaman pertama dan terakhir

      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={page === i}
            onClick={() => handlePageChange(i)}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Tambahkan ellipsis jika diperlukan
    if (page < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Selalu tampilkan halaman terakhir jika lebih dari 1 halaman
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            isActive={page === totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="space-y-4">
      {/* Header halaman */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manajemen Artikel</h1>
          <p className="text-muted-foreground">
            Kelola artikel blog untuk website Anda
          </p>
        </div>
        <Link href="/dashboard/admin/artikel/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Artikel
          </Button>
        </Link>
      </div>

      {/* Bagian pencarian dan filter - mirip halaman produk */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Pencarian dengan styling ringkas */}
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari artikel..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSearch}
              disabled={isLoading}
              className="px-3 h-9"
            >
              <Search className="h-4 w-4" />
            </Button>
            {filters.searchQuery && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetSearch}
                disabled={isLoading}
                className="px-3 h-9"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filter status */}
          <div className="flex flex-wrap gap-2 sm:w-auto w-full">
            <Select
              value={filters.status}
              onValueChange={(value: "all" | "draft" | "published") =>
                handleFilterStatus(value)
              }
            >
              <SelectTrigger className="h-9 w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="published">Terbit</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Feedback hasil pencarian */}
        {filters.searchQuery && (
          <div className="mt-2 text-xs flex items-center gap-2 text-muted-foreground">
            <Search className="h-3 w-3" />
            Hasil untuk:{" "}
            <span className="font-medium">"{filters.searchQuery}"</span>
            {articles.length === 0
              ? " (tidak ditemukan)"
              : `(${pagination.total} artikel)`}
          </div>
        )}
      </div>

      {/* Tabel artikel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 relative">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                onClick={toggleSort}
                className="cursor-pointer hover:bg-gray-100 select-none"
              >
                <div className="flex items-center gap-2">
                  Tanggal Dibuat
                  {filters.sortDirection === "desc" ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && articles.length === 0 ? (
              renderArticleSkeletons()
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  {renderEmptyState()}
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article, index) => (
                <TableRow key={article.id}>
                  <TableCell>
                    {(pagination.page - 1) * pagination.itemsPerPage +
                      index +
                      1}
                  </TableCell>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>{getStatusBadge(article.status)}</TableCell>
                  <TableCell>{formatDate(article.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/artikel/${article.slug}`} target="_blank">
                        <Button variant="ghost" size="sm" title="Lihat Artikel">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link
                        href={`/dashboard/admin/artikel/edit/${article.slug}`}
                      >
                        <Button variant="ghost" size="sm" title="Edit Artikel">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            title="Hapus Artikel"
                            disabled={deletingArticles[article.slug]}
                          >
                            {deletingArticles[article.slug] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Artikel</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus artikel ini?
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(article.slug)}
                              disabled={deletingArticles[article.slug]}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingArticles[article.slug] ? (
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
            {isLoading && articles.length > 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
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

        {/* Paginasi - diperbarui sesuai gaya halaman produk */}
        {articles.length > 0 && (
          <div className="py-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => {
                      const isDisabled = pagination.page === 1 || isLoading;
                      if (!isDisabled) {
                        handlePageChange(pagination.page - 1);
                      }
                    }}
                    className={`cursor-pointer ${
                      isLoading || pagination.page === 1
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    aria-disabled={pagination.page === 1 || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"></div>
                        Prev
                      </>
                    ) : (
                      "Prev"
                    )}
                  </PaginationPrevious>
                </PaginationItem>

                {/* Jika loading, tampilkan spinner di paginasi */}
                {isLoading ? (
                  <PaginationItem>
                    <div className="flex items-center justify-center px-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  </PaginationItem>
                ) : (
                  renderPaginationItems()
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      const isDisabled =
                        pagination.page === pagination.totalPages || isLoading;
                      if (!isDisabled) {
                        handlePageChange(pagination.page + 1);
                      }
                    }}
                    className={`cursor-pointer ${
                      isLoading || pagination.page === pagination.totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    aria-disabled={
                      pagination.page === pagination.totalPages || isLoading
                    }
                  >
                    {isLoading ? (
                      <>
                        Next
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current ml-1"></div>
                      </>
                    ) : (
                      "Next"
                    )}
                  </PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}

export default ArtikelAdminPage;
