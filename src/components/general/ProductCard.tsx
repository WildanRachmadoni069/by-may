import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProductFormValues } from "@/types/product";
import { formatRupiah } from "@/lib/utils";

function ProductCard({ product }: { product: ProductFormValues }) {
  const getProductPrice = () => {
    if (!product.hasVariations) {
      return formatRupiah(product.basePrice || 0);
    }

    // Get only the minimum price for variation products
    const minPrice = Math.min(
      ...Object.values(product.variationPrices).map((v) => v.price)
    );
    return `${formatRupiah(minPrice)}`;
  };

  return (
    <Link
      href={`/produk/${product.slug}`}
      className="group relative block overflow-hidden w-full max-w-xs"
    >
      <Card>
        <CardHeader className="p-0 overflow-hidden">
          <div className="relative aspect-square transition duration-500 group-hover:scale-105 ">
            <Image
              src={product.mainImage || "https://placehold.co/300"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        </CardHeader>

        <CardContent className={cn("flex flex-col gap-1 pt-2 px-2")}>
          <h3 className="text-lg font-semibold text-wrap min-h-[56px] line-clamp-2">
            {product.name}
          </h3>
          <p className="text-gray-600">{getProductPrice()}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default ProductCard;
