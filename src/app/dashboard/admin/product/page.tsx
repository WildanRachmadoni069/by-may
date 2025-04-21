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
  Loader2,
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
import { useCollectionStore } from "@/store/useCollectionStore";
import { SortBy } from "@/types/product";
import { useRouter } from "next/navigation";
import { getProducts, deleteProduct } from "@/lib/api/products";
import type { Product } from "@/types/product";

function AdminProductList() {
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { categories, fetchCategories } = useCategoryStore();
  const { collections, fetchCollections } = useCollectionStore();

  // State for products and loading
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingProducts, setDeletingProducts] = useState<
    Record<string, boolean>
  >({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Filter state
  const [filters, setFilters] = useState({
    category: "all",
    collection: "all",
    sortBy: "newest" as SortBy,
  });

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchCollections();
    fetchProducts();
  }, []);

  // Fetch products with current filters
  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProducts({
        category: filters.category,
        collection: filters.collection,
        sortBy: filters.sortBy,
        searchQuery,
        page,
        limit: itemsPerPage,
      });

      setProducts(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
      setCurrentPage(response.pagination.page);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage || loading)
      return;
    setCurrentPage(page);
    fetchProducts(page);
  };

  // Handle product deletion
  const handleDelete = async (productId: string) => {
    try {
      setDeletingProducts((prev) => ({ ...prev, [productId]: true }));

      await deleteProduct(productId);

      toast({
        title: "Sukses",
        description: "Produk berhasil dihapus",
      });

      // Refresh product list
      fetchProducts(
        products.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus produk",
      });
      console.error("Error deleting product:", error);
    } finally {
      setDeletingProducts((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts(1);
  };

  // Reset search but keep filters
  const handleResetSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    fetchProducts(1);
  };

  // Apply all filters at once
  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchProducts(1);
  };

  // Reset filters to defaults but keep search
  const handleResetFilters = () => {
    setFilters({
      category: "all",
      collection: "all",
      sortBy: "newest",
    });
  };

  const getProductPrice = (product: Product) => {
    if (!product.hasVariations) {
      // Format price for products without variations
      return formatRupiah(product.basePrice || 0);
    }

    // Format price for products with variations
    if (!product.priceVariants || product.priceVariants.length === 0) {
      return formatRupiah(0);
    }

    const prices = product.priceVariants.map((v) => v.price);
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

    if (!product.priceVariants) return 0;

    return product.priceVariants.reduce(
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

  // Add product table skeleton loader
  const renderProductSkeletons = () => {
    return Array(itemsPerPage)
      .fill(null)
      .map((_, index) => (
        <TableRow key={`skeleton-${index}`} className="animate-pulse">
          <TableCell>
            <Skeleton className="h-5 w-3/4" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-12" />
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

  // Render empty or not found state
  const renderEmptyState = () => {
    if (loading && products.length === 0) {
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

  if (loading && !products.length) {
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
              disabled={loading}
              className="px-3 h-9"
            >
              <Search className="h-4 w-4" />
            </Button>
            {searchQuery && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetSearch}
                disabled={loading}
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
              value={filters.category}
              onValueChange={(value) =>
                setFilters({ ...filters, category: value })
              }
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

            {/* Collection filter */}
            <Select
              value={filters.collection}
              onValueChange={(value) =>
                setFilters({ ...filters, collection: value })
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
              value={filters.sortBy}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  sortBy: value as SortBy,
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
                disabled={loading}
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
                disabled={loading}
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
              : `(${totalItems} produk)`}
          </div>
        )}
      </div>

      {/* Products table - now more prominent */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 relative">
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
            {loading && products.length === 0 ? (
              renderProductSkeletons()
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  {renderEmptyState()}
                </TableCell>
              </TableRow>
            ) : (
              // Show products for the current page
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {product.categoryId ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {categories.find((c) => c.id === product.categoryId)
                          ?.name || "-"}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{getProductPrice(product)}</TableCell>
                  <TableCell>{getProductStock(product)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/produk/${product.slug}`} target="_blank">
                        <Button variant="ghost" size="sm" title="Lihat Produk">
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
                            disabled={deletingProducts[product.id]}
                          >
                            {deletingProducts[product.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
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
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deletingProducts[product.id] ? (
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

            {/* Add inline loading indicator within proper TableRow and TableCell structure */}
            {loading && products.length > 0 && (
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

        {/* Pagination UI with inline loading indicator */}
        {products.length > 0 && (
          <div className="py-4 border-t">
            <div className="flex items-center justify-between px-2">
              <p className="text-sm text-muted-foreground px-2">
                Menampilkan {products.length} dari {totalItems} produk
              </p>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`cursor-pointer ${
                        loading || currentPage === 1
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      aria-disabled={currentPage === 1 || loading}
                    >
                      {loading ? (
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
                  {loading ? (
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
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`cursor-pointer ${
                        loading || currentPage === totalPages
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      aria-disabled={currentPage === totalPages || loading}
                    >
                      {loading ? (
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
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProductList;
