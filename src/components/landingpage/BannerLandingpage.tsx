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
  if (loading) return null;
  if (activeBanners.length === 0) return null;

  return (
    <div className="w-full py-6">
      <div className="container mx-auto">
        <Carousel
          opts={{
            align: "center",
            loop: activeBanners.length > 1,
            slidesToScroll: 1,
            duration: 25,
            watchDrag: false,
            skipSnaps: false,
          }}
          plugins={
            activeBanners.length > 1
              ? [
                  Autoplay({
                    delay: 5000,
                    stopOnInteraction: false,
                    stopOnMouseEnter: true,
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
                      "transition-all duration-300 ease-out",
                      current === index && usePeekMode
                        ? "scale-105"
                        : "scale-95"
                    )}
                    style={{
                      opacity: current === index ? 1 : 0.7,
                    }}
                  >
                    {banner.url ? (
                      <Link href={banner.url} className="block w-full">
                        <div className="relative aspect-[1200/300] w-full">
                          <Image
                            src={banner.imageUrl}
                            alt={banner.title}
                            fill
                            priority
                            className="rounded-2xl"
                            style={{ objectFit: "cover" }}
                            sizes="(max-width: 768px) 100vw, 1200px"
                          />
                        </div>
                      </Link>
                    ) : (
                      <div className="relative aspect-[1200/300] w-full">
                        <Image
                          src={banner.imageUrl}
                          alt={banner.title}
                          fill
                          priority
                          className="rounded-2xl"
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 768px) 100vw, 1200px"
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
                className="absolute top-1/2 -translate-y-1/2 left-2 md:left-4 z-30 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6 text-destructive" />
              </button>

              {/* Tombol Next */}
              <button
                onClick={() => api?.scrollNext()}
                className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4 z-30 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6 text-destructive" />
              </button>
            </>
          )}
        </Carousel>

        {activeBanners.length > 1 && (
          <div className="py-2 flex justify-center gap-1">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  current === index ? "bg-primary" : "bg-neutral-300"
                )}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BannerLandingpage;
