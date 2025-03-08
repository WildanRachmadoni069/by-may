"use client";
import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "../ui/carousel";
import { db } from "@/lib/firebase/firebaseConfig";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { Product } from "@/types/product";
import { Skeleton } from "../ui/skeleton";

interface ProductCollectionsProps {
  title: string;
  specialLabel: "best-seller" | "new" | string;
  limitCount?: number;
}

function ProductCollections({
  title,
  specialLabel,
  limitCount = 10,
}: ProductCollectionsProps) {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsRef = collection(db, "products");

        // Query products based on special label
        const q = query(
          productsRef,
          where("specialLabel", "==", specialLabel),
          limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const fetchedProducts: Product[] = [];

        snapshot.forEach((doc) => {
          fetchedProducts.push({
            id: doc.id,
            ...doc.data(),
          } as Product);
        });

        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [specialLabel, limitCount]);

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <section className="container px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="flex items-center justify-between border-b-2 mb-4">
        <h2 className="text-xl font-bold text-foreground sm:text-3xl border-b-2 border-b-primary pb-4 -mb-1">
          {title}
        </h2>
        {!loading && products.length > 0 && (
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
        )}
      </header>
      <div>
        {loading ? (
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
        ) : products.length > 0 ? (
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            setApi={setCarouselApi}
          >
            <CarouselContent className="-ml-1 md:-ml-2">
              {products.map((product) => (
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
        ) : (
          <div className="text-center py-12 text-gray-500">
            Produk Masih Belum Tersedia
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductCollections;
