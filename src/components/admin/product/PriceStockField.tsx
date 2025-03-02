import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface PriceStockFieldProps {
  label: string;
  pairs: Array<{
    id: string;
    name: string;
    price: string | number;
    stock: string | number;
    onPriceChange: (value: string) => void;
    onStockChange: (value: string) => void;
  }>;
}

export function PriceStockField({ label, pairs }: PriceStockFieldProps) {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-medium">{label}</Label>
      </div>
      <Separator />
      <div className="space-y-4">
        {pairs.map(
          ({ id, name, price, stock, onPriceChange, onStockChange }) => (
            <div key={id} className="grid grid-cols-3 gap-4 items-center">
              <div className="text-sm">{name}</div>
              <Input
                type="number"
                placeholder="Harga"
                value={price}
                onChange={(e) => onPriceChange(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Stok"
                value={stock}
                onChange={(e) => onStockChange(e.target.value)}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}
