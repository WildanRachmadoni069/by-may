import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/lib/utils";
import { ProductVariation, VariationCombination } from "@/types/product";
import { Copy, Edit2, Undo2 } from "lucide-react";

interface PriceStockGridProps {
  variations: ProductVariation[];
  combinations: VariationCombination[];
  variationPrices: Record<string, { price: number; stock: number }>;
  onChange: (id: string, field: "price" | "stock", value: number) => void;
}

export function PriceStockGrid({
  variations,
  combinations,
  variationPrices,
  onChange,
}: PriceStockGridProps) {
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkPrice, setBulkPrice] = useState<number | "">("");
  const [bulkStock, setBulkStock] = useState<number | "">("");

  // Helper function to get variation value
  const getVariationValue = (
    combinationId: string,
    field: "price" | "stock"
  ) => {
    const value = variationPrices[combinationId]?.[field];
    return value === 0 ? "" : value || "";
  };

  const applyBulkEdit = () => {
    combinations.forEach((combination) => {
      if (bulkPrice !== "") {
        onChange(combination.id, "price", Number(bulkPrice));
      }
      if (bulkStock !== "") {
        onChange(combination.id, "stock", Number(bulkStock));
      }
    });
    setBulkEditMode(false);
    setBulkPrice("");
    setBulkStock("");
  };

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium">Harga dan Stok Variasi</Label>
          {!bulkEditMode ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkEditMode(true)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Massal
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBulkEditMode(false)}
            >
              <Undo2 className="h-4 w-4 mr-2" />
              Batal
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {bulkEditMode && (
          <div className="mb-4 p-3 bg-muted/30 rounded-md">
            <h3 className="font-medium mb-2">Edit Semua Variasi Sekaligus</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bulkPrice">Harga untuk semua variasi</Label>
                <Input
                  id="bulkPrice"
                  type="number"
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  value={bulkPrice}
                  onChange={(e) =>
                    setBulkPrice(e.target.value ? Number(e.target.value) : "")
                  }
                />
              </div>
              <div>
                <Label htmlFor="bulkStock">Stok untuk semua variasi</Label>
                <Input
                  id="bulkStock"
                  type="number"
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  value={bulkStock}
                  onChange={(e) =>
                    setBulkStock(e.target.value ? Number(e.target.value) : "")
                  }
                />
              </div>
            </div>
            <Button className="mt-3" onClick={applyBulkEdit}>
              <Copy className="h-4 w-4 mr-2" />
              Terapkan ke Semua Variasi
            </Button>
          </div>
        )}

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[40%]">Kombinasi Variasi</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead className="text-right">Stok</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {combinations.map((combination) => (
                <TableRow key={combination.id}>
                  <TableCell className="font-medium">
                    {combination.name}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      placeholder="Harga"
                      value={getVariationValue(combination.id, "price")}
                      onChange={(e) => {
                        const value = e.target.value;
                        onChange(
                          combination.id,
                          "price",
                          value === "" ? 0 : Number(value)
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      placeholder="Stok"
                      value={getVariationValue(combination.id, "stock")}
                      onChange={(e) => {
                        const value = e.target.value;
                        onChange(
                          combination.id,
                          "stock",
                          value === "" ? 0 : Number(value)
                        );
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
