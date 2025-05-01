/**
 * Komponen Bagian Variasi Produk
 *
 * Menangani pembuatan dan pengelolaan variasi produk, opsi variasi, dan varian harga.
 * Mendukung hingga dua variasi (misalnya Warna dan Ukuran) dan pengaturan harga
 * dan stok untuk setiap kombinasi.
 */

import React, { useEffect, useState } from "react";
import { useProductVariationStore } from "@/store/useProductVariationStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import LabelWithTooltip from "@/components/general/LabelWithTooltip";
import { Plus, X, Ban, Check, Edit2, ImageIcon } from "lucide-react";
import ImageUploadPreview from "@/components/admin/product/ImageUploadPreview";

/**
 * Menghapus gambar dari Cloudinary
 * @param imageUrl URL gambar yang akan dihapus
 */
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
        "Gagal menghapus gambar dari Cloudinary:",
        await response.text()
      );
    }
  } catch (error) {
    console.error("Error saat menghapus gambar:", error);
  }
};

/**
 * Komponen preview variasi yang tersimpan
 */
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

/**
 * Komponen formulir untuk pengeditan variasi
 */
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

  /**
   * Menangani penghapusan opsi variasi
   * @param optionIndex Indeks opsi yang akan dihapus
   */
  const handleRemoveOption = async (optionIndex: number) => {
    if (variation.options.length <= 1) {
      toast({
        variant: "destructive",
        title: "Tidak dapat menghapus",
        description: "Variasi harus memiliki minimal satu opsi",
      });
      return;
    }

    // Periksa apakah opsi memiliki gambar dan hapus jika perlu
    const optionToDelete = variation.options[optionIndex];
    if (optionToDelete?.imageUrl) {
      toast({
        title: "Menghapus gambar...",
        description: "Sedang menghapus gambar dari Cloudinary",
      });

      await deleteCloudinaryImage(optionToDelete.imageUrl);
    }

    // Hapus opsi dari store
    removeOptionFromVariation(variationIndex, optionIndex);

    toast({
      title: "Opsi dihapus",
      description: "Opsi variasi berhasil dihapus",
    });
  };

  /**
   * Menangani perubahan gambar opsi variasi
   * @param optionIndex Indeks opsi yang gambarnya diubah
   * @param imageUrl URL gambar baru atau null jika dihapus
   */
  const handleOptionImageChange = (
    optionIndex: number,
    imageUrl: string | null
  ) => {
    updateOptionInVariation(variationIndex, optionIndex, {
      imageUrl: imageUrl || undefined,
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
        {/* Nama Variasi */}
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

        {/* Opsi Variasi */}
        <div className="space-y-3 sm:space-y-4">
          <LabelWithTooltip
            htmlFor={`variation-${variationIndex}-options`}
            label="Opsi Variasi"
            tooltip="Contoh: S, M, L untuk ukuran"
          />

          {/* Daftar opsi */}
          <div className="grid gap-2 sm:gap-3">
            {variation.options.map((option, optionIndex) => (
              <div
                key={optionIndex}
                className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-2 sm:p-3 bg-background rounded-md border"
              >
                {/* Komponen uploader gambar untuk variasi pertama */}
                {canHaveImages && (
                  <div className="w-full sm:w-24">
                    <ImageUploadPreview
                      id={`variation-${variationIndex}-option-${optionIndex}-image`}
                      value={option.imageUrl || null}
                      onChange={(url) =>
                        handleOptionImageChange(optionIndex, url)
                      }
                      className="aspect-square w-full"
                    />
                  </div>
                )}

                {/* Input nama opsi */}
                <div className="flex-grow">
                  <Input
                    placeholder={`Nama opsi ${optionIndex + 1}`}
                    value={option.name}
                    onChange={(e) =>
                      updateOptionInVariation(variationIndex, optionIndex, {
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Tombol hapus opsi */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveOption(optionIndex)}
                  className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Hapus opsi</span>
                </Button>
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

/**
 * Komponen untuk manajemen varian harga berdasarkan kombinasi variasi
 */
const PriceVariantSection = () => {
  const { priceVariants, updatePriceVariant } = useProductVariationStore();
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkStock, setBulkStock] = useState<string>("");

  /**
   * Memperbarui harga varian
   * @param combinationKey Kunci kombinasi varian
   * @param price Harga baru
   */
  const handlePriceChange = (combinationKey: string, price: number | null) => {
    updatePriceVariant(combinationKey, { price });
  };

  /**
   * Memperbarui stok varian
   * @param combinationKey Kunci kombinasi varian
   * @param stock Stok baru
   */
  const handleStockChange = (combinationKey: string, stock: number | null) => {
    updatePriceVariant(combinationKey, { stock });
  };

  /**
   * Memperbarui SKU varian
   * @param combinationKey Kunci kombinasi varian
   * @param sku SKU baru
   */
  const handleSkuChange = (combinationKey: string, sku: string) => {
    updatePriceVariant(combinationKey, { sku });
  };

  /**
   * Menerapkan harga massal ke semua varian
   */
  const applyBulkPrice = () => {
    const price = bulkPrice ? Number(bulkPrice) : null;
    priceVariants.forEach((variant) => {
      const combinationKey = variant.optionCombination.join("|");
      updatePriceVariant(combinationKey, { price });
    });
    setBulkPrice("");
  };

  /**
   * Menerapkan stok massal ke semua varian
   */
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
          {/* Operasi Massal */}
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

          {/* Tabel Varian Harga - versi responsif mobile */}
          <div className="border rounded-md overflow-hidden">
            {/* Header Tabel - Tersembunyi di mobile */}
            <div className="bg-muted px-3 py-2 border-b hidden sm:grid grid-cols-12 gap-2">
              <div className="col-span-5 font-medium text-sm">Variasi</div>
              <div className="col-span-3 font-medium text-sm">Harga (Rp)</div>
              <div className="col-span-2 font-medium text-sm">Stok</div>
              <div className="col-span-2 font-medium text-sm">
                SKU (Opsional)
              </div>
            </div>

            {/* Varian untuk Mobile & Desktop */}
            <div className="divide-y">
              {priceVariants.map((variant, index) => {
                const combinationKey = variant.optionCombination.join("|");
                return (
                  <div
                    key={combinationKey}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 p-3 sm:items-center"
                  >
                    {/* Variasi (Kombinasi Opsi) */}
                    <div className="col-span-1 sm:col-span-5 mb-2 sm:mb-0">
                      <div className="flex flex-col space-y-1">
                        <div className="sm:hidden text-xs font-medium text-muted-foreground">
                          Variasi
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {variant.optionLabels.map((label, i) => (
                            <span
                              key={i}
                              className="text-xs sm:text-sm bg-muted px-1.5 py-0.5 rounded-sm"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Harga */}
                    <div className="col-span-1 sm:col-span-3">
                      <div className="flex flex-col space-y-1">
                        <div className="sm:hidden text-xs font-medium text-muted-foreground">
                          Harga (Rp)
                        </div>
                        <Input
                          type="number"
                          placeholder="0"
                          value={variant.price ?? ""}
                          onChange={(e) =>
                            handlePriceChange(
                              combinationKey,
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Stok */}
                    <div className="col-span-1 sm:col-span-2">
                      <div className="flex flex-col space-y-1">
                        <div className="sm:hidden text-xs font-medium text-muted-foreground">
                          Stok
                        </div>
                        <Input
                          type="number"
                          placeholder="0"
                          value={variant.stock ?? ""}
                          onChange={(e) =>
                            handleStockChange(
                              combinationKey,
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* SKU */}
                    <div className="col-span-1 sm:col-span-2">
                      <div className="flex flex-col space-y-1">
                        <div className="sm:hidden text-xs font-medium text-muted-foreground">
                          SKU (Opsional)
                        </div>
                        <Input
                          placeholder="SKU"
                          value={variant.sku || ""}
                          onChange={(e) =>
                            handleSkuChange(combinationKey, e.target.value)
                          }
                        />
                      </div>
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

/**
 * Props untuk komponen ProductVariationSection
 */
interface ProductVariationSectionProps {
  /** Handler untuk perubahan harga dasar */
  onPriceChange: (price: number | null) => void;
  /** Handler untuk perubahan stok dasar */
  onStockChange: (stock: number | null) => void;
  /** Harga dasar produk */
  basePrice: number | null;
  /** Stok dasar produk */
  baseStock: number | null;
}

/**
 * Komponen untuk pengelolaan variasi produk dan harga
 *
 * Komponen ini menangani:
 * - Penambahan dan pengeditan variasi (hingga 2 variasi)
 * - Pengelolaan opsi untuk setiap variasi
 * - Pengaturan harga dan stok untuk setiap kombinasi variasi
 * - Mode harga tunggal (tanpa variasi) atau harga berbeda per variasi
 */
const ProductVariationSection: React.FC<ProductVariationSectionProps> = ({
  onPriceChange,
  onStockChange,
  basePrice,
  baseStock,
}) => {
  const { toast } = useToast();
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

  // Periksa apakah ada form variasi yang sedang terbuka
  const isAnyFormOpen = openVariationForms.length > 0;

  /**
   * Menghapus variasi termasuk gambar terkait
   * @param index Indeks variasi yang akan dihapus
   */
  const handleDeleteVariation = async (index: number) => {
    const variationToDelete = variations[index];

    // Periksa apakah ini variasi pertama (yang bisa memiliki gambar)
    if (index === 0) {
      // Cari opsi dengan gambar
      const optionsWithImages = variationToDelete.options.filter(
        (option) => option.imageUrl
      );

      if (optionsWithImages.length > 0) {
        // Tampilkan toast loading
        toast({
          title: "Menghapus gambar...",
          description: "Sedang menghapus gambar variasi",
        });

        // Hapus semua gambar secara paralel
        await Promise.all(
          optionsWithImages.map((option) =>
            deleteCloudinaryImage(option.imageUrl)
          )
        );
      }
    }

    // Hapus variasi dari store
    removeVariation(index);

    toast({
      title: "Variasi dihapus",
      description: "Variasi produk berhasil dihapus",
    });
  };

  /**
   * Menambahkan variasi baru dan membuka formulirnya
   */
  const handleAddVariation = () => {
    if (hasVariations) {
      // Tambahkan variasi lain
      addVariation();
      // Buka form untuk variasi baru ini
      setVariationFormOpen(variations.length, true);
    } else {
      // Variasi pertama - mengubah dari produk sederhana ke produk dengan variasi
      setHasVariations(true);
      // Buka form untuk variasi pertama
      setVariationFormOpen(0, true);
    }
  };

  // Regenerasi varian harga setiap kali variasi berubah
  useEffect(() => {
    // Hanya generate jika ada variasi tersimpan (tidak dalam mode edit)
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
        {/* Keadaan awal: Tombol tambah variasi di atas harga dasar dan stok */}
        {!hasVariations && (
          <>
            {/* Tombol di bagian atas untuk keadaan awal */}
            <div className="flex items-center justify-center mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddVariation}
                className="flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <Plus className="h-4 w-4" />
                <span>Tambahkan Variasi Produk</span>
              </Button>
            </div>

            {/* Harga Dasar dan Stok */}
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

        {/* Bagian Variasi */}
        {hasVariations && (
          <div className="space-y-4">
            {/* Mapping variasi */}
            {variations.map((variation, index) => (
              <div key={index}>
                {/* Tampilkan form atau preview */}
                {openVariationForms.includes(index) ? (
                  <VariationForm
                    variation={variation}
                    variationIndex={index}
                    canHaveImages={index === 0}
                    onSave={() => {
                      setVariationFormOpen(index, false);
                    }}
                    onCancel={() => {
                      if (
                        variations.length === 1 &&
                        index === 0 &&
                        !variation.name
                      ) {
                        // Jika ini adalah variasi pertama yang baru ditambahkan dan belum ada nama
                        setHasVariations(false);
                      }
                      setVariationFormOpen(index, false);
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

            {/* Tombol tambah variasi DI BAWAH variasi - terbatas pada 2 variasi */}
            {variations.length < 2 && (
              <div className="flex justify-center mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddVariation}
                  className="w-full sm:w-auto flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Variasi Lainnya</span>
                </Button>
              </div>
            )}

            {/* Bagian Varian Harga - hanya tampilkan ketika variasi disimpan */}
            {variations.length > 0 && !isAnyFormOpen && (
              <div className="mt-6 sm:mt-8 pt-4 border-t">
                <PriceVariantSection />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductVariationSection;
