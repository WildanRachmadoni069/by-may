import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash } from "lucide-react";
import { ProductVariation } from "@/types/product";

/**
 * Props untuk komponen VariationCard
 */
interface VariationCardProps {
  /** Data variasi */
  variation: ProductVariation;
  /** Indeks variasi */
  index: number;
  /** Handler untuk edit variasi */
  onEdit: () => void;
  /** Handler untuk hapus variasi */
  onRemove: () => void;
  /** Status disabled */
  disabled?: boolean;
}

/**
 * Komponen untuk menampilkan variasi produk
 */
export const VariationCard: React.FC<VariationCardProps> = ({
  variation,
  index,
  onEdit,
  onRemove,
  disabled,
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {variation.name}
            <Badge variant="secondary" className="ml-2">
              {index === 0 ? "Utama" : "Variasi " + (index + 1)}
            </Badge>
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEdit}
              disabled={disabled}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            {index > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                disabled={disabled}
                className="text-red-500 hover:text-red-700"
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Hapus</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {variation.options.map((option) => (
            <Badge key={option.id} variant="outline">
              {option.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
