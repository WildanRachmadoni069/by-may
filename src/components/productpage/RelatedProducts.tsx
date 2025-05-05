"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import ProductCard from "@/components/general/ProductCard";
import { shuffleArray } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

interface RelatedProductsProps {
  currentProductId: string;
  categoryId?: string | null;
  collectionId?: string | null;
  limit?: number;
}

export default function RelatedProducts({
  currentProductId,
  categoryId,
  collectionId,
  limit: numberOfItems = 4,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        console.log("Fetching related products with:", {
          currentProductId,
          categoryId,
          collectionId,
        });

        // Validate inputs
        if (!currentProductId) {
          console.error("Missing currentProductId");
          setLoading(false);
          return;
        }

        // Build query parameters
        const params = new URLSearchParams();
        params.append("exclude", currentProductId);
        params.append("limit", (numberOfItems * 2).toString()); // Get more than we need for better shuffling

        let fetchedProducts: Product[] = [];

        // PRIORITY 1: Try collection first (if valid)
        if (collectionId && collectionId !== "all" && collectionId !== "none") {
          try {
            params.set("collectionId", collectionId);

            const collectionResponse = await fetch(
              `/api/products/related?${params.toString()}`
            );

            if (collectionResponse.ok) {
              const data = await collectionResponse.json();
              console.log(`Found ${data.length} products in same collection`);
              fetchedProducts = data;
            }
          } catch (err) {
            console.error("Error in collection query:", err);
          }
        }

        // PRIORITY 2: If not enough products, try category
        if (
          fetchedProducts.length < numberOfItems &&
          categoryId &&
          categoryId !== "all" &&
          categoryId !== "none"
        ) {
          try {
            params.set("categoryId", categoryId);
            if (collectionId) params.delete("collectionId");

            const categoryResponse = await fetch(
              `/api/products/related?${params.toString()}`
            );

            if (categoryResponse.ok) {
              const data = await categoryResponse.json();
              console.log(`Found ${data.length} products in same category`);

              // Add unique products from category
              const existingIds = new Set(fetchedProducts.map((p) => p.id));
              const uniqueCategoryProducts = data.filter(
                (p: Product) => !existingIds.has(p.id)
              );

              fetchedProducts = [...fetchedProducts, ...uniqueCategoryProducts];
            }
          } catch (err) {
            console.error("Error in category query:", err);
          }
        }

        // PRIORITY 3: If still not enough, get recent products
        if (fetchedProducts.length < numberOfItems) {
          try {
            // Clear previous filter params and just get latest products
            params.delete("categoryId");
            params.delete("collectionId");

            const recentResponse = await fetch(
              `/api/products/related?${params.toString()}`
            );

            if (recentResponse.ok) {
              const data = await recentResponse.json();
              console.log(`Found ${data.length} recent products`);

              // Add unique products from recent
              const existingIds = new Set(fetchedProducts.map((p) => p.id));
              const uniqueRecentProducts = data.filter(
                (p: Product) => !existingIds.has(p.id)
              );

              fetchedProducts = [...fetchedProducts, ...uniqueRecentProducts];
            }
          } catch (err) {
            console.error("Error in recent products query:", err);
          }
        }

        console.log(
          `Total fetched products before shuffle: ${fetchedProducts.length}`
        );
        if (fetchedProducts.length > 0) {
          const shuffled = shuffleArray(fetchedProducts);
          const limitedProducts = shuffled.slice(0, numberOfItems);
          console.log(`Final related products: ${limitedProducts.length}`);
          setProducts(limitedProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentProductId) {
      fetchRelatedProducts();
    }
  }, [currentProductId, categoryId, collectionId, numberOfItems]);

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Produk Terkait</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, idx) => (
              <Skeleton key={idx} className="h-[220px] w-full rounded-xl" />
            ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Hide section if no related products
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Produk Terkait</h2>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
