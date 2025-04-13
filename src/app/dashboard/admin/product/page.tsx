"use client";
import React, { useEffect, useState } from "react";
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
  Pencil,
  PlusCircle,
  Trash,
  Search,
  Eye,
  Filter,
  X,
  PackageOpen,
  CircleSlashed,
} from "lucide-react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useProductStore } from "@/store/useProductStore";
import { useCollectionStore } from "@/store/useCollectionStore";
import { useProductFilterStore } from "@/store/useProductFilterStore";

interface Product {
  id: string;
  name: string;
  basePrice?: number;
  baseStock?: number;
  hasVariations: boolean;
  variationPrices: Record<string, { price: number; stock: number }>;
  category: string;
}

function AdminProductList() {
  const {
    products,
    loading: productsLoading,
    error,
    hasMore,
    fetchFilteredProducts,
    fetchMoreProducts,
    removeProduct,
  } = useProductStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const filters = useProductFilterStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { collections, fetchCollections } = useCollectionStore();

  // Add local filter state that will only be applied when the button is clicked
  const [localFilters, setLocalFilters] = useState({
    category: filters.category,
    collection: filters.collection,
    sortBy: filters.sortBy,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchCollections();

    // Initial products fetch
    fetchFilteredProducts({
      itemsPerPage: itemsPerPage,
    });
  }, [fetchCategories, fetchCollections, fetchFilteredProducts]);

  // Update total pages when products or hasMore changes
  useEffect(() => {
    // If we have hasMore true, add at least one more page
    // This is an estimate since we don't know the exact count
    if (hasMore) {
      setTotalPages(Math.max(2, currentPage + 1));
    } else if (products.length === 0) {
      setTotalPages(1);
    } else {
      // When we're on the last page, calculate based on current products
      const estimatedTotal = Math.ceil(products.length / itemsPerPage);
      setTotalPages(Math.max(currentPage, estimatedTotal));
    }
  }, [products, hasMore, currentPage]);

  // Handle page change
  const handlePageChange = async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    setCurrentPage(page);

    if (page === 1) {
      // First page - fetch fresh
      await fetchFilteredProducts({
        category: filters.category,
        collection: filters.collection,
        sortBy: filters.sortBy,
        itemsPerPage: itemsPerPage,
        searchQuery: searchQuery.trim(),
      });
    } else {
      // Next pages - load more until we reach the desired page
      let currentPageData = page;

      // Reset if we're going backwards
      if (currentPageData < currentPage) {
        await fetchFilteredProducts({
          category: filters.category,
          collection: filters.collection,
          sortBy: filters.sortBy,
          itemsPerPage: itemsPerPage,
          searchQuery: searchQuery.trim(),
        });
        currentPageData = 1;
      }

      // Load more until we reach the desired page
      while (currentPageData < page) {
        await fetchMoreProducts({
          category: filters.category,
          collection: filters.collection,
          sortBy: filters.sortBy,
          itemsPerPage: itemsPerPage,
          searchQuery: searchQuery.trim(),
        });
        currentPageData++;
      }
    }
  };

  // Handle product deletion
  const handleDelete = async (productId: string) => {
    try {
      // Get product details to access image URLs
      const productToDelete = products.find((p) => p.id === productId);

      if (productToDelete) {
        // Import deleteProductImages dari file products.ts
        const { deleteProductImages } = await import("@/lib/firebase/products");

        // Hapus gambar dari Cloudinary
        await deleteProductImages(productToDelete);
      }

      // Delete product from database
      await removeProduct(productId);
      toast({
        title: "Sukses",
        description: "Produk berhasil dihapus",
      });

      // Refresh product list if needed
      if (products.length <= 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
        await fetchFilteredProducts({
          category: filters.category,
          collection: filters.collection,
          sortBy: filters.sortBy,
          itemsPerPage: itemsPerPage * (currentPage - 1),
          searchQuery: searchQuery.trim(),
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus produk",
      });
      console.error("Error deleting product:", error);
    }
  };

  // Handle search separately from filters
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchFilteredProducts({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
      itemsPerPage: itemsPerPage,
      searchQuery: searchQuery.trim(),
    });
  };

  // Reset search but keep filters
  const handleResetSearch = () => {
    setSearchQuery("");
    setCurrentPage(1); // Reset to first page
    fetchFilteredProducts({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
      itemsPerPage: itemsPerPage,
      searchQuery: "", // Ensure empty string
    });
  };

  // Apply all filters at once
  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to first page on filter change

    // Update the global filter store
    filters.setCategory(localFilters.category);
    filters.setCollection(localFilters.collection);
    filters.setSortBy(localFilters.sortBy);

    // Fetch with all the new filter values, maintaining search query
    fetchFilteredProducts({
      category: localFilters.category,
      collection: localFilters.collection,
      sortBy: localFilters.sortBy,
      itemsPerPage: itemsPerPage,
      searchQuery: searchQuery.trim(),
    });
  };

  // Reset filters to defaults but keep search
  const handleResetFilters = () => {
    const defaultFilters = {
      category: "all",
      collection: "all",
      sortBy: "newest" as typeof localFilters.sortBy,
    };

    setLocalFilters(defaultFilters);
  };

  const getProductPrice = (product: Product) => {
    if (!product.hasVariations) {
      // Format harga untuk produk tanpa variasi
      return formatRupiah(product.basePrice || 0);
    }

    // Format harga untuk produk dengan variasi
    const prices = Object.values(product.variationPrices).map((v) => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return minPrice === maxPrice
      ? formatRupiah(minPrice)
      : `${formatRupiah(minPrice)} - ${formatRupiah(maxPrice)}`;
  };

  const getProductStock = (product: Product) => {
    if (!product.hasVariations) {
      return product.baseStock || 0;
    }

    return Object.values(product.variationPrices).reduce(
      (total, variation) => total + variation.stock,
      0
    );
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          isActive={currentPage === 1}
          onClick={() => handlePageChange(1)}
          className="cursor-pointer"
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Add ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show current page and neighbors
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i <= 1 || i >= totalPages) continue; // Skip first and last page as they're always shown

      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => handlePageChange(i)}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
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
            isActive={currentPage === totalPages}
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

  // Render empty or not found state
  const renderEmptyState = () => {
    if (productsLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    if (searchQuery) {
      // Show "not found" message for empty search results
      return (
        <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
          <CircleSlashed className="h-8 w-8" />
          <p>Tidak ada produk yang sesuai dengan pencarian "{searchQuery}"</p>
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

    // Show "no products" message when there are no products at all
    return (
      <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
        <PackageOpen className="h-8 w-8" />
        <p>Belum ada produk</p>
        <Link href="/dashboard/admin/product/add">
          <Button size="sm" className="mt-2">
            <PlusCircle className="h-4 w-4 mr-2" /> Tambah Produk
          </Button>
        </Link>
      </div>
    );
  };

  if (productsLoading && !products.length) {
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

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
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

      {/* Minimalist search and filter section without heading */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        {/* Search and filters in a single row on desktop */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search with compact styling */}
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              disabled={productsLoading}
              className="px-3 h-9"
            >
              <Search className="h-4 w-4" />
            </Button>
            {searchQuery && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetSearch}
                disabled={productsLoading}
                className="px-3 h-9"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Compact filter dropdowns */}
          <div className="flex flex-wrap gap-2 sm:w-auto w-full">
            {/* Category filter */}
            <Select
              value={localFilters.category}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, category: value })
              }
            >
              <SelectTrigger className="h-9 w-[120px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Collection filter */}
            <Select
              value={localFilters.collection}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, collection: value })
              }
            >
              <SelectTrigger className="h-9 w-[120px]">
                <SelectValue placeholder="Koleksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Koleksi</SelectItem>
                <SelectItem value="none">Tanpa Koleksi</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection.value} value={collection.value}>
                    {collection.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sorting */}
            <Select
              value={localFilters.sortBy}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  sortBy: value as typeof localFilters.sortBy,
                })
              }
            >
              <SelectTrigger className="h-9 w-[120px]">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="price-asc">Harga Terendah</SelectItem>
                <SelectItem value="price-desc">Harga Tertinggi</SelectItem>
              </SelectContent>
            </Select>

            {/* Button group with icons only */}
            <div className="flex">
              <Button
                size="sm"
                onClick={handleApplyFilters}
                disabled={productsLoading}
                className="h-9 px-3"
                title="Terapkan Filter"
              >
                <Filter className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  handleResetFilters();
                  handleApplyFilters();
                }}
                disabled={productsLoading}
                title="Reset Filter"
                className="h-9 px-3 ml-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M3 12c0-5.5 5-10 11-10s11 4.5 11 10-5 10-11 10c-2.8 0-5.5-.9-7.5-2.5" />
                  <path d="M3 12h6" />
                  <path d="M6 15l-3-3 3-3" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Search results feedback - more subtle */}
        {searchQuery && (
          <div className="mt-2 text-xs flex items-center gap-2 text-muted-foreground">
            <Search className="h-3 w-3" />
            Hasil untuk: <span className="font-medium">"{searchQuery}"</span>
            {products.length === 0
              ? " (tidak ditemukan)"
              : `(${products.length} produk)`}
          </div>
        )}
      </div>

      {/* Products table - now more prominent */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  {renderEmptyState()}
                </TableCell>
              </TableRow>
            ) : (
              // Show products for the current page only
              products
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {categories.find((c) => c.value === product.category)
                          ?.label || "-"}
                      </span>
                    </TableCell>
                    <TableCell>{getProductPrice(product)}</TableCell>
                    <TableCell>{getProductStock(product)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/produk/${product.slug}`} target="_blank">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Lihat Produk"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link
                          href={`/dashboard/admin/product/edit/${product.id}`}
                        >
                          <Button variant="ghost" size="sm" title="Edit Produk">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              title="Hapus Produk"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus produk ini?
                                Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product.id)}
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>

        {/* New pagination UI */}
        {products.length > 0 && (
          <div className="py-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => {
                      const isDisabled = currentPage === 1 || productsLoading;
                      if (!isDisabled) {
                        handlePageChange(currentPage - 1);
                      }
                    }}
                    className="cursor-pointer"
                    aria-disabled={currentPage === 1 || productsLoading}
                  />
                </PaginationItem>

                {renderPaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      const isDisabled =
                        currentPage === totalPages ||
                        productsLoading ||
                        (!hasMore && currentPage === totalPages);
                      if (!isDisabled) {
                        handlePageChange(currentPage + 1);
                      }
                    }}
                    className="cursor-pointer"
                    aria-disabled={
                      currentPage === totalPages ||
                      productsLoading ||
                      (!hasMore && currentPage === totalPages)
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProductList;
