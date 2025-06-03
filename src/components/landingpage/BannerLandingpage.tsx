"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBannerStore } from "@/store/useBannerStore";
import { BannerData } from "@/types/banner";

/**
 * Komponen carousel banner untuk halaman utama
 * Menampilkan banner yang aktif dengan fitur carousel
 */
function BannerLandingpage() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const { fetchBanners, getActiveBanners, loading } = useBannerStore();

  /**
   * Ambil data banner saat komponen dimount
   */
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  /**
   * Konfigurasi carousel API
   */
  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Ambil banner aktif untuk ditampilkan
  const activeBanners: BannerData[] = getActiveBanners();

  // Flag untuk menentukan mode tampilan carousel
  const usePeekMode = activeBanners.length > 2;

  // Jika tidak ada banner atau sedang loading, tidak render apa-apa
  if (loading || activeBanners.length === 0) return null;

  return (
    <section
      className="w-full py-1"
      aria-labelledby="promotion-banners"
      itemScope
      itemType="https://schema.org/WebPageElement"
      itemProp="hasPart"
    >
      <h2 className="sr-only" id="promotion-banners">
        Promosi dan Penawaran Spesial
      </h2>
      <div className="container mx-auto px-4 lg:px-8">
        <Carousel
          opts={{
            align: "center",
            loop: activeBanners.length > 1,
            skipSnaps: false,
            dragFree: false,
            containScroll: "trimSnaps",
          }}
          plugins={
            activeBanners.length > 1
              ? [
                  Autoplay({
                    delay: 5000,
                    stopOnInteraction: true,
                    stopOnMouseEnter: true,
                    rootNode: (target) => target.parentElement,
                  }),
                ]
              : []
          }
          className="w-full mx-auto relative"
          setApi={setApi}
        >
          <CarouselContent className={usePeekMode ? "-ml-4" : ""}>
            {activeBanners.map((banner, index) => (
              <CarouselItem
                key={banner.id}
                className={usePeekMode ? "pl-4 md:basis-4/5" : "basis-full"}
              >
                <div className={cn("p-1", current === index ? "z-20" : "z-10")}>
                  {/* Main banner wrapper with scaling */}
                  <div
                    className={cn(
                      "rounded-2xl",
                      "transition-all duration-300 ease-out transform",
                      current === index && usePeekMode
                        ? "scale-105"
                        : "scale-95 opacity-70"
                    )}
                    style={{
                      willChange: "transform, opacity",
                    }}
                  >
                    {banner.url ? (
                      <Link
                        href={banner.url}
                        className="block w-full"
                        title={banner.title}
                        aria-label={`Promo: ${banner.title}`}
                      >
                        <div
                          className="relative aspect-[4/1] w-full"
                          itemScope
                          itemType="https://schema.org/ImageObject"
                          itemProp="image"
                        >
                          <Image
                            src={banner.imageUrl}
                            alt={banner.title}
                            fill
                            priority={index === 0}
                            loading={index === 0 ? "eager" : "lazy"}
                            className="rounded-2xl object-cover"
                            sizes="(max-width: 640px) 95vw, (max-width: 1024px) 85vw, 1200px"
                            quality={85}
                            placeholder="blur"
                            blurDataURL="data:image/webp;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                            style={{
                              transform: "translate3d(0, 0, 0)",
                              willChange: "transform",
                            }}
                            itemProp="contentUrl"
                          />
                          <meta itemProp="name" content={banner.title} />
                          <meta
                            itemProp="description"
                            content={`Banner promosi untuk ${banner.title}`}
                          />
                        </div>
                      </Link>
                    ) : (
                      <div
                        className="relative aspect-[4/1] w-full"
                        itemScope
                        itemType="https://schema.org/ImageObject"
                        itemProp="image"
                      >
                        <Image
                          src={banner.imageUrl}
                          alt={banner.title}
                          fill
                          priority={index === 0}
                          loading={index === 0 ? "eager" : "lazy"}
                          className="rounded-2xl object-cover"
                          sizes="(max-width: 640px) 95vw, (max-width: 1024px) 85vw, 1200px"
                          quality={85}
                          placeholder="blur"
                          blurDataURL="data:image/webp;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                          style={{
                            transform: "translate3d(0, 0, 0)",
                            willChange: "transform",
                          }}
                          itemProp="contentUrl"
                        />
                        <meta itemProp="name" content={banner.title} />
                        <meta
                          itemProp="description"
                          content={`Banner untuk ${banner.title}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {activeBanners.length > 1 && (
            <>
              {/* Tombol Previous */}
              <button
                onClick={() => api?.scrollPrev()}
                className="absolute top-1/2 -translate-y-1/2 left-2 md:left-4 z-30 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6 text-destructive" />
              </button>

              {/* Tombol Next */}
              <button
                onClick={() => api?.scrollNext()}
                className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4 z-30 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6 text-destructive" />
              </button>
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
}

export default BannerLandingpage;
