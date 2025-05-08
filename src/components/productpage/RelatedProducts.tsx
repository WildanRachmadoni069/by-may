"use client";

import ProductCard from "@/components/general/ProductCard";
import { Skeleton } from "../ui/skeleton";
import { useRelatedProducts } from "@/hooks/useRelatedProducts";

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
  limit = 4,
}: RelatedProductsProps) {
  // Use the hook with all parameters to support prioritized logic
  const { relatedProducts, isLoading, error } = useRelatedProducts(
    currentProductId,
    categoryId,
    collectionId,
    limit,
    {
      revalidateOnFocus: false,
    }
  );

  if (isLoading) {
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

  if (error || relatedProducts.length === 0) {
    return null; // Hide section if error or no related products
  }

  // Debug log to verify price data is present
  console.log(
    "Related products with price data:",
    relatedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      hasVariations: p.hasVariations,
      basePrice: p.basePrice,
      priceVariantsCount: p.priceVariants?.length || 0,
    }))
  );

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Produk Terkait</h2>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
