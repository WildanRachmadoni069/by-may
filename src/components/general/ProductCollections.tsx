"use client";
import React from "react";
import ProductCard from "./ProductCard";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
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

  // Use SWR hook to fetch products with the given special label
  const {
    data: products,
    isLoading,
    error,
  } = useProducts({
    specialLabel,
    limit: limitCount,
    sortBy: "newest", // Always sort by newest first
    includePriceVariants: true,
  });

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
      <section className="container px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
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
      <section className="container px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="border-b-2 mb-4">
          <h2 className="text-xl font-bold text-foreground sm:text-3xl border-b-2 border-b-primary pb-4 -mb-1">
            {title}
          </h2>
        </header>
        <div className="text-center py-8 text-red-500">
          <p>Gagal memuat produk</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </section>
    );
  }

  // If no products found
  if (!displayProducts || displayProducts.length === 0) {
    return (
      <section className="container px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="flex items-center justify-between border-b-2 mb-4">
          <h2 className="text-xl font-bold text-foreground sm:text-3xl border-b-2 border-b-primary pb-4 -mb-1">
            {title}
          </h2>
        </header>
        <div className="text-center py-12 text-gray-500">
          Produk Masih Belum Tersedia
        </div>
      </section>
    );
  }

  return (
    <section className="container px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="flex items-center justify-between border-b-2 mb-4">
        <h2 className="text-xl font-bold text-foreground sm:text-3xl border-b-2 border-b-primary pb-4 -mb-1">
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
            {displayProducts.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-1/2 md:basis-1/3 lg:basis-1/6 pl-1 md:pl-2 rounded-md"
              >
                <div className="p-1">
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
