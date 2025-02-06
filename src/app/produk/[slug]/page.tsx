"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ProductFormValues } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function ProductDetail() {
  const [product, setProduct] = useState<ProductFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const q = query(collection(db, "products"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const productData = querySnapshot.docs[0].data() as ProductFormValues;
          setProduct(productData);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!product) {
    return <div className="container mx-auto p-6">Product not found</div>;
  }

  const images = [
    product.mainImage,
    ...(product.additionalImages?.filter(Boolean) || []),
  ].filter((img): img is string => Boolean(img));

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Main Product Section - Updated Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Image Carousel Section - Fixed Width */}
        <div className="w-full md:w-[450px] md:flex-shrink-0">
          <div className="sticky top-6">
            <Card className="p-4 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <Carousel className="w-full" setApi={setApi}>
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-square">
                        <Image
                          src={image}
                          alt={`${product.name} - ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                          sizes="450px"
                          priority={index === 0}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="absolute top-1/2 left-[1px] flex items-center justify-center">
                  <CarouselPrevious className="relative left-0 translate-x-0 hover:translate-x-0" />
                </div>
                <div className="absolute top-1/2 right-[1px] flex items-center justify-center">
                  <CarouselNext className="relative right-0 translate-x-0 hover:translate-x-0" />
                </div>
              </Carousel>

              {/* Thumbnails */}
              <div className="mt-4">
                <div className="flex space-x-2 overflow-x-auto py-2 px-1">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => api?.scrollTo(index)}
                      className={cn(
                        "relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden", // Reduce thumbnail size
                        current === index
                          ? "ring-2 ring-primary"
                          : "ring-1 ring-muted hover:ring-primary/50"
                      )}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Product Info Section - Flexible Width */}
        <div className="flex-1 space-y-6 min-w-0">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="mt-4 text-3xl font-semibold text-primary">
              {product.hasVariations
                ? `${formatRupiah(
                    Math.min(
                      ...Object.values(product.variationPrices).map(
                        (v) => v.price
                      )
                    )
                  )} - ${formatRupiah(
                    Math.max(
                      ...Object.values(product.variationPrices).map(
                        (v) => v.price
                      )
                    )
                  )}`
                : formatRupiah(product.basePrice || 0)}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Variations */}
          {product.hasVariations && (
            <div className="space-y-6">
              {product.variations.map((variation) => (
                <div key={variation.id} className="space-y-3">
                  <h3 className="font-medium text-lg">{variation.name}</h3>
                  <div className="flex flex-wrap gap-3">
                    {variation.options.map((option) => (
                      <button
                        key={option.id}
                        className={cn(
                          "flex flex-col items-center border rounded-lg p-3 hover:border-primary transition-colors",
                          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        )}
                      >
                        {option.imageUrl && (
                          <div className="relative w-20 h-20 mb-2">
                            <Image
                              src={option.imageUrl}
                              alt={option.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        )}
                        <span className="text-sm font-medium">
                          {option.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Updated Description Section */}
      <Card className="mt-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Deskripsi Produk</h2>
        </div>
        <div className="p-6">
          <div
            className={cn(
              "prose max-w-none relative",
              !isDescriptionExpanded && "max-h-[300px] overflow-hidden"
            )}
          >
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
            {!isDescriptionExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
            )}
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          >
            {isDescriptionExpanded ? "Tutup" : "Baca Selengkapnya"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
