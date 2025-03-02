import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProductVariation } from "@/types/product";

interface ProductVariationSelectorProps {
  variation: ProductVariation;
  selectedOptionId: string | undefined;
  onSelect: (optionId: string) => void;
}

export function ProductVariationSelector({
  variation,
  selectedOptionId,
  onSelect,
}: ProductVariationSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">{variation.name}</h3>
      <div className="flex flex-wrap gap-2">
        {variation.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={cn(
              "flex flex-col items-center border rounded-lg p-2 transition-colors min-w-[5rem]",
              selectedOptionId === option.id
                ? "border-primary bg-primary/5"
                : "border-input hover:border-primary",
              "focus:outline-none focus:ring-2 focus:ring-primary/20"
            )}
            title={option.name}
            aria-label={`${variation.name}: ${option.name}`}
          >
            {option.imageUrl && (
              <div className="relative w-14 h-14 mb-1">
                <Image
                  src={option.imageUrl}
                  alt={option.name}
                  fill
                  className="object-cover rounded-md"
                  sizes="56px"
                />
              </div>
            )}
            <span className="text-sm">{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProductVariationSelector;
