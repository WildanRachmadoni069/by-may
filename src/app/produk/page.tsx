"use client";
import React, { useEffect, useState } from "react";
import ProductCard from "@/components/general/ProductCard";
import {
  ChevronRight,
  ShoppingBag,
  X,
  SlidersHorizontal,
  AlertCircle,
} from "lucide-react";
import ProductSidebar from "@/components/productpage/ProductSidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useProductStore } from "@/store/useProductStore";
import { useProductFilterStore } from "@/store/useProductFilterStore";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/productpage/SearchBar";
import { useRouter } from "next/navigation";
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

function ProductPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const {
    products,
    loading,
    error,
    hasMore,
    fetchFilteredProducts,
    fetchMoreProducts,
  } = useProductStore();

  const filters = useProductFilterStore();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Define a consistent itemsPerPage value
  const itemsPerPage = 4; // For testing pagination

  // Effect for initial load
  useEffect(() => {
    // Initialize search from URL if present
    if (initialQuery) {
      filters.setSearchQuery(initialQuery);
    }

    fetchFilteredProducts({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
      itemsPerPage: itemsPerPage, // Use the consistent itemsPerPage value
      searchQuery: initialQuery,
    });
  }, [fetchFilteredProducts, initialQuery]);

  // Handle search query changes
  const handleSearchChange = (query: string) => {
    filters.setSearchQuery(query);
  };

  // Handle search submission
  const handleSearch = (query: string) => {
    // Update URL with search query
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set("q", query);
    } else {
      url.searchParams.delete("q");
    }

    // Store the query in filter state
    filters.setSearchQuery(query);

    router.replace(url.pathname + url.search);

    // Fetch products with current filters and the new search query
    fetchFilteredProducts({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
      itemsPerPage: 4, // Changed from 12 to 4 for testing pagination
      searchQuery: query,
    });
  };

  // Handle search reset
  const handleResetSearch = () => {
    // Clear search in URL
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    router.replace(url.pathname + url.search);

    // Clear search in state
    filters.setSearchQuery("");

    // Fetch products with current filters but no search query
    fetchFilteredProducts({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
      itemsPerPage: 4, // Changed from 12 to 4 for testing pagination
      searchQuery: "",
    });
  };

  const loadMore = () => {
    // Don't attempt to load more if already loading
    if (loading) return;

    // fetchMoreProducts already sets loading state internally in the store
    fetchMoreProducts({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
      itemsPerPage: 4, // Changed from 12 to 4 for testing pagination
      searchQuery: filters.searchQuery,
    });
  };

  // Product card skeleton loader for loading state
  const renderProductSkeletons = () => {
    return Array(4) // Changed from 12 to 4 to match itemsPerPage
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

  // Empty state component enhanced with search information
  const renderEmptyState = () => {
    if (!products || products.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">
            {filters.searchQuery
              ? `Tidak ada produk yang sesuai dengan "${filters.searchQuery}"`
              : "Belum Ada Produk"}
          </h3>
          <p className="text-muted-foreground mt-2">
            {filters.searchQuery
              ? "Coba kata kunci lain atau filter yang berbeda."
              : "Mohon maaf, saat ini belum ada produk yang tersedia."}
          </p>
          {filters.searchQuery && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleResetSearch}
            >
              Hapus Pencarian
            </Button>
          )}
        </div>
      );
    }

    return (
      <ul className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((item) => (
          <ProductCard product={item} key={item.id} />
        ))}
      </ul>
    );
  };

  // Improved pagination component with better loading state
  const renderPagination = () => {
    if (loading && !products.length) return null;
    if (!hasMore) return null;

    return (
      <div className="mt-8 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                className="gap-1 px-2.5"
                disabled={loading}
                onClick={loadMore}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                    <span className="ml-2">Memuat...</span>
                  </>
                ) : (
                  "Tampilkan Lebih Banyak"
                )}
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  // Better error handling
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <section className="container px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-lg font-medium">Terjadi Kesalahan</h3>
            <p className="text-muted-foreground mt-2">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                fetchFilteredProducts({
                  category: filters.category,
                  collection: filters.collection,
                  sortBy: filters.sortBy,
                  itemsPerPage: 12,
                  searchQuery: filters.searchQuery,
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
            />
          </SheetContent>
        </Sheet>

        <div className="mt-8 lg:grid lg:grid-cols-4 lg:items-start lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block space-y-4 bg-white p-4 rounded-lg shadow sticky top-[64px]">
            <ProductSidebar />
          </div>

          <div className="lg:col-span-3">
            {/* Search Bar - Now as the primary search for all devices */}
            <div className="mb-6 flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <SearchBar
                  value={filters.searchQuery}
                  onChange={handleSearchChange}
                  onSearch={handleSearch}
                  loading={loading}
                  onReset={handleResetSearch}
                />
              </div>
            </div>

            {/* Search results information */}
            {filters.searchQuery && products.length > 0 && (
              <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Menampilkan hasil pencarian untuk "{filters.searchQuery}"
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetSearch}
                  className="text-sm"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Hapus Filter
                </Button>
              </div>
            )}

            <h2 className="sr-only">Koleksi Produk</h2>

            {/* Show skeletons when loading and no products are available yet */}
            {loading && products.length === 0 ? (
              <ul className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {renderProductSkeletons()}
              </ul>
            ) : (
              <>
                {/* Show stable UI with data */}
                {renderEmptyState()}

                {/* Fade-in effect for pagination when loading more */}
                <div
                  className={`transition-opacity duration-300 ${
                    loading ? "opacity-70" : "opacity-100"
                  }`}
                >
                  {renderPagination()}
                </div>
              </>
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
