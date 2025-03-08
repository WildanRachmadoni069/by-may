"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { useBannerStore } from "@/store/useBannerStore";

function BannerLandingpage() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = React.useState<null | number>(null);
  const { fetchBanners, getActiveBanners, loading } = useBannerStore();

  // Fetch banners on component mount
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Handle carousel navigation
  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Get active banners for display
  const activeBanners = getActiveBanners();

  // If no banners or loading, don't render the component
  if (loading) return null;
  if (activeBanners.length === 0) return null;

  return (
    <div className="container p-10">
      <Carousel
        opts={{
          align: "center",
          loop: true,
          duration: 50,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-full"
        setApi={setApi}
      >
        <CarouselContent className="-ml-2">
          {activeBanners.map((item, index) => (
            <CarouselItem
              key={item.id}
              className={`pl-2 basis-[83%] rounded-lg overflow-hidden`}
            >
              <div
                className={`p-1 flex transition duration-500 rounded-lg ${
                  index === current ? "scale-105" : "scale-90"
                }`}
              >
                {item.url ? (
                  <Link href={item.url} className="rounded-lg w-full">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      width={1200}
                      height={300}
                      className=""
                    />
                  </Link>
                ) : (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={1200}
                    height={300}
                    className="rounded-lg w-full"
                  />
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          variant="destructive"
          className="left-0 md:left-5 lg:left-11 bg-foreground hover:bg-foreground/90 lg:w-12 lg:h-12 opacity-50"
        />
        <CarouselNext
          variant="destructive"
          className="right-0 md:right-5 lg:right-11 bg-foreground hover:bg-foreground/90 lg:w-12 lg:h-12 opacity-50"
        />
      </Carousel>
    </div>
  );
}

export default BannerLandingpage;
