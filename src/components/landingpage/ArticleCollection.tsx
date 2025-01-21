"use client";
import React from "react";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "../ui/carousel";
import Link from "next/link";
import { ArticleCard } from "../general/ArticleCard";
import articles from "@/lib/data/articles.js";

function ArticleCollection() {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
  React.useEffect(() => {
    if (!carouselApi) {
      return;
    }
  }, [carouselApi]);
  return (
    <section className="container px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="flex items-center justify-between mb-4 border-b-2">
        <h2 className="text-xl font-bold text-foreground sm:text-3xl border-b-2 border-b-primary pb-4 -mb-1">
          Artikel Terbaru
        </h2>
        <div className="flex items-center gap-2 pb-4">
          <Button asChild>
            <Link href={"/artikel"}>Lihat Semua Artikel</Link>
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
          <CarouselContent className="-ml-2 md:-ml-4">
            {articles?.map((item, index) => (
              <CarouselItem
                key={index}
                className="basis-1/2 md:basis-1/3 lg:basis-1/4 pl-2 md:pl-4 rounded-md"
              >
                <div className="p-1">
                  <ArticleCard {...item} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}

export default ArticleCollection;
