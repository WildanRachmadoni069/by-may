import React from "react";
import { Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ProductVariation } from "@/types/product";
import { isLegacyTimestampId } from "@/lib/utils";

interface VariationCardProps {
  variation: ProductVariation;
  index: number;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export const VariationCard = ({
  variation,
  index,
  onEdit,
  onRemove,
  disabled = false,
}: VariationCardProps) => {
  // Format ID for display - mask timestamp IDs, show descriptive for new ones
  const displayId = isLegacyTimestampId(variation.id)
    ? `${variation.id.substring(0, 4)}...${variation.id.substring(
        variation.id.length - 4
      )}`
    : variation.id;

  // Check if this is the first variation (which may have images)
  const isFirstVariation = index === 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{variation.name}</span>
          {/* <Badge variant="outline" className="text-xs">
            {displayId}
          </Badge> */}
          {isFirstVariation && (
            <Badge variant="secondary" className="text-xs">
              With Images
            </Badge>
          )}
        </div>
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(index)}
            disabled={disabled}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-2">
          {variation.options.map((option) => {
            // Format option ID similarly
            const optionDisplayId = isLegacyTimestampId(option.id)
              ? `${option.id.substring(0, 3)}..${option.id.substring(
                  option.id.length - 3
                )}`
              : option.id;

            return (
              <div
                key={option.id}
                className="flex items-center bg-muted px-2 py-1 rounded text-sm"
              >
                {isFirstVariation && option.imageUrl && (
                  <div className="relative h-5 w-5 mr-1 rounded-sm overflow-hidden">
                    <Image
                      src={option.imageUrl}
                      alt={option.name || "Option image"}
                      fill
                      className="object-cover"
                      sizes="20px"
                    />
                  </div>
                )}
                {isFirstVariation && !option.imageUrl && (
                  <ImageIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                )}
                <span>{option.name}</span>
                {/* <Badge variant="outline" className="ml-1 text-[10px] py-0">
                  {optionDisplayId}
                </Badge> */}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
