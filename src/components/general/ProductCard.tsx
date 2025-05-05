import Link from "next/link";
import Image from "next/image";
import { cn, formatRupiah } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const renderPrice = () => {
    if (!product.hasVariations) {
      return product.basePrice ? formatRupiah(product.basePrice) : "-";
    }

    // For products with variations, we're now sending the lowest price as basePrice
    // from the API for display purposes
    if (product.basePrice) {
      return formatRupiah(product.basePrice);
    }

    return "-";
  };

  const specialLabelText = {
    new: "Baru",
    best: "Best Seller",
    sale: "Diskon",
  } as const;

  return (
    <Link href={`/produk/${product.slug}`} className="group">
      <Card
        className={cn(
          "overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-200",
          className
        )}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.featuredImage?.url ? (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.alt || product.name}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
              No Image
            </div>
          )}

          {product.specialLabel && (
            <div className="absolute top-2 right-2">
              <Badge className="font-medium bg-primary">
                {specialLabelText[
                  product.specialLabel as keyof typeof specialLabelText
                ] || product.specialLabel}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-medium text-sm line-clamp-1 mb-1">
            {product.name}
          </h3>
          <p className="text-primary font-semibold">{renderPrice()}</p>
        </div>
      </Card>
    </Link>
  );
}
