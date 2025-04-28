import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  X,
  Save,
  Edit2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check,
  Ban,
} from "lucide-react";
import ImageUploadPreview from "@/components/admin/product/ImageUploadPreview";
import LabelWithTooltip from "@/components/general/LabelWithTooltip";
import { useProductVariationStore } from "@/store/useProductVariationStore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDebug } from "@/hooks/use-debug";
import DebugPanel from "@/components/admin/debug/DebugPanel";

// Helper function to delete image from Cloudinary
const deleteCloudinaryImage = async (imageUrl: string | undefined) => {
  if (!imageUrl) return;

  try {
    const response = await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: imageUrl }),
    });

    if (!response.ok) {
      console.error(
        "Failed to delete image from Cloudinary:",
        await response.text()
      );
    }
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

// Preview component for a saved variation
const VariationPreview = ({
  variation,
  index,
  onEdit,
  onDelete,
}: {
  variation: {
    name: string;
    options: { name: string; imageUrl?: string }[];
  };
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="border border-muted rounded-lg p-3 sm:p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium">
            Variasi {index + 1}:{" "}
            <span className="font-semibold">{variation.name}</span>
          </h3>
          <Badge variant="outline" className="ml-1">
            {variation.options.length} opsi
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-1 text-xs sm:text-sm h-8"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span className="sm:inline">Edit</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="flex items-center gap-1 text-xs sm:text-sm h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <X className="h-3.5 w-3.5" />
            <span className="sm:inline">Hapus</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {variation.options.map((option, optionIndex) => (
          <div
            key={optionIndex}
            className="flex items-center gap-1 bg-muted/60 rounded-md px-1.5 py-1 sm:px-2 sm:py-1"
          >
            {index === 0 && option.imageUrl ? (
              <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-sm overflow-hidden relative">
                <img
                  src={option.imageUrl}
                  alt={option.name}
                  className="object-cover h-full w-full"
                />
              </div>
            ) : index === 0 ? (
              <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            ) : null}
            <span className="text-xs sm:text-sm">{option.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Variation form component
const VariationForm = ({
  variation,
  variationIndex,
  canHaveImages = false,
  onSave,
  onCancel,
  onRemove,
}: {
  variation: {
    name: string;
    options: { name: string; imageUrl?: string }[];
  };
  variationIndex: number;
  canHaveImages?: boolean;
  onSave: () => void;
  onCancel: () => void;
  onRemove: () => void;
}) => {
  const {
    updateVariation,
    addOptionToVariation,
    updateOptionInVariation,
    removeOptionFromVariation,
  } = useProductVariationStore();

  const { toast } = useToast();

  const handleRemoveOption = async (optionIndex: number) => {
    if (variation.options.length <= 1) {
      toast({
        variant: "destructive",
        title: "Tidak dapat menghapus",
        description: "Variasi harus memiliki minimal satu opsi",
      });
      return;
    }

    // Check if the option has an image and delete it if necessary
    const optionToDelete = variation.options[optionIndex];
    if (optionToDelete?.imageUrl) {
      // Show loading toast
      toast({
        title: "Menghapus gambar...",
        description: "Sedang menghapus gambar dari Cloudinary",
      });

      await deleteCloudinaryImage(optionToDelete.imageUrl);
    }

    // Now remove the option from the store
    removeOptionFromVariation(variationIndex, optionIndex);

    toast({
      title: "Opsi dihapus",
      description: "Opsi variasi berhasil dihapus",
    });
  };

  return (
    <div className="border border-primary/20 rounded-lg overflow-hidden bg-card shadow-sm mb-4">
      <div className="bg-primary/10 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b">
        <h3 className="text-base sm:text-lg font-medium">
          Variasi {variationIndex + 1}
        </h3>
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="flex items-center gap-1 text-xs sm:text-sm h-8 text-muted-foreground"
          >
            <Ban className="h-3.5 w-3.5" />
            <span>Batal</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="flex items-center gap-1 text-xs sm:text-sm h-8 text-destructive hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
            <span>Hapus</span>
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onSave}
            className="flex items-center gap-1 text-xs sm:text-sm h-8"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Simpan</span>
          </Button>
        </div>
      </div>

      <div className="p-3 sm:p-5 space-y-4 sm:space-y-6">
        {/* Variation Name */}
        <div className="space-y-2">
          <LabelWithTooltip
            htmlFor={`variation-${variationIndex}-name`}
            label="Nama Variasi"
            tooltip="Contoh: Warna, Ukuran, dll."
          />
          <Input
            id={`variation-${variationIndex}-name`}
            value={variation.name}
            onChange={(e) =>
              updateVariation(variationIndex, { name: e.target.value })
            }
            placeholder="Contoh: Ukuran"
            className="max-w-full sm:max-w-md"
          />
        </div>

        {/* Variation Options */}
        <div className="space-y-3 sm:space-y-4">
          <LabelWithTooltip
            htmlFor={`variation-${variationIndex}-options`}
            label="Opsi Variasi"
            tooltip="Contoh: S, M, L untuk ukuran"
          />

          {/* Options list */}
          <div className="grid gap-2 sm:gap-3">
            {variation.options.map((option, optionIndex) => (
              <div
                key={optionIndex}
                className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-2 sm:p-3 bg-background rounded-md border"
              >
                {/* Image uploader for first variation only */}
                {canHaveImages && (
                  <div className="w-full sm:w-20 h-20 shrink-0">
                    <ImageUploadPreview
                      id={`variation-${variationIndex}-option-${optionIndex}-image`}
                      value={option.imageUrl || null}
                      onChange={(url) =>
                        updateOptionInVariation(variationIndex, optionIndex, {
                          imageUrl: url || undefined,
                        })
                      }
                      className="w-full h-full"
                    />
                  </div>
                )}

                <div className="flex-grow flex items-center">
                  <Input
                    id={`variation-${variationIndex}-option-${optionIndex}`}
                    value={option.name}
                    onChange={(e) =>
                      updateOptionInVariation(variationIndex, optionIndex, {
                        name: e.target.value,
                      })
                    }
                    placeholder={`Opsi ${optionIndex + 1}`}
                    className="w-full max-w-full"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(optionIndex)}
                    className="h-8 w-8 shrink-0 ml-1 sm:ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1 sm:mt-2"
            onClick={() => addOptionToVariation(variationIndex)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Opsi
          </Button>
        </div>
      </div>
    </div>
  );
};

// Price variant section component
const PriceVariantSection = () => {
  const { priceVariants, updatePriceVariant } = useProductVariationStore();
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkStock, setBulkStock] = useState<string>("");

  const handlePriceChange = (combinationKey: string, price: number | null) => {
    updatePriceVariant(combinationKey, { price });
  };

  const handleStockChange = (combinationKey: string, stock: number | null) => {
    updatePriceVariant(combinationKey, { stock });
  };

  const handleSkuChange = (combinationKey: string, sku: string) => {
    updatePriceVariant(combinationKey, { sku });
  };

  // Apply bulk price to all variants
  const applyBulkPrice = () => {
    const price = bulkPrice ? Number(bulkPrice) : null;
    priceVariants.forEach((variant) => {
      const combinationKey = variant.optionCombination.join("|");
      updatePriceVariant(combinationKey, { price });
    });
    setBulkPrice("");
  };

  // Apply bulk stock to all variants
  const applyBulkStock = () => {
    const stock = bulkStock ? Number(bulkStock) : null;
    priceVariants.forEach((variant) => {
      const combinationKey = variant.optionCombination.join("|");
      updatePriceVariant(combinationKey, { stock });
    });
    setBulkStock("");
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium">
          Harga & Stok Berdasarkan Variasi
        </h3>
        <p className="text-sm text-muted-foreground">
          Tentukan harga dan stok untuk setiap kombinasi variasi produk
        </p>
      </div>

      {priceVariants.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          Variasi belum tersedia atau belum disimpan. Silakan tambah dan simpan
          variasi terlebih dahulu.
        </p>
      ) : (
        <>
          {/* Bulk Operations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 p-3 sm:p-4 border rounded-md bg-muted/20">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <LabelWithTooltip
                  htmlFor="bulkPrice"
                  label="Harga Massal"
                  tooltip="Terapkan harga yang sama ke semua variasi"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="bulkPrice"
                  type="number"
                  placeholder="Harga untuk semua variasi"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  className="flex-grow"
                />
                <Button
                  type="button"
                  onClick={applyBulkPrice}
                  variant="secondary"
                  size="sm"
                  disabled={!bulkPrice}
                  className="sm:w-auto w-full"
                >
                  Terapkan
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <LabelWithTooltip
                  htmlFor="bulkStock"
                  label="Stok Massal"
                  tooltip="Terapkan stok yang sama ke semua variasi"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="bulkStock"
                  type="number"
                  placeholder="Stok untuk semua variasi"
                  value={bulkStock}
                  onChange={(e) => setBulkStock(e.target.value)}
                  className="flex-grow"
                />
                <Button
                  type="button"
                  onClick={applyBulkStock}
                  variant="secondary"
                  size="sm"
                  disabled={!bulkStock}
                  className="sm:w-auto w-full"
                >
                  Terapkan
                </Button>
              </div>
            </div>
          </div>

          {/* Price Variants Table - Mobile responsive version */}
          <div className="border rounded-md overflow-hidden">
            {/* Table Header - Hidden on mobile */}
            <div className="bg-muted px-3 py-2 border-b hidden sm:grid grid-cols-12 gap-2">
              <div className="col-span-5 font-medium text-sm">Variasi</div>
              <div className="col-span-3 font-medium text-sm">Harga (Rp)</div>
              <div className="col-span-2 font-medium text-sm">Stok</div>
              <div className="col-span-2 font-medium text-sm">
                SKU (Opsional)
              </div>
            </div>

            {/* Mobile & Desktop variants */}
            <div className="divide-y">
              {priceVariants.map((variant, index) => {
                const combinationKey = variant.optionCombination.join("|");
                return (
                  <div
                    key={index}
                    className="px-3 py-3 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center space-y-2 sm:space-y-0"
                  >
                    {/* Mobile labels visible, desktop labels in grid */}
                    <div className="col-span-5 space-y-0.5">
                      {variant.optionLabels.map((label, idx) => (
                        <div key={idx} className="text-sm">
                          {label}
                        </div>
                      ))}
                    </div>

                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-muted-foreground mb-1 sm:hidden">
                        Harga (Rp)
                      </label>
                      <Input
                        type="number"
                        value={variant.price ?? ""}
                        onChange={(e) =>
                          handlePriceChange(
                            combinationKey,
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        placeholder="0"
                        className="h-9"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-muted-foreground mb-1 sm:hidden">
                        Stok
                      </label>
                      <Input
                        type="number"
                        value={variant.stock ?? ""}
                        onChange={(e) =>
                          handleStockChange(
                            combinationKey,
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        placeholder="0"
                        className="h-9"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-muted-foreground mb-1 sm:hidden">
                        SKU (Opsional)
                      </label>
                      <Input
                        type="text"
                        value={variant.sku || ""}
                        onChange={(e) =>
                          handleSkuChange(combinationKey, e.target.value)
                        }
                        placeholder="SKU"
                        className="h-9"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface ProductVariationSectionProps {
  onPriceChange: (price: number | null) => void;
  onStockChange: (stock: number | null) => void;
  basePrice: number | null;
  baseStock: number | null;
}

const ProductVariationSection: React.FC<ProductVariationSectionProps> = ({
  onPriceChange,
  onStockChange,
  basePrice,
  baseStock,
}) => {
  const { toast } = useToast();
  const isDebugEnabled = useDebug();
  const {
    hasVariations,
    variations,
    openVariationForms,
    priceVariants,
    setHasVariations,
    addVariation,
    removeVariation,
    setVariationFormOpen,
    generatePriceVariants,
  } = useProductVariationStore();

  // Check if any variation form is currently open
  const isAnyFormOpen = openVariationForms.length > 0;

  // Handle deleting a variation including any associated images
  const handleDeleteVariation = async (index: number) => {
    const variationToDelete = variations[index];

    // Check if this is the first variation (which can have images)
    if (index === 0) {
      // Find any options with images
      const optionsWithImages = variationToDelete.options.filter(
        (option) => option.imageUrl
      );

      if (optionsWithImages.length > 0) {
        // Show loading toast
        toast({
          title: "Menghapus gambar...",
          description: "Sedang menghapus gambar variasi",
        });

        // Delete all images in parallel
        await Promise.all(
          optionsWithImages.map((option) =>
            deleteCloudinaryImage(option.imageUrl)
          )
        );
      }
    }

    // Now remove the variation from the store
    removeVariation(index);

    toast({
      title: "Variasi dihapus",
      description: "Variasi produk berhasil dihapus",
    });
  };

  // Add a new variation and open its form
  const handleAddVariation = () => {
    if (hasVariations) {
      // Add another variation
      addVariation();
      // Open the form for this new variation
      setVariationFormOpen(variations.length, true);
    } else {
      // First variation - converting from simple to variation product
      setHasVariations(true);
      // Open the form for the first variation
      setVariationFormOpen(0, true);
    }
  };

  // Regenerate price variants whenever variations change
  useEffect(() => {
    // Only generate if there are saved variations (not in edit mode)
    const savedVariations = variations.filter(
      (v) => v.name && !openVariationForms.includes(variations.indexOf(v))
    );
    if (savedVariations.length > 0 && !isAnyFormOpen) {
      generatePriceVariants();
    }
  }, [variations, openVariationForms, isAnyFormOpen, generatePriceVariants]);

  return (
    <Card>
      <CardHeader className="sm:flex-row sm:items-center px-4 py-4 sm:px-6 sm:py-6">
        <div>
          <CardTitle>Variasi dan Harga</CardTitle>
          <CardDescription>
            Tetapkan harga dan variasi produk (opsional)
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-4 pb-4 sm:px-6 sm:pb-6">
        {/* Initial state: Add Variation button above base price and stock */}
        {!hasVariations && (
          <>
            {/* Button at top for initial state */}
            <div className="flex items-center justify-center mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddVariation}
                className="flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Variasi Produk</span>
              </Button>
            </div>

            {/* Base Price and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="basePrice"
                  label="Harga (Rp)"
                  tooltip="Harga produk dalam Rupiah (tanpa titik atau koma)"
                />
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  placeholder="0"
                  value={basePrice || ""}
                  onChange={(e) =>
                    onPriceChange(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="baseStock"
                  label="Stok"
                  tooltip="Jumlah persediaan produk"
                />
                <Input
                  id="baseStock"
                  name="baseStock"
                  type="number"
                  placeholder="0"
                  value={baseStock || ""}
                  onChange={(e) =>
                    onStockChange(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                />
              </div>
            </div>
          </>
        )}

        {/* Variations Section */}
        {hasVariations && (
          <div className="space-y-4">
            {/* Map through variations */}
            {variations.map((variation, index) => (
              <div key={index}>
                {/* Show either form or preview */}
                {openVariationForms.includes(index) ? (
                  <VariationForm
                    variation={variation}
                    variationIndex={index}
                    canHaveImages={index === 0}
                    onSave={() => {
                      setVariationFormOpen(index, false);
                      // When saving a variation, regenerate the price variants
                      if (
                        variation.name &&
                        variation.options.some((o) => o.name)
                      ) {
                        generatePriceVariants();
                      }
                    }}
                    onCancel={() => {
                      if (
                        variation.name.trim() === "" &&
                        variation.options.every((o) => o.name.trim() === "")
                      ) {
                        handleDeleteVariation(index);
                      } else {
                        setVariationFormOpen(index, false);
                      }
                    }}
                    onRemove={() => handleDeleteVariation(index)}
                  />
                ) : (
                  <VariationPreview
                    variation={variation}
                    index={index}
                    onEdit={() => setVariationFormOpen(index, true)}
                    onDelete={() => handleDeleteVariation(index)}
                  />
                )}
              </div>
            ))}

            {/* Add variation button BELOW variations - limited to 2 variations */}
            {variations.length < 2 && (
              <div className="flex justify-center mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddVariation}
                  disabled={isAnyFormOpen}
                  className={cn(
                    "flex items-center gap-2 w-full sm:w-auto justify-center",
                    isAnyFormOpen && "opacity-50 pointer-events-none"
                  )}
                >
                  <Plus className="h-4 w-4" />
                  {variations.length === 0
                    ? "Tambah Variasi"
                    : "Tambah Variasi Lain"}
                </Button>
              </div>
            )}

            {/* Price Variants Section - only show when variations are saved */}
            {variations.length > 0 && !isAnyFormOpen && (
              <div className="mt-6 sm:mt-8 pt-4 border-t">
                <PriceVariantSection />
              </div>
            )}
          </div>
        )}

        {/* Debug information panel */}
        {isDebugEnabled && (
          <>
            <DebugPanel
              title="Variation Data"
              data={{
                hasVariations,
                variations,
                openVariationForms,
                priceVariants,
                basePrice,
                baseStock,
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductVariationSection;
