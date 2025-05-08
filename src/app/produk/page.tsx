"use client";
import React, { useEffect, useState } from "react";
import ProductCard from "@/components/general/ProductCard";
import {
  ShoppingBag,
  X,
  SlidersHorizontal,
  AlertCircle,
  Search,
  Loader2,
} from "lucide-react";
import ProductSidebar from "@/components/productpage/ProductSidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useProductStore } from "@/store/useProductStore";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Footer from "@/components/landingpage/Footer";
import { cn } from "@/lib/utils";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useCollectionStore } from "@/store/useCollectionStore";
import { useProducts } from "@/hooks/useProducts";

function ProductPage() {
  // Get search params for initial filters
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialCollection = searchParams.get("collection") || "";
  const initialSort = searchParams.get("sortBy") || "newest";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  // Filter sheet for mobile
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Local UI state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);

  // Get filter state from Zustand
  const { filters, setFilters } = useProductStore();

  // Set initial filters
  useEffect(() => {
    setFilters({
      categoryId: initialCategory || undefined,
      collectionId: initialCollection || undefined,
      sortBy: initialSort || "newest",
      searchQuery: initialQuery || undefined,
      page: initialPage,
    });
  }, [
    initialCategory,
    initialCollection,
    initialSort,
    initialQuery,
    initialPage,
    setFilters,
  ]);

  // Fetch data using SWR
  const {
    data: products,
    pagination,
    isLoading,
    isValidating,
    error,
  } = useProducts({
    page: filters.page,
    limit: 8,
    categoryId: filters.categoryId,
    collectionId: filters.collectionId,
    sortBy: filters.sortBy,
    searchQuery: filters.searchQuery,
    includePriceVariants: true,
  });

  // Get categories and collections
  const { categories, fetchCategories } = useCategoryStore();
  const { collections, fetchCollections } = useCollectionStore();

  // Initial data fetch for categories and collections
  useEffect(() => {
    fetchCategories();
    fetchCollections();
  }, [fetchCategories, fetchCollections]);

  // Update URL when filters change
  useEffect(() => {
    if (!isValidating) {
      const params = new URLSearchParams();
      if (filters.searchQuery) params.set("q", filters.searchQuery);
      if (filters.categoryId) params.set("category", filters.categoryId);
      if (filters.collectionId) params.set("collection", filters.collectionId);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.page && filters.page > 1)
        params.set("page", filters.page.toString());

      // Replace URL with new params without navigation
      const newUrl = `/produk${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      if (window.location.pathname + window.location.search !== newUrl) {
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [filters, isValidating]);

  // Handle search query changes (no debounce, just update local state)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    setIsSearching(true);

    // Apply search filter
    setFilters({
      searchQuery: searchQuery || undefined,
      page: 1,
    });

    setIsSearching(false);
  };

  // Handle search reset - clicking the X button in search or filter badge
  const handleResetSearch = () => {
    // Clear the search input
    setSearchQuery("");

    // Clear the search filter
    setFilters({
      searchQuery: undefined,
      page: 1,
    });
  };

  // Handle filter reset - resets all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setFilters({
      categoryId: undefined,
      collectionId: undefined,
      sortBy: "newest",
      searchQuery: undefined,
      page: 1,
    });
  };

  // Apply filter changes from sidebar
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages || page === pagination.page)
      return;
    setFilters({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const { page, totalPages } = pagination;
    const items = [];

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

  // Product card skeleton loader for loading state
  const renderProductSkeletons = () => {
    return Array(8)
      .fill(null)
      .map((_, index) => (
        <li key={`skeleton-${index}`} className="animate-pulse">
          <div className="bg-gray-200 aspect-square rounded-lg w-full"></div>
          <div className="mt-2 h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="mt-1 h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="mt-2 h-6 bg-gray-200 rounded w-1/2"></div>
        </li>
      ));
  };

  // Better error handling
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <section className="container px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-lg font-medium">Terjadi Kesalahan</h3>
            <p className="text-muted-foreground mt-2">{error.message}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setFilters({
                  categoryId: undefined,
                  collectionId: undefined,
                  sortBy: "newest",
                  searchQuery: undefined,
                  page: 1,
                });
              }}
            >
              Coba Lagi
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="container px-4 py-8 sm:px-6 sm:py-12 lg:px-8 pb-20 md:pb-12">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Beranda</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Produk</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header>
          <h1 className="text-xl font-bold text-foreground sm:text-3xl">
            Produk Kami
          </h1>
          <p className="mt-4 text-gray-500">
            Temukan koleksi lengkap produk Bymay, dari Al-Qur'an custom cover
            hingga perlengkapan ibadah berkualitas. Semua produk kami dirancang
            untuk memenuhi kebutuhan spiritual Anda dengan harga terjangkau di
            Surabaya.
          </p>
        </header>

        {/* Mobile Filter Sheet */}
        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
          <SheetContent
            className="lg:hidden p-4 w-[85%] sm:w-[350px]"
            side="right"
          >
            <SheetHeader>
              <SheetTitle>Filter Produk</SheetTitle>
            </SheetHeader>
            <ProductSidebar
              onFilterApplied={() => setIsFilterSheetOpen(false)}
              onFilterChange={handleFilterChange}
            />
          </SheetContent>
        </Sheet>

        <div className="mt-8 lg:grid lg:grid-cols-4 lg:items-start lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block space-y-4 bg-white p-4 rounded-lg shadow sticky top-[64px]">
            <ProductSidebar onFilterChange={handleFilterChange} />
          </div>

          <div className="lg:col-span-3">
            {/* Search Bar - Updated to use button-triggered search */}
            <div className="mb-6 flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Input
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pr-16"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchSubmit();
                    }
                  }}
                />

                {/* Search button with icon */}
                <Button
                  variant="default"
                  size="icon"
                  className="absolute right-0 top-0 h-full rounded-l-none"
                  onClick={handleSearchSubmit}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="sr-only">Cari</span>
                </Button>

                {/* Clear search button */}
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-12 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
                    onClick={handleResetSearch}
                    disabled={isLoading}
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="sr-only">Hapus pencarian</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Active filter badges */}
            {(filters.categoryId ||
              filters.collectionId ||
              filters.searchQuery) && (
              <div className="mb-6 p-3 bg-muted rounded-md flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground">
                  Filter aktif:
                </span>

                {filters.searchQuery && (
                  <div className="text-sm bg-background px-3 py-1 rounded-full flex items-center gap-1">
                    <span>"{filters.searchQuery}"</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full"
                      onClick={handleResetSearch}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {filters.categoryId && (
                  <div className="text-sm bg-background px-3 py-1 rounded-full flex items-center gap-1">
                    <span>
                      {categories.find((c) => c.id === filters.categoryId)
                        ?.name || "Kategori"}
                    </span>
                  </div>
                )}

                {filters.collectionId && (
                  <div className="text-sm bg-background px-3 py-1 rounded-full flex items-center gap-1">
                    <span>
                      {collections.find((c) => c.id === filters.collectionId)
                        ?.name || "Koleksi"}
                    </span>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-xs h-7"
                  onClick={handleResetFilters}
                >
                  Reset Filter
                </Button>
              </div>
            )}

            <h2 className="sr-only">Koleksi Produk</h2>

            {/* Show skeletons when loading */}
            {isLoading && !products.length ? (
              <ul className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {renderProductSkeletons()}
              </ul>
            ) : products.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center py-16">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-medium mb-2">Tidak Ada Produk</h2>
                <p className="text-muted-foreground mb-6">
                  {filters.searchQuery
                    ? `Tidak ada produk yang sesuai dengan pencarian "${filters.searchQuery}"`
                    : "Belum ada produk dalam kategori ini."}
                </p>
                <Button variant="outline" onClick={handleResetFilters}>
                  Reset Filter
                </Button>
              </div>
            ) : (
              // Products grid with loading overlay for pagination
              <div className="relative">
                {/* Loading overlay for subsequent data fetches */}
                {isValidating && !isLoading && (
                  <div className="sticky top-0 z-10 w-full py-2 bg-background/80 backdrop-blur-sm flex justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memperbarui hasil...
                    </div>
                  </div>
                )}

                {/* Products grid */}
                <ul className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((item) => (
                    <ProductCard product={item} key={item.id} />
                  ))}
                </ul>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              handlePageChange(pagination.page - 1)
                            }
                            className={cn(
                              "cursor-pointer",
                              (pagination.page === 1 ||
                                isLoading ||
                                isValidating) &&
                                "opacity-50 cursor-not-allowed"
                            )}
                            aria-disabled={
                              pagination.page === 1 || isLoading || isValidating
                            }
                          />
                        </PaginationItem>

                        {renderPaginationItems()}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              handlePageChange(pagination.page + 1)
                            }
                            className={cn(
                              "cursor-pointer",
                              (pagination.page === pagination.totalPages ||
                                isLoading ||
                                isValidating) &&
                                "opacity-50 cursor-not-allowed"
                            )}
                            aria-disabled={
                              pagination.page === pagination.totalPages ||
                              isLoading ||
                              isValidating
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Fixed Filter Button for Mobile */}
      <div className="fixed bottom-4 right-4 lg:hidden z-50">
        <Button
          onClick={() => setIsFilterSheetOpen(true)}
          className="rounded-full shadow-lg h-14 w-14 p-0 flex items-center justify-center"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </div>

      <Footer />
    </div>
  );
}

export default ProductPage;
