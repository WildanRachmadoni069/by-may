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

interface Image {
  src: string;
  alt: string;
  caption?: string;
  blurDataURL: string;
}

const imagesOdd = [
  {
    src: "/img/Landing-Page/puma.webp",
    alt: "Image 1",
    caption: "Banner 1",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoQBcZf7jAAAAABJRU5ErkJggg==",
  },
  {
    src: "/img/Landing-Page/puma.webp",
    alt: "Image 2",
    caption: "Banner 2",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoQBcZf7jAAAAABJRU5ErkJggg==",
  },
  {
    src: "/img/Landing-Page/puma.webp",
    alt: "Image 3",
    caption: "Banner 3",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoQBcZf7jAAAAABJRU5ErkJggg==",
  },
];

function BannerLandingpage() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = React.useState<null | number>(null);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

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
          {imagesOdd.map((item, index) => (
            <CarouselItem
              key={index}
              className={`pl-2 basis-[83%] rounded-lg overflow-hidden`}
            >
              <div
                className={`p-1 flex transition duration-500 rounded-lg ${
                  index == current ? "scale-105" : "scale-90"
                }`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={1200}
                  height={300}
                  className={`rounded-lg`}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          variant={"destructive"}
          className="left-0 md:left-5 lg:left-11 bg-foreground hover:bg-foreground/90 lg:w-12 lg:h-12 opacity-50"
        />
        <CarouselNext
          variant={"destructive"}
          className="right-0 md:right-5 lg:right-11 bg-foreground hover:bg-foreground/90 lg:w-12 lg:h-12 opacity-50"
        />
      </Carousel>
    </div>
  );
}

export default BannerLandingpage;
