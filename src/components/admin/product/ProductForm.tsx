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
import {
  ProductFormValues,
  ProductOption,
  ProductVariation,
  VariationCombination,
  VariationFormData,
  VariationFormOption,
} from "@/types/product";
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
import { generateMeaningfulId } from "@/lib/utils";
import { VariationManager } from "./VariationManager";
import { PriceStockGrid } from "./PriceStockGrid";

interface ProductFormProps {
  productId?: string;
  initialData?: ProductFormValues & { id: string };
}

const ProductSchema = Yup.object().shape({
  name: Yup.string().required("Nama produk wajib diisi"),
  slug: Yup.string().required("Slug wajib diisi"),
  description: Yup.string().required("Deskripsi produk wajib diisi"),
  category: Yup.string().required("Kategori wajib dipilih"),
  specialLabel: Yup.string(),
  mainImage: Yup.string().nullable(),
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
  seo: Yup.object().shape({
    title: Yup.string().required("Meta title wajib diisi"),
    description: Yup.string().required("Meta description wajib diisi"),
    keywords: Yup.array().of(Yup.string()),
  }),
  collection: Yup.string(),
});

const initialValues: ProductFormValues = {
  name: "",
  nameSearch: "",
  slug: "", // Add initial value for slug
  description: "",
  category: "",
  specialLabel: "",
  mainImage: null,
  additionalImages: Array(8).fill(null),
  hasVariations: false,
  basePrice: undefined,
  baseStock: undefined,
  variations: [],
  variationPrices: {},
  weight: 0,
  dimensions: { width: 0, length: 0, height: 0 },
  seo: {
    title: "",
    description: "",
    keywords: [],
  },
  collection: "none", // Change default value from undefined/empty to "none"
};

export function ProductForm({ productId, initialData }: ProductFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const {
    categories,
    loading: categoriesLoading,
    fetchCategories,
  } = useCategoryStore();
  const { addProduct, editProduct } = useProductStore();
  const {
    collections,
    loading: collectionsLoading,
    fetchCollections,
  } = useCollectionStore();

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const [showVariationForm, setShowVariationForm] = useState(false);
  const [editingVariationIndex, setEditingVariationIndex] = useState<
    number | null
  >(null);
  const [newVariation, setNewVariation] = useState<VariationFormData>({
    name: "",
    options: [{ id: generateMeaningfulId("option"), name: "", imageUrl: null }],
  });

  const formik = useFormik({
    initialValues: initialData || initialValues,
    validationSchema: ProductSchema,
    enableReinitialize: true,
    onSubmit: async (values, actions) => {
      try {
        if (productId) {
          await editProduct(productId, values);
          toast({
            title: "Produk berhasil diperbarui",
            description: "Perubahan telah disimpan",
          });
        } else {
          await addProduct(values);
          toast({
            title: "Produk berhasil ditambahkan",
            description: "Produk baru telah disimpan",
          });
        }
        router.push("/dashboard/admin/product");
      } catch (error) {
        console.error("Error submitting form:", error);
        toast({
          variant: "destructive",
          title: "Gagal menyimpan produk",
          description: "Terjadi kesalahan. Silakan coba lagi.",
        });
      } finally {
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

  // Update the function when changing hasVariations state
  useEffect(() => {
    if (formik.values.hasVariations) {
      // When switching to variations mode, ensure basePrice/baseStock aren't used
      formik.setFieldValue("basePrice", 0);
      formik.setFieldValue("baseStock", 0);
    }
  }, [formik.values.hasVariations]);

  // Update the function to properly handle option types
  const handleAddOption = () => {
    setNewVariation((prev) => {
      // Determine if we need to add imageUrl property based on whether this is first variation
      const isFirstVariation =
        formik.values.variations.length === 0 ||
        (editingVariationIndex !== null && editingVariationIndex === 0);

      // Add imageUrl property only for first variation options
      const newOption: VariationFormOption = isFirstVariation
        ? { id: generateMeaningfulId("option"), name: "", imageUrl: null }
        : { id: generateMeaningfulId("option"), name: "" };

      return {
        ...prev,
        options: [...prev.options, newOption],
      };
    });
  };

  const handleRemoveOption = (index: number) => {
    setNewVariation((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  // Ensure proper typing in this function
  const handleEditVariation = (index: number) => {
    const variation = formik.values.variations[index];

    // Convert ProductOption[] to VariationFormOption[]
    const options: VariationFormOption[] = variation.options.map((option) => ({
      id: option.id,
      name: option.name,
      imageUrl: option.imageUrl,
    }));

    setNewVariation({
      name: variation.name,
      options,
    });

    setEditingVariationIndex(index);
    setShowVariationForm(true);
  };

  const generateVariationCombinations = (
    variations: ProductFormValues["variations"]
  ): VariationCombination[] => {
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
      const newCombinations: VariationCombination[] = [];
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
    }, [] as VariationCombination[]);

    return combinations;
  };

  // Type the local variables in the variation saving function
  const handleSaveVariation = () => {
    if (!newVariation.name || newVariation.options.some((opt) => !opt.name)) {
      return;
    }

    // Determine if this is first variation position (either new first or editing first)
    const isFirstVariation =
      formik.values.variations.length === 0 ||
      (editingVariationIndex !== null && editingVariationIndex === 0);

    // Process options to ensure proper imageUrl handling
    let processedOptions: ProductOption[] = [...newVariation.options].map(
      (option) => {
        if (isFirstVariation) {
          // First variation: ensure all options have imageUrl (converting null to undefined)
          return {
            id: option.id,
            name: option.name,
            imageUrl: option.imageUrl === null ? undefined : option.imageUrl, // Convert null to undefined
          };
        } else {
          // Second variation: omit imageUrl
          return {
            id: option.id,
            name: option.name,
          };
        }
      }
    );

    if (editingVariationIndex !== null) {
      // Editing existing variation
      const updatedVariations = [...formik.values.variations];
      updatedVariations[editingVariationIndex] = {
        id: formik.values.variations[editingVariationIndex].id,
        name: newVariation.name,
        options: processedOptions,
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
      // Adding new variation with a meaningful ID
      const variationId = generateMeaningfulId(`var-${newVariation.name}`);
      const newVariationData = {
        id: variationId,
        name: newVariation.name,
        options: processedOptions,
      };
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

    // Reset form with proper structure for next potential variation
    const resetOptions: VariationFormOption[] =
      formik.values.variations.length === 0
        ? [{ id: generateMeaningfulId("option"), name: "", imageUrl: null }]
        : [{ id: generateMeaningfulId("option"), name: "" }];

    setNewVariation({
      name: "",
      options: resetOptions,
    });
    setShowVariationForm(false);
    setEditingVariationIndex(null);
  };

  // Update this function to handle proper defaults when removing variations
  const handleRemoveVariation = (index: number) => {
    const newVariations = formik.values.variations.filter(
      (_, i) => i !== index
    );

    // If removing the last variation, reset to non-variation product
    if (newVariations.length === 0) {
      formik.setFieldValue("variations", []);
      formik.setFieldValue("hasVariations", false);

      // Set default price and stock if they were previously undefined
      if (formik.values.basePrice === undefined) {
        formik.setFieldValue("basePrice", 0);
      }
      if (formik.values.baseStock === undefined) {
        formik.setFieldValue("baseStock", 0);
      }
    } else {
      formik.setFieldValue("variations", newVariations);

      // Recalculate variations prices
      const combinations = generateVariationCombinations(newVariations);
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

  // Update the variations list JSX to include edit button
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

  // Fix the renderVariationForm function to restore all original functionality
  const renderVariationForm = () => {
    const isFirstVariation = formik.values.variations.length === 0;
    const showImageUpload =
      isFirstVariation ||
      (editingVariationIndex !== null && editingVariationIndex === 0);

    const handleCancelEdit = () => {
      setShowVariationForm(false);
      setEditingVariationIndex(null);
      // Reset form state
      const initialOption: VariationFormOption =
        formik.values.variations.length === 0
          ? { id: generateMeaningfulId("option"), name: "", imageUrl: null }
          : { id: generateMeaningfulId("option"), name: "" };

      setNewVariation({
        name: "",
        options: [initialOption],
      });
    };

    return (
      <div className="space-y-4 border p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <Label>
            {editingVariationIndex !== null ? "Edit Variasi" : "Nama Variasi"}
          </Label>
          {/* Show close button when adding, or cancel text when editing */}
          {editingVariationIndex === null ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
            >
              Batal
            </Button>
          )}
        </div>

        {/* Restore the variation name input field */}
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
          {/* Add cancel button at the bottom only when in edit mode */}
          {editingVariationIndex !== null && (
            <Button type="button" variant="outline" onClick={handleCancelEdit}>
              Batal
            </Button>
          )}
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

  // Update this function to properly initialize the newVariation state
  // Update setupVariationForm to use proper types
  const setupVariationForm = (isFirstVariation: boolean = false) => {
    const initialOption: VariationFormOption = isFirstVariation
      ? { id: generateMeaningfulId("option"), name: "", imageUrl: null }
      : { id: generateMeaningfulId("option"), name: "" };

    setNewVariation({
      name: "",
      options: [initialOption],
    });

    setShowVariationForm(true);
  };

  const renderVariationsSection = () => {
    return (
      <>
        <VariationManager
          variations={formik.values.variations}
          onAddVariation={(variation) => {
            const updatedVariations = [...formik.values.variations, variation];
            formik.setFieldValue("variations", updatedVariations);
            formik.setFieldValue("hasVariations", true);

            // Generate combinations and update prices when adding variation
            const combinations =
              generateVariationCombinations(updatedVariations);
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
          }}
          onUpdateVariation={(index, variation) => {
            const updatedVariations = [...formik.values.variations];
            updatedVariations[index] = variation;
            formik.setFieldValue("variations", updatedVariations);

            // Recalculate combinations and update prices
            const combinations =
              generateVariationCombinations(updatedVariations);
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
          }}
          onRemoveVariation={handleRemoveVariation}
          onGenerateCombinations={() => {
            // You could add additional logic here if needed
          }}
          disabled={formik.isSubmitting}
        />

        {/* Show price/stock grid if there are variations */}
        {formik.values.variations.length > 0 && (
          <div className="mt-6">
            <PriceStockGrid
              variations={formik.values.variations}
              combinations={generateVariationCombinations(
                formik.values.variations
              )}
              variationPrices={formik.values.variationPrices}
              onChange={(id, field, value) => {
                formik.setFieldValue(`variationPrices.${id}.${field}`, value);
              }}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {productId ? "Edit Produk" : "Tambah Produk Baru"}
        </h2>
        <p className="text-muted-foreground mt-2">
          {productId
            ? "Perbarui informasi produk Anda."
            : "Isi informasi produk dengan lengkap untuk menampilkan produk di toko Anda."}
        </p>
      </div>

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
                onValueChange={(value) =>
                  formik.setFieldValue("category", value)
                }
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
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
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
                  <SelectValue
                    placeholder={
                      collectionsLoading ? "Memuat..." : "Pilih koleksi"
                    }
                  />
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
                  <div
                    key={label.value}
                    className="flex items-center space-x-2"
                  >
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
                value={formik.values.mainImage}
                onChange={(url) => formik.setFieldValue("mainImage", url)}
                className="max-w-[200px]"
                id="main-image"
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
              {/* For products without variations */}
              {!formik.values.hasVariations &&
                formik.values.variations.length === 0 &&
                renderNoVariationsFields()}

              {/* Variations section - use new components */}
              {renderVariationsSection()}
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
                  htmlFor="seo.title"
                  label="Meta Title"
                  tooltip="Judul yang muncul di hasil pencarian Google. Idealnya 50-60 karakter."
                />
                <Input id="seo.title" {...formik.getFieldProps("seo.title")} />
                <CharacterCountSEO
                  current={formik.values.seo.title.length}
                  type="title"
                />
                {formik.touched.seo?.title && formik.errors.seo?.title && (
                  <div className="text-red-500">{formik.errors.seo.title}</div>
                )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="seo.description"
                  label="Meta Description"
                  tooltip="Deskripsi singkat yang muncul di hasil pencarian. Idealnya 120-160 karakter."
                />
                <Textarea
                  id="seo.description"
                  {...formik.getFieldProps("seo.description")}
                />
                <CharacterCountSEO
                  current={formik.values.seo.description.length}
                  type="description"
                />
                {formik.touched.seo?.description &&
                  formik.errors.seo?.description && (
                    <div className="text-red-500">
                      {formik.errors.seo.description}
                    </div>
                  )}
              </div>

              <div className="border rounded-lg p-4 bg-white space-y-2">
                <h4 className="text-sm font-medium text-gray-500">
                  Pratinjau Hasil Pencarian Google
                </h4>
                <GoogleSearchPreview
                  title={formik.values.seo.title || formik.values.name}
                  description={formik.values.seo.description}
                  slug={`products/${formik.values.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sticky Submit Button */}
        <div className="sticky bottom-0 left-0 right-0 py-4 bg-background border-t">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
            <div>
              {formik.status?.submitError && (
                <div className="text-red-500">{formik.status.submitError}</div>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push("/dashboard/admin/product")}
              >
                Batal
              </Button>
              <Button type="submit" size="lg" disabled={formik.isSubmitting}>
                {formik.isSubmitting
                  ? "Menyimpan..."
                  : productId
                  ? "Perbarui Produk"
                  : "Simpan Produk"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
