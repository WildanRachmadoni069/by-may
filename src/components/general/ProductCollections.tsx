"use client";
import React from "react";
import ProductCard from "./ProductCard";
import { Button } from "../ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "../ui/carousel";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";

interface ProductCollectionsProps {
  title: string;
  specialLabel: string;
  limitCount?: number;
  viewAllLink?: string;
}

function ProductCollections({
  title,
  specialLabel,
  limitCount = 10,
  viewAllLink,
}: ProductCollectionsProps) {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
  const [hasScrolled, setHasScrolled] = React.useState(false);

  // Add intersection observer to detect when component is in viewport
  const observerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Setup intersection observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasScrolled) {
          setHasScrolled(true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasScrolled]);

  // Use SWR hook to fetch products with the given special label
  // Only fetch if component is visible or has been scrolled to
  const {
    data: products,
    isLoading,
    error,
  } = useProducts(
    {
      specialLabel,
      limit: limitCount,
      sortBy: "newest", // Always sort by newest first
      includePriceVariants: true,
    },
    {
      // Disable automatic revalidation for better performance
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  // For "new" products, if we don't have any with the label, fallback to using the newest products
  const { data: newestProducts, isLoading: isLoadingNewest } = useProducts(
    {
      limit: limitCount,
      sortBy: "newest",
      includePriceVariants: true,
    },
    {
      // Only fetch this if we need it - when specialLabel is "new" and no products were found
      suspense: false,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      // Conditional fetching - only fetch when "new" label is empty
      shouldRetryOnError: false,
    }
  );

  // Determine which products to display
  const displayProducts =
    specialLabel === "new" && (!products || products.length === 0)
      ? newestProducts
      : products;

  // Show loading skeletons when fetching data
  if (
    (isLoading || (specialLabel === "new" && isLoadingNewest)) &&
    (!displayProducts || displayProducts.length === 0)
  ) {
    return (
      <section
        className="container px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
        ref={observerRef}
      >
        <header className="flex items-center justify-between border-b-2 mb-4">
          <h2 className="text-xl font-bold text-foreground sm:text-3xl border-b-2 border-b-primary pb-4 -mb-1">
            {title}
          </h2>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-40 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
              </div>
            ))}
        </div>
      </section>
    );
  }
  // Show error message if fetching failed
  if (error) {
    return (
      <section
        className="container px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
        ref={observerRef}
      >
        <header className="border-b-2 mb-4">
          <h2 className="text-xl font-bold text-foreground sm:text-3xl border-b-2 border-b-primary pb-4 -mb-1">
            {title}
          </h2>
        </header>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Gagal memuat produk
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Terjadi kesalahan saat memuat produk. Silakan coba lagi nanti.
          </p>
        </div>
      </section>
    );
  }
  // If no products found
  if (!displayProducts || displayProducts.length === 0) {
    return (
      <section
        className="container px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
        ref={observerRef}
      >
        <header className="flex items-center justify-between border-b-2 mb-4">
          <h2 className="text-xl font-bold text-foreground sm:text-3xl border-b-2 border-b-primary pb-4 -mb-1">
            {title}
          </h2>
        </header>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <ShoppingBag className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Produk Belum Tersedia
          </h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Kami sedang menyiapkan koleksi produk terbaru untuk Anda. Silakan
            kunjungi halaman ini lagi nanti.
          </p>
        </div>
      </section>
    );
  }
  return (
    <section
      className="container px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      ref={observerRef}
      aria-labelledby={title.toLowerCase().replace(/\s+/g, "-")}
      itemScope
      itemType="https://schema.org/ItemList"
    >
      <header className="flex items-center justify-between border-b-2 mb-4">
        <h2
          id={title.toLowerCase().replace(/\s+/g, "-")}
          className="text-xl font-bold text-foreground sm:text-3xl border-b-2 border-b-primary pb-4 -mb-1"
          itemProp="name"
        >
          {title}
        </h2>
        <div className="flex items-center gap-2 pb-4">
          <Button
            variant="primary"
            className="rounded-full hidden sm:flex"
            size="icon"
            onClick={() => carouselApi?.scrollPrev()}
          >
            <ArrowLeft size={20} />
          </Button>
          <Button
            variant="primary"
            className="rounded-full hidden sm:flex"
            size="icon"
            onClick={() => carouselApi?.scrollNext()}
          >
            <ArrowRight size={20} />
          </Button>
          {viewAllLink && (
            <Button variant="outline" asChild>
              <Link href={viewAllLink}>Lihat Semua</Link>
            </Button>
          )}
        </div>
      </header>
      <div>
        <Carousel
          opts={{
            align: "start",
            loop: displayProducts.length > 4,
          }}
          setApi={setCarouselApi}
        >
          <CarouselContent className="-ml-1 md:-ml-2">
            {" "}
            {displayProducts.map((product, index) => (
              <CarouselItem
                key={product.id}
                className="basis-1/2 md:basis-1/3 lg:basis-1/6 pl-1 md:pl-2 rounded-md"
                itemScope
                itemType="https://schema.org/ListItem"
                itemProp="itemListElement"
              >
                <meta itemProp="position" content={`${index + 1}`} />
                <div
                  className="p-1"
                  itemProp="item"
                  itemScope
                  itemType="https://schema.org/Product"
                >
                  <ProductCard product={product} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}

export default ProductCollections;
