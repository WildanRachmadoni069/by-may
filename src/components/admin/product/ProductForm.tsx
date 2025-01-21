"use client";

import { useState } from "react";
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
import VariationDialog from "./VariationDialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ProductFormValues {
  name: string;
  description: string;
  category: string;
  specialLabel: string;
  mainImage: string | null;
  additionalImages: (string | null)[];
  hasVariations: boolean;
  basePrice?: number;
  baseStock?: number;
  variations: {
    id: string;
    name: string;
    options: {
      id: string;
      name: string;
      imageBase64?: string;
    }[];
  }[];
  variationPrices: Record<string, { price: number; stock: number }>;
  weight: number;
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
}

const SPECIAL_LABELS = [
  { label: "Populer", value: "popular" },
  { label: "Baru", value: "new" },
  { label: "Paling Laku", value: "best-seller" },
  { label: "Favorit", value: "favorite" },
];

const CATEGORIES = [
  { label: "Al-Quran", value: "quran" },
  { label: "Sajadah", value: "prayer-rug" },
  { label: "Tasbih", value: "prayer-beads" },
  { label: "Hampers", value: "hampers" },
];

const ProductSchema = Yup.object().shape({
  name: Yup.string().required("Nama produk wajib diisi"),
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
});

const initialValues: ProductFormValues = {
  name: "",
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
};

export function ProductForm() {
  const [isVariationDialogOpen, setIsVariationDialogOpen] = useState(false);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState<
    number | null
  >(null);

  const formik = useFormik({
    initialValues,
    validationSchema: ProductSchema,
    onSubmit: async (values, actions) => {
      try {
        console.log(values);
        // Handle form submission here
        // For example:
        // await submitProductData(values);
        actions.setSubmitting(false);
      } catch (error) {
        console.error("Error submitting form:", error);
        actions.setSubmitting(false);
        actions.setStatus({
          submitError:
            "An error occurred while submitting the form. Please try again.",
        });
      }
    },
  });

  const handleAddVariation = (
    name: string,
    options: { id: string; name: string; imageBase64?: string }[]
  ) => {
    if (selectedVariationIndex !== null) {
      const newVariations = [...formik.values.variations];
      newVariations[selectedVariationIndex] = {
        id: formik.values.variations[selectedVariationIndex].id,
        name,
        options,
      };
      formik.setFieldValue("variations", newVariations);
    } else {
      formik.setFieldValue("variations", [
        ...formik.values.variations,
        { id: Date.now().toString(), name, options },
      ]);
    }
    setIsVariationDialogOpen(false);
    setSelectedVariationIndex(null);
  };

  const handleRemoveVariation = (index: number) => {
    const newVariations = formik.values.variations.filter(
      (_, i) => i !== index
    );
    formik.setFieldValue("variations", newVariations);
  };

  const generateVariationCombinations = (
    variations: ProductFormValues["variations"]
  ) => {
    if (!variations.length) return [];

    const combinations = variations.reduce((acc, variation) => {
      if (!acc.length) {
        return variation.options.map((option) => ({
          id: `${variation.id}-${option.id}`,
          name: `${option.name}`,
          components: [{ variationId: variation.id, optionId: option.id }],
        }));
      }

      return acc.flatMap((item) =>
        variation.options.map((option) => ({
          id: `${item.id}-${option.id}`,
          name: `${item.name}-${option.name}`,
          components: [
            ...item.components,
            { variationId: variation.id, optionId: option.id },
          ],
        }))
      );
    }, [] as any[]);

    return combinations;
  };

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
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
          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              {...formik.getFieldProps("description")}
              rows={5}
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
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
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

      <Card>
        <CardHeader>
          <CardTitle>Foto Produk</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Detail Produk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasVariations"
              checked={formik.values.hasVariations}
              onCheckedChange={(checked) =>
                formik.setFieldValue("hasVariations", checked)
              }
            />
            <label
              htmlFor="hasVariations"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Produk ini memiliki variasi
            </label>
          </div>

          {formik.values.hasVariations ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {formik.values.variations.map((variation, index) => (
                  <div key={variation.id} className="flex items-center gap-2">
                    <Badge variant="secondary">{variation.name}</Badge>
                    <div className="flex-1">
                      {variation.options.map((option) => (
                        <Badge
                          key={option.id}
                          variant="outline"
                          className="mr-2"
                        >
                          {option.name}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedVariationIndex(index);
                        setIsVariationDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVariation(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (formik.values.variations.length >= 2) {
                    return;
                  }
                  setSelectedVariationIndex(null);
                  setIsVariationDialogOpen(true);
                }}
                disabled={formik.values.variations.length >= 2}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Variasi
              </Button>
              {formik.values.variations.length < 2 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Sisa variasi yang dapat ditambahkan:{" "}
                  {2 - formik.values.variations.length}
                </p>
              )}

              {formik.values.variations.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <Label>Daftar Variasi</Label>
                    <div className="space-y-2 mt-2">
                      {generateVariationCombinations(
                        formik.values.variations
                      ).map((combination) => (
                        <div
                          key={combination.id}
                          className="grid grid-cols-3 gap-4 items-center"
                        >
                          <div className="font-medium">{combination.name}</div>
                          <Input
                            type="number"
                            placeholder="Harga"
                            {...formik.getFieldProps(
                              `variationPrices.${combination.id}.price`
                            )}
                          />
                          <Input
                            type="number"
                            placeholder="Stok"
                            {...formik.getFieldProps(
                              `variationPrices.${combination.id}.stock`
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="basePrice">Harga</Label>
                <Input
                  id="basePrice"
                  type="number"
                  {...formik.getFieldProps("basePrice")}
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
                  {...formik.getFieldProps("baseStock")}
                />
                {formik.touched.baseStock && formik.errors.baseStock && (
                  <div className="text-red-500">{formik.errors.baseStock}</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pengiriman</CardTitle>
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

      <div className="flex justify-end">
        <Button type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? "Menyimpan..." : "Simpan Produk"}
        </Button>
      </div>

      <VariationDialog
        open={isVariationDialogOpen}
        onClose={() => {
          setIsVariationDialogOpen(false);
          setSelectedVariationIndex(null);
        }}
        onSave={handleAddVariation}
        allowImages={
          selectedVariationIndex === 0 ||
          (selectedVariationIndex === null &&
            formik.values.variations.length === 0)
        }
        initialData={
          selectedVariationIndex !== null
            ? formik.values.variations[selectedVariationIndex]
            : undefined
        }
      />
      {formik.status && formik.status.submitError && (
        <div className="text-red-500 mt-4">{formik.status.submitError}</div>
      )}
    </form>
  );
}
