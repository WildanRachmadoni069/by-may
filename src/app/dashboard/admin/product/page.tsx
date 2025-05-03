"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Loader2,
  Package2,
  X,
  CircleSlashed,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatRupiah } from "@/lib/utils";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductStore } from "@/store/useProductStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useCollectionStore } from "@/store/useCollectionStore";
import { usePathname } from "next/navigation";

function AdminProductList() {
  const pathname = usePathname();

  // Menggunakan store products
  const {
    products,
    pagination,
    filters,
    loading: isLoading,
    fetchProducts,
    setFilters,
    removeProduct,
  } = useProductStore();

  // Menggunakan store categories
  const { categories, fetchCategories } = useCategoryStore();

  // Menggunakan store collections
  const { collections, fetchCollections } = useCollectionStore();

  // Local state untuk pencarian dan dialog
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean;
    slug: string | null;
  }>({
    open: false,
    slug: null,
  });

  // Hapus kode debounce yang tidak lagi dibutuhkan
  const { toast } = useToast();

  // Initial data fetch - Hanya memuat produk saat halaman pertama dibuka
  useEffect(() => {
    fetchCategories();
    fetchCollections();

    // Fetch produk saat component mount (data awal)
    fetchProducts();
  }, [fetchCategories, fetchCollections, fetchProducts]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages || page === pagination.page)
      return;
    setFilters({ page });
  };

  // Update search input handler to automatically refresh data when cleared
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);

    // If search is cleared (becomes empty), automatically refresh data
    if (newValue === "" && filters.searchQuery) {
      handleResetSearch();
    }
  };

  // Handle search button click - Perbarui untuk menggunakan nilai searchQuery
  const handleSearch = () => {
    console.log(`Executing search for: "${searchQuery}"`);

    // Jika pencarian kosong tapi ada filter pencarian sebelumnya, reset pencarian
    if (searchQuery === "" && filters.searchQuery) {
      handleResetSearch();
      return;
    }

    // Jika pencarian kosong dan tidak ada filter pencarian sebelumnya, tidak perlu melakukan apapun
    if (searchQuery === "" && !filters.searchQuery) {
      return;
    }

    // Saat pencarian, kembalikan ke halaman 1
    setFilters({ searchQuery, page: 1 });
  };

  // Reset search - improved to preserve other filters
  const handleResetSearch = () => {
    console.log("Clearing search filter");
    setSearchQuery("");

    // Hanya reset filter searchQuery, pertahankan filter lainnya
    const { searchQuery: _, ...otherFilters } = filters;
    setFilters({
      ...otherFilters,
      searchQuery: "",
      page: 1,
    });
  };

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setFilters({ categoryId: value === "all" ? undefined : value, page: 1 });
  };

  // Handle collection filter change
  const handleCollectionChange = (value: string) => {
    setFilters({ collectionId: value === "all" ? undefined : value, page: 1 });
  };

  // Handle product deletion
  const handleDelete = (slug: string) => {
    setDeleteConfirmDialog({
      open: true,
      slug,
    });
  };

  // Execute actual deletion after confirmation
  const confirmDelete = async () => {
    const slugToDelete = deleteConfirmDialog.slug;
    if (!slugToDelete) return;

    setDeleteConfirmDialog({ open: false, slug: null });
    setDeletingSlug(slugToDelete);

    try {
      const result = await removeProduct(slugToDelete);

      if (result.success) {
        toast({
          title: "Produk berhasil dihapus",
          description: "Produk telah dihapus dari sistem.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Gagal menghapus produk",
          description:
            result.message || "Terjadi kesalahan saat menghapus produk.",
        });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Gagal menghapus produk",
        description:
          "Terjadi kesalahan saat menghapus produk. Silakan coba lagi.",
      });
    } finally {
      setDeletingSlug(null);
    }
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const { page, totalPages } = pagination;

    // Always show first page
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

    // Add ellipsis if needed
    if (page > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show current page and neighbors
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      if (i <= 1 || i >= totalPages) continue; // Skip first and last page

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

    // Add ellipsis if needed
    if (page < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if more than 1 page
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

  // Render product skeletons when loading
  const renderProductSkeletons = () => {
    return Array(pagination.limit || 5)
      .fill(null)
      .map((_, index) => (
        <TableRow key={`skeleton-${index}`} className="animate-pulse">
          <TableCell className="w-[80px]">
            <Skeleton className="h-12 w-12 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-full max-w-[250px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </TableCell>
        </TableRow>
      ));
  };

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading && products.length === 0) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    if (filters.searchQuery) {
      // Display "not found" message for empty search results
      return (
        <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
          <CircleSlashed className="h-8 w-8" />
          <p>
            Tidak ada produk yang sesuai dengan pencarian "{filters.searchQuery}
            "
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

    // Display "no products" message when there are no products yet
    return (
      <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
        <Package2 className="h-8 w-8" />
        <p>Belum ada produk</p>
        <Link href="/dashboard/admin/product/add">
          <Button size="sm" className="mt-2">
            <PlusCircle className="h-4 w-4 mr-2" /> Tambah Produk
          </Button>
        </Link>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Daftar Produk</h1>
          <p className="text-muted-foreground">
            Kelola produk yang dijual di toko Anda
          </p>
        </div>
        <Link href="/dashboard/admin/product/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Produk
          </Button>
        </Link>
      </div>

      {/* Search and filters section */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search with compact styling */}
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch(); // Tetap gunakan tombol Enter untuk pencarian
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
            {/* Hanya tampilkan tombol reset jika ada pencarian aktif di searchQuery ATAU di filters */}
            {(searchQuery || filters.searchQuery) && (
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

          {/* Filters */}
          <div className="flex flex-wrap gap-2 sm:w-auto w-full">
            <Select
              value={filters.categoryId || "all"}
              onValueChange={handleCategoryChange}
              disabled={isLoading}
            >
              <SelectTrigger className="h-9 w-[120px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.collectionId || "all"}
              onValueChange={handleCollectionChange}
              disabled={isLoading}
            >
              <SelectTrigger className="h-9 w-[120px]">
                <SelectValue placeholder="Koleksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Koleksi</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search results feedback */}
        {filters.searchQuery && (
          <div className="mt-2 text-xs flex items-center gap-2 text-muted-foreground">
            <Search className="h-3 w-3" />
            Hasil untuk:{" "}
            <span className="font-medium">"{filters.searchQuery}"</span>
            {products.length === 0
              ? " (tidak ditemukan)"
              : `(${pagination.total} produk)`}
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 relative">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Gambar</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && products.length === 0 ? (
              renderProductSkeletons()
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {renderEmptyState()}
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.featuredImage?.url ? (
                      <div className="relative h-12 w-12 rounded-md overflow-hidden">
                        <Image
                          src={product.featuredImage.url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{product.name}</span>
                      {product.specialLabel && (
                        <Badge variant="outline" className="w-fit mt-1 text-xs">
                          {product.specialLabel === "new" && "Baru"}
                          {product.specialLabel === "best" && "Best Seller"}
                          {product.specialLabel === "sale" && "Diskon"}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.hasVariations ? (
                      <Badge variant="secondary">Multiple</Badge>
                    ) : product.basePrice ? (
                      formatRupiah(product.basePrice)
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {product.hasVariations ? (
                      <Badge variant="secondary">Multiple</Badge>
                    ) : product.baseStock !== null ? (
                      product.baseStock
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{product.category?.name || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/admin/product/edit/${product.slug}`}
                      >
                        <Button variant="ghost" size="sm" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        title="Hapus"
                        disabled={deletingSlug === product.slug}
                        onClick={() => handleDelete(product.slug)}
                      >
                        {deletingSlug === product.slug ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}

            {/* Inline loading indicator */}
            {isLoading && products.length > 0 && (
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

        {/* Pagination */}
        {pagination.total > 0 && (
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

                {/* If loading, show spinner in pagination */}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmDialog.open}
        onOpenChange={(open) =>
          setDeleteConfirmDialog({ ...deleteConfirmDialog, open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ya, Hapus Produk
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminProductList;
