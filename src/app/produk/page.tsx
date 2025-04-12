"use client";
import React, { useEffect, useState } from "react";
import ProductCard from "@/components/general/ProductCard";
import { ChevronRight, ShoppingBag, Search, X } from "lucide-react";
import ProductSidebar from "@/components/productpage/ProductSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Effect for initial load
  useEffect(() => {
    // Initialize search from URL if present
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }

    fetchFilteredProducts({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
      itemsPerPage: 12,
      searchQuery: initialQuery,
    });
  }, [initialQuery, fetchFilteredProducts]);

  // Effect for when filters change
  useEffect(() => {
    if (
      filters.category === "all" &&
      filters.collection === "all" &&
      filters.sortBy === "newest" &&
      !searchQuery
    ) {
      return; // Avoid duplicate initial fetch
    }

    fetchFilteredProducts({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
      itemsPerPage: 12,
      searchQuery: searchQuery, // Keep search query when changing filters
    });
  }, [
    fetchFilteredProducts,
    filters.category,
    filters.collection,
    filters.sortBy,
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // Update URL with search query
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set("q", query);
    } else {
      url.searchParams.delete("q");
    }

    router.replace(url.pathname + url.search);

    // When specifically performing a search action, fetch with current filters
    fetchFilteredProducts({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
      itemsPerPage: 12,
      searchQuery: query,
    });
  };

  const loadMore = () => {
    fetchMoreProducts({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
      itemsPerPage: 12,
      searchQuery: searchQuery, // Keep search query when loading more
    });
  };

  // Empty state component enhanced with search information
  const renderEmptyState = () => {
    if (!products || products.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">
            {searchQuery
              ? `Tidak ada produk yang sesuai dengan "${searchQuery}"`
              : "Belum Ada Produk"}
          </h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery
              ? "Coba kata kunci lain atau filter yang berbeda."
              : "Mohon maaf, saat ini belum ada produk yang tersedia."}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => handleSearch("")}
            >
              Hapus Pencarian
            </Button>
          )}
        </div>
      );
    }

    return (
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 justify-center">
        {products.map((item) => (
          <ProductCard product={item} key={item.id} />
        ))}
      </ul>
    );
  };

  const renderPagination = () => {
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
                Tampilkan Lebih Banyak
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <section className="container px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
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

        <div className="mt-8 block lg:hidden">
          <Sheet>
            <SheetTrigger className="flex cursor-pointer items-center gap-2 border-b border-gray-400 pb-1 text-gray-900 transition hover:border-gray-600">
              <span className="text-sm font-medium"> Filter & Urutkan</span>
              <ChevronRight />
            </SheetTrigger>
            <SheetContent className="lg:hidden p-4 w-full" side="right">
              <ProductSidebar />
            </SheetContent>
          </Sheet>
        </div>

        <div className="mt-4 lg:mt-8 lg:grid lg:grid-cols-4 lg:items-start lg:gap-8">
          <div className="hidden space-y-4 lg:block bg-white p-4 rounded-lg shadow sticky top-[64px]">
            <ProductSidebar />
          </div>

          <div className="lg:col-span-3">
            {/* Search results information */}
            {searchQuery && products.length > 0 && (
              <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Menampilkan hasil pencarian untuk "{searchQuery}"
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSearch("")}
                  className="text-sm"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Hapus Filter
                </Button>
              </div>
            )}

            <h2 className="sr-only">Koleksi Produk</h2>
            {loading && products.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <>
                {renderEmptyState()}
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default ProductPage;
