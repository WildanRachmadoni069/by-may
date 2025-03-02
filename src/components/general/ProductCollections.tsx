"use client";
import React from "react";
import ProductCard from "./ProductCard";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "../ui/carousel";
import { productList } from "@/lib/data/product";

interface ProductCollectionsProps {
  title: string;
}

function ProductCollections({ title }: ProductCollectionsProps) {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
  React.useEffect(() => {
    if (!carouselApi) {
      return;
    }
  }, [carouselApi]);
  return (
    <section className="container px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="flex items-center justify-between border-b-2 mb-4">
        <h2 className="text-xl font-bold text-foreground sm:text-3xl border-b-2 border-b-primary pb-4 -mb-1">
          {title}
        </h2>
        <div className="flex items-center gap-2 pb-4">
          <Button
            variant={"primary"}
            className="rounded-full"
            size={"icon"}
            onClick={() => carouselApi?.scrollPrev()}
          >
            <ArrowLeft size={20} />
          </Button>
          <Button
            variant={"primary"}
            className="rounded-full"
            size={"icon"}
            onClick={() => carouselApi?.scrollNext()}
          >
            <ArrowRight size={20} />
          </Button>
        </div>
      </header>
      <div>
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          setApi={setCarouselApi}
        >
          <CarouselContent className="-ml-1 md:-ml-2">
            {productList.map((item, index) => (
              <CarouselItem
                key={index}
                className="basis-1/2 md:basis-1/3 lg:basis-1/6 pl-1 md:pl-2 rounded-md"
              >
                <div className="p-1">
                  {/* @ts-ignore */}
                  <ProductCard product={item} />
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
