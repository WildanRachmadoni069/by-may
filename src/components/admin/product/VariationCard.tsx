import { ProductVariation } from "@/types/product";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

interface VariationCardProps {
  variation: ProductVariation;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function VariationCard({
  variation,
  index,
  onEdit,
  onRemove,
  disabled,
}: VariationCardProps) {
  return (
    <div className="relative overflow-hidden border rounded-lg transition-all hover:border-primary">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="font-medium text-lg">{variation.name}</div>
            <div className="text-sm text-muted-foreground">
              {variation.options.length} opsi
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEdit}
              disabled={disabled}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Separator />
        <ScrollArea className="h-28 pr-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {variation.options.map((option) => (
              <div
                key={option.id}
                className="flex flex-col items-center p-2 gap-2 border rounded-md bg-muted/30"
              >
                {index === 0 && option.imageUrl && (
                  <img
                    src={option.imageUrl}
                    alt={option.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                )}
                <div className="text-sm font-medium text-center">
                  {option.name}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
