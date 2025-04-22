"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUploadPreview from "./ImageUploadPreview";
import { Plus, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ProductFormValues, ProductVariation } from "@/types/product";
import { SPECIAL_LABELS } from "@/constants/product";
import { VariationCard } from "./VariationCard";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useProductStore } from "@/store/useProductStore";
import CharacterCountSEO from "@/components/seo/CharacterCountSEO";
import LabelWithTooltip from "@/components/general/LabelWithTooltip";
import GoogleSearchPreview from "@/components/general/GoogleSearchPreview";
import { useCollectionStore } from "@/store/useCollectionStore";
import ProductDescriptionEditor from "@/components/editor/ProductDescriptionEditor";
// Remove Firebase import and replace with PostgreSQL API functions
import { createProduct, updateProduct } from "@/lib/api/products";

interface ProductFormProps {
  productSlug?: string;
  initialData?: ProductFormValues & { id: string };
}

const ProductSchema = Yup.object().shape({
  name: Yup.string().required("Nama produk wajib diisi"),
  slug: Yup.string().required("Slug wajib diisi"),
  description: Yup.string().required("Deskripsi produk wajib diisi"),
  category: Yup.string().required("Kategori wajib dipilih"),
  specialLabel: Yup.string(),
  featuredImage: Yup.string().nullable(), // Changed from mainImage to featuredImage
  additionalImages: Yup.array().of(Yup.string().nullable()),
  hasVariations: Yup.boolean(),
  basePrice: Yup.number().when("hasVariations", (hasVariations, schema) =>
    hasVariations
      ? schema
      : schema.required("Harga wajib diisi").positive("Harga harus positif")
  ),
  baseStock: Yup.number().when("hasVariations", (hasVariations, schema) =>
    hasVariations
      ? schema
      : schema.required("Stok wajib diisi").min(0, "Stok tidak boleh negatif")
  ),
  variations: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Nama variasi wajib diisi"),
      options: Yup.array()
        .of(
          Yup.object().shape({
            name: Yup.string().required("Nama opsi wajib diisi"),
          })
        )
        .min(1, "Minimal satu opsi harus diisi"),
    })
  ),
  variationPrices: Yup.object(),
  weight: Yup.number()
    .required("Berat produk wajib diisi")
    .positive("Berat harus positif"),
  dimensions: Yup.object().shape({
    width: Yup.number()
      .required("Lebar wajib diisi")
      .positive("Lebar harus positif"),
    length: Yup.number()
      .required("Panjang wajib diisi")
      .positive("Panjang harus positif"),
    height: Yup.number()
      .required("Tinggi wajib diisi")
      .positive("Tinggi harus positif"),
  }),
  meta: Yup.object().shape({
    // Changed from seo to meta
    title: Yup.string().required("Meta title wajib diisi"),
    description: Yup.string().required("Meta description wajib diisi"),
    keywords: Yup.array().of(Yup.string()),
  }),
  collection: Yup.string(),
});

const initialValues: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  category: "",
  specialLabel: "",
  featuredImage: null, // Changed from mainImage to featuredImage
  additionalImages: Array(8).fill(null),
  hasVariations: false,
  basePrice: undefined,
  baseStock: undefined,
  variations: [],
  variationPrices: {},
  weight: 0,
  dimensions: { width: 0, length: 0, height: 0 },
  meta: {
    // Changed from seo to meta
    title: "",
    description: "",
    keywords: [],
  },
  collection: "none",
};

export function ProductForm({ productSlug, initialData }: ProductFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const {
    categories,
    loading: categoriesLoading,
    fetchCategories,
  } = useCategoryStore();

  const { collections, fetchCollections } = useCollectionStore();

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
    fetchCollections();
  }, [fetchCategories, fetchCollections]);

  const [showVariationForm, setShowVariationForm] = useState(false);
  const [editingVariationIndex, setEditingVariationIndex] = useState<
    number | null
  >(null);
  const [newVariation, setNewVariation] = useState<{
    name: string;
    options: { id: string; name: string; imageUrl?: string }[];
  }>({
    name: "",
    options: [{ id: Date.now().toString(), name: "" }],
  });

  // State to track submission status
  const [submitting, setSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: initialData || initialValues,
    validationSchema: ProductSchema,
    enableReinitialize: true,
    onSubmit: async (values, actions) => {
      try {
        setSubmitting(true);

        // Prepare data for API submission
        const productData = {
          ...values,
          // No need for any name conversion since we standardized field names
        };

        let result;
        if (productSlug) {
          // Make sure we have a valid ID before updating
          if (!initialData?.id) {
            throw new Error("Product ID is required for updates");
          }

          // Use updateProduct from API with slug
          result = await updateProduct(productSlug, {
            ...productData,
            id: initialData.id, // Keep ID for backend reference but send as part of data
          });
          toast({
            title: "Produk berhasil diperbarui",
            description: "Perubahan telah disimpan",
          });

          // Redirect to product listing page after successful update
          router.push("/dashboard/admin/product");
        } else {
          // Use createProduct from API for new products
          result = await createProduct(productData);
          toast({
            title: "Produk berhasil ditambahkan",
            description: "Produk baru telah disimpan",
          });

          // Redirect to product listing page after successful creation
          router.push("/dashboard/admin/product");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast({
          variant: "destructive",
          title: "Gagal menyimpan produk",
          description: `Terjadi kesalahan: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        });
      } finally {
        setSubmitting(false);
        actions.setSubmitting(false);
      }
    },
  });

  // Add useEffect to generate slug whenever name changes
  useEffect(() => {
    if (formik.values.name) {
      const generatedSlug = formik.values.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      formik.setFieldValue("slug", generatedSlug);
    }
  }, [formik.values.name]);

  // Functions for managing variations
  const handleAddOption = () => {
    setNewVariation((prev) => ({
      ...prev,
      options: [...prev.options, { id: Date.now().toString(), name: "" }],
    }));
  };

  const handleRemoveOption = (index: number) => {
    setNewVariation((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleEditVariation = (index: number) => {
    const variation = formik.values.variations[index];
    setNewVariation({
      name: variation.name,
      options: variation.options.map((opt) => ({
        ...opt,
        imageUrl: opt.imageUrl === null ? undefined : opt.imageUrl,
      })),
    });
    setEditingVariationIndex(index);
    setShowVariationForm(true);
  };

  const generateVariationCombinations = (
    variations: ProductFormValues["variations"]
  ) => {
    if (!variations.length) return [];

    const combinations = variations.reduce((acc, variation, currentIndex) => {
      // For first variation
      if (currentIndex === 0) {
        return variation.options.map((option) => ({
          id: `${variation.id}-${option.id}`,
          name: `${option.name}`,
          components: [{ variationId: variation.id, optionId: option.id }],
        }));
      }

      // For subsequent variations, combine with existing combinations
      const newCombinations = [];
      for (const existingComb of acc) {
        for (const option of variation.options) {
          newCombinations.push({
            id: `${existingComb.id}-${option.id}`,
            name: `${existingComb.name} + ${option.name}`,
            components: [
              ...existingComb.components,
              { variationId: variation.id, optionId: option.id },
            ],
          });
        }
      }
      return newCombinations;
    }, [] as Array<{ id: string; name: string; components: Array<{ variationId: string; optionId: string }> }>);

    return combinations;
  };

  const handleSaveVariation = () => {
    if (!newVariation.name || newVariation.options.some((opt) => !opt.name)) {
      return;
    }

    if (editingVariationIndex !== null) {
      // Editing existing variation
      const updatedVariations = [...formik.values.variations];
      updatedVariations[editingVariationIndex] = {
        id: formik.values.variations[editingVariationIndex].id,
        ...newVariation,
      };
      formik.setFieldValue("variations", updatedVariations);

      // Recalculate variation prices with clean combinations
      const combinations = generateVariationCombinations(updatedVariations);
      const newVariationPrices: Record<
        string,
        { price: number; stock: number }
      > = {};

      // Preserve existing prices and stocks for combinations that still exist
      combinations.forEach((combination) => {
        if (formik.values.variationPrices[combination.id]) {
          newVariationPrices[combination.id] =
            formik.values.variationPrices[combination.id];
        } else {
          newVariationPrices[combination.id] = { price: 0, stock: 0 };
        }
      });

      formik.setFieldValue("variationPrices", newVariationPrices);
    } else {
      // Adding new variation
      const newVariationData = { id: Date.now().toString(), ...newVariation };
      const updatedVariations = [...formik.values.variations, newVariationData];
      formik.setFieldValue("variations", updatedVariations);
      formik.setFieldValue("hasVariations", true);

      // Generate clean combinations for the new variation structure
      const combinations = generateVariationCombinations(updatedVariations);
      const newVariationPrices: Record<
        string,
        { price: number; stock: number }
      > = {};

      combinations.forEach((combination) => {
        if (formik.values.variationPrices[combination.id]) {
          newVariationPrices[combination.id] =
            formik.values.variationPrices[combination.id];
        } else {
          newVariationPrices[combination.id] = { price: 0, stock: 0 };
        }
      });

      formik.setFieldValue("variationPrices", newVariationPrices);
    }

    // Reset form
    setNewVariation({
      name: "",
      options: [{ id: Date.now().toString(), name: "" }],
    });
    setShowVariationForm(false);
    setEditingVariationIndex(null);
  };

  const handleRemoveVariation = (index: number) => {
    const newVariations = formik.values.variations.filter(
      (_, i) => i !== index
    );
    formik.setFieldValue("variations", newVariations);
  };

  // Add helper function to get variation price/stock
  const getVariationValue = (
    combinationId: string,
    field: "price" | "stock"
  ) => {
    const value = formik.values.variationPrices[combinationId]?.[field];
    return value === 0 ? "" : value || "";
  };

  // Add helper function for base price/stock
  const getBaseValue = (field: "basePrice" | "baseStock") => {
    const value = formik.values[field];
    return value === 0 ? "" : value || "";
  };

  // Render functions
  const renderVariationsList = () => (
    <div className="space-y-4">
      {formik.values.variations.map((variation, index) => (
        <VariationCard
          key={variation.id}
          variation={variation}
          index={index}
          onEdit={() => handleEditVariation(index)}
          onRemove={() => handleRemoveVariation(index)}
          disabled={showVariationForm}
        />
      ))}
    </div>
  );

  const renderVariationForm = () => {
    const isFirstVariation = formik.values.variations.length === 0;
    const showImageUpload =
      isFirstVariation ||
      (editingVariationIndex !== null && editingVariationIndex === 0);

    return (
      <div className="space-y-4 border p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <Label>
            {editingVariationIndex !== null ? "Edit Variasi" : "Nama Variasi"}
          </Label>
          {/* Only show close button when adding new variation, not when editing */}
          {editingVariationIndex === null && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowVariationForm(false);
                setNewVariation({
                  name: "",
                  options: [{ id: Date.now().toString(), name: "" }],
                });
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Input
          value={newVariation.name}
          onChange={(e) =>
            setNewVariation((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
          placeholder="Contoh: Ukuran, Warna"
        />

        <div className="space-y-2">
          <Label>Opsi Variasi</Label>
          {newVariation.options.map((option, index) => (
            <div key={option.id} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={option.name}
                  onChange={(e) => {
                    const newOptions = [...newVariation.options];
                    newOptions[index].name = e.target.value;
                    setNewVariation((prev) => ({
                      ...prev,
                      options: newOptions,
                    }));
                  }}
                  placeholder="Nama opsi"
                />
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Add image upload for first variation options */}
              {showImageUpload && (
                <div className="ml-0">
                  <Label className="text-sm">Foto Opsi</Label>
                  <ImageUploadPreview
                    value={option.imageUrl}
                    onChange={(url) => {
                      const newOptions = [...newVariation.options];
                      newOptions[index] = {
                        ...newOptions[index],
                        imageUrl: url || undefined,
                      };
                      setNewVariation((prev) => ({
                        ...prev,
                        options: newOptions,
                      }));
                    }}
                    className="max-w-[100px]"
                    id={`option-image-${option.id}`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleAddOption}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Opsi
          </Button>
          <Button type="button" onClick={handleSaveVariation}>
            {editingVariationIndex !== null
              ? "Update Variasi"
              : "Simpan Variasi"}
          </Button>
        </div>
      </div>
    );
  };

  const renderNoVariationsFields = () => (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-medium">Harga dan Stok Produk</Label>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="basePrice">Harga</Label>
          <Input
            id="basePrice"
            type="number"
            value={getBaseValue("basePrice")}
            onChange={(e) => {
              const value = e.target.value;
              formik.setFieldValue(
                "basePrice",
                value === "" ? 0 : Number(value)
              );
            }}
          />
          {formik.touched.basePrice && formik.errors.basePrice && (
            <div className="text-red-500">{formik.errors.basePrice}</div>
          )}
        </div>
        <div>
          <Label htmlFor="baseStock">Stok</Label>
          <Input
            id="baseStock"
            type="number"
            value={getBaseValue("baseStock")}
            onChange={(e) => {
              const value = e.target.value;
              formik.setFieldValue(
                "baseStock",
                value === "" ? 0 : Number(value)
              );
            }}
          />
          {formik.touched.baseStock && formik.errors.baseStock && (
            <div className="text-red-500">{formik.errors.baseStock}</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Informasi Utama */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Informasi Utama</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nama Produk</Label>
            <Input id="name" {...formik.getFieldProps("name")} />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-500">{formik.errors.name}</div>
            )}
          </div>

          {/* Add hidden slug input */}
          <Input
            type="hidden"
            id="slug"
            {...formik.getFieldProps("slug")}
            readOnly
          />

          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <ProductDescriptionEditor
              value={formik.values.description}
              onChange={(value) => formik.setFieldValue("description", value)}
            />
            {formik.touched.description && formik.errors.description && (
              <div className="text-red-500">{formik.errors.description}</div>
            )}
          </div>
          <div>
            <Label>Kategori</Label>
            <Select
              value={formik.values.category}
              onValueChange={(value) => formik.setFieldValue("category", value)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    categoriesLoading ? "Memuat..." : "Pilih kategori"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.category && formik.errors.category && (
              <div className="text-red-500">{formik.errors.category}</div>
            )}
          </div>
          <div>
            <Label>Koleksi (Opsional)</Label>
            <Select
              value={formik.values.collection || "none"} // Ensure we always have a valid value
              onValueChange={(value) =>
                formik.setFieldValue(
                  "collection",
                  value === "none" ? undefined : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih koleksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak ada koleksi</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection.value} value={collection.value}>
                    {collection.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Label Produk Spesial</Label>
            <RadioGroup
              value={formik.values.specialLabel}
              onValueChange={(value) =>
                formik.setFieldValue("specialLabel", value)
              }
              className="mt-2"
            >
              {SPECIAL_LABELS.map((label) => (
                <div key={label.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={label.value} id={label.value} />
                  <Label htmlFor={label.value}>{label.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Foto Produk */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Foto Produk</CardTitle>
          <p className="text-sm text-muted-foreground">
            Foto pertama akan menjadi foto utama. Seret untuk mengatur ulang.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Foto Utama</Label>
            <ImageUploadPreview
              value={formik.values.featuredImage} // Changed from mainImage to featuredImage
              onChange={(url) => formik.setFieldValue("featuredImage", url)} // Changed from mainImage to featuredImage
              className="max-w-[200px]"
              id="featured-image" // Changed from main-image to featured-image
            />
          </div>
          <div>
            <Label>Foto Tambahan</Label>
            <div className="grid grid-cols-4 gap-4 mt-2">
              {formik.values.additionalImages.map((_, index) => (
                <ImageUploadPreview
                  key={index}
                  value={formik.values.additionalImages[index]}
                  onChange={(url) => {
                    const newImages = [...formik.values.additionalImages];
                    newImages[index] = url;
                    formik.setFieldValue("additionalImages", newImages);
                  }}
                  id={`additional-image-${index}`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Produk */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Detail Produk</CardTitle>
          <p className="text-sm text-muted-foreground">
            Atur harga, stok, dan variasi produk Anda.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {formik.values.variations.length === 0 && !showVariationForm && (
              <>
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">
                    Belum ada variasi produk
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tambahkan variasi untuk produk dengan beberapa pilihan
                  </p>
                  <Button
                    type="button"
                    onClick={() => setShowVariationForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Variasi
                  </Button>
                </div>
                {renderNoVariationsFields()}
              </>
            )}

            {formik.values.variations.length > 0 && (
              <div className="space-y-6">
                {renderVariationsList()}

                {formik.values.variations.length === 1 &&
                  !showVariationForm && (
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowVariationForm(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Variasi Kedua
                      </Button>
                    </div>
                  )}

                {showVariationForm && renderVariationForm()}

                <div className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-medium">
                      Harga dan Stok Variasi
                    </Label>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    {generateVariationCombinations(
                      formik.values.variations
                    ).map((combination) => (
                      <div
                        key={combination.id}
                        className="grid grid-cols-3 gap-4 items-center"
                      >
                        <div className="text-sm">{combination.name}</div>
                        <Input
                          type="number"
                          placeholder="Harga"
                          value={getVariationValue(combination.id, "price")}
                          onChange={(e) => {
                            const value = e.target.value;
                            formik.setFieldValue(
                              `variationPrices.${combination.id}`,
                              {
                                ...formik.values.variationPrices[
                                  combination.id
                                ],
                                price: value === "" ? 0 : Number(value),
                              }
                            );
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Stok"
                          value={getVariationValue(combination.id, "stock")}
                          onChange={(e) => {
                            const value = e.target.value;
                            formik.setFieldValue(
                              `variationPrices.${combination.id}`,
                              {
                                ...formik.values.variationPrices[
                                  combination.id
                                ],
                                stock: value === "" ? 0 : Number(value),
                              }
                            );
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {formik.values.variations.length === 0 &&
              showVariationForm &&
              renderVariationForm()}
          </div>
        </CardContent>
      </Card>

      {/* Pengiriman */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Informasi Pengiriman</CardTitle>
          <p className="text-sm text-muted-foreground">
            Masukkan berat dan dimensi untuk kalkulasi ongkos kirim.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="weight">Berat (gram)</Label>
            <Input
              id="weight"
              type="number"
              {...formik.getFieldProps("weight")}
            />
            {formik.touched.weight && formik.errors.weight && (
              <div className="text-red-500">{formik.errors.weight}</div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dimensions.width">Lebar (cm)</Label>
              <Input
                id="dimensions.width"
                type="number"
                {...formik.getFieldProps("dimensions.width")}
              />
              {formik.touched.dimensions?.width &&
                formik.errors.dimensions?.width && (
                  <div className="text-red-500">
                    {formik.errors.dimensions.width}
                  </div>
                )}
            </div>
            <div>
              <Label htmlFor="dimensions.length">Panjang (cm)</Label>
              <Input
                id="dimensions.length"
                type="number"
                {...formik.getFieldProps("dimensions.length")}
              />
              {formik.touched.dimensions?.length &&
                formik.errors.dimensions?.length && (
                  <div className="text-red-500">
                    {formik.errors.dimensions.length}
                  </div>
                )}
            </div>
            <div>
              <Label htmlFor="dimensions.height">Tinggi (cm)</Label>
              <Input
                id="dimensions.height"
                type="number"
                {...formik.getFieldProps("dimensions.height")}
              />
              {formik.touched.dimensions?.height &&
                formik.errors.dimensions?.height && (
                  <div className="text-red-500">
                    {formik.errors.dimensions.height}
                  </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO & Meta */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>SEO & Meta</CardTitle>
          <p className="text-sm text-muted-foreground">
            Optimasi produk Anda untuk mesin pencari
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <LabelWithTooltip
                htmlFor="meta.title" // Changed from seo.title to meta.title
                label="Meta Title"
                tooltip="Judul yang muncul di hasil pencarian Google. Idealnya 50-60 karakter."
              />
              <Input id="meta.title" {...formik.getFieldProps("meta.title")} />{" "}
              {/* Changed from seo.title to meta.title */}
              <CharacterCountSEO
                current={formik.values.meta.title.length} // Changed from seo.title to meta.title
                type="title"
              />
              {formik.touched.meta?.title &&
                formik.errors.meta?.title && ( // Changed from seo to meta
                  <div className="text-red-500">{formik.errors.meta.title}</div>
                )}
            </div>

            <div className="space-y-2">
              <LabelWithTooltip
                htmlFor="meta.description" // Changed from seo.description to meta.description
                label="Meta Description"
                tooltip="Deskripsi singkat yang muncul di hasil pencarian. Idealnya 120-160 karakter."
              />
              <Textarea
                id="meta.description" // Changed from seo.description to meta.description
                {...formik.getFieldProps("meta.description")}
              />
              <CharacterCountSEO
                current={formik.values.meta.description.length} // Changed from seo.description to meta.description
                type="description"
              />
              {formik.touched.meta?.description && // Changed from seo to meta
                formik.errors.meta?.description && (
                  <div className="text-red-500">
                    {formik.errors.meta.description}
                  </div>
                )}
            </div>

            <div className="border rounded-lg p-4 bg-white space-y-2">
              <h4 className="text-sm font-medium text-gray-500">
                Pratinjau Hasil Pencarian Google
              </h4>
              <GoogleSearchPreview
                title={formik.values.meta.title || formik.values.name} // Changed from seo.title to meta.title
                description={formik.values.meta.description} // Changed from seo.description to meta.description
                slug={`products/${formik.values.name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sticky Submit Button */}
      <div className="sticky bottom-4 left-0 right-0 py-4 bg-background border-t z-10">
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/admin/product")}
          >
            Batal
          </Button>
          <Button type="submit" disabled={submitting || formik.isSubmitting}>
            {submitting || formik.isSubmitting
              ? "Menyimpan..."
              : productSlug
              ? "Perbarui Produk"
              : "Simpan Produk"}
          </Button>
        </div>
      </div>
    </form>
  );
}
