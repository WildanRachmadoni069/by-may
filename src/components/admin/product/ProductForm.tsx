"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LabelWithTooltip from "@/components/general/LabelWithTooltip";
import ImageUploadPreview from "@/components/admin/product/ImageUploadPreview";
import QuillEditor from "@/components/editor/QuillEditor";
import { SPECIAL_LABELS } from "@/constants/product";
import { slugify, createExcerptFromHtml } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Product, CreateProductInput, ProductVariation } from "@/types/product";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useCollectionStore } from "@/store/useCollectionStore";
import ProductVariationSection from "@/components/admin/product/ProductVariationSection";
import {
  PriceVariantItem,
  useProductVariationStore,
  Variation,
} from "@/store/useProductVariationStore";
import GoogleSearchPreview from "@/components/general/GoogleSearchPreview";
import CharacterCountSEO from "@/components/seo/CharacterCountSEO";
import { useRouter } from "next/navigation";
import { CloudinaryService } from "@/lib/services/cloudinary-service";
import { useSWRConfig } from "swr"; // Add SWR config

interface ProductFormProps {
  initialValues?: Partial<Product>;
  onSubmit: (values: CreateProductInput) => Promise<void>;
  isSubmitting?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting = false,
}) => {
  const { toast } = useToast();
  const [excerpt, setExcerpt] = useState<string>("");
  const quillRef = React.useRef<any>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isDeletingImages, setIsDeletingImages] = useState(false);
  const { mutate } = useSWRConfig(); // Get SWR's global mutate function

  // Get variation state from store
  const {
    hasVariations,
    importVariations,
    variations,
    resetVariations,
    priceVariants, // Make sure to get priceVariants from the store
  } = useProductVariationStore();

  // Fetch categories and collections
  const { categories, fetchCategories } = useCategoryStore();
  const { collections, fetchCollections } = useCollectionStore();

  // Load data
  useEffect(() => {
    fetchCategories();
    fetchCollections();
  }, [fetchCategories, fetchCollections]);

  // Initialize the variation store if we have initial values
  useEffect(() => {
    if (initialValues?.variations && initialValues.variations.length > 0) {
      // Convert from API model to store model
      const mappedVariations: Variation[] = initialValues.variations.map(
        (v) => ({
          id: v.id,
          name: v.name,
          options: v.options.map((o) => ({
            id: o.id,
            name: o.name,
            imageUrl: o.imageUrl,
          })),
        })
      );
      importVariations(mappedVariations);

      // Initialize price variants if they exist
      if (
        initialValues.priceVariants &&
        initialValues.priceVariants.length > 0
      ) {
        // Map the price variants to the format needed by the store
        const priceVariantsForStore: PriceVariantItem[] =
          initialValues.priceVariants.map((priceVariant) => {
            // Extract option combinations for this price variant
            const optionCombination = priceVariant.options.map(
              (opt) => opt.option.id
            );
            const optionLabels = priceVariant.options.map((opt) => {
              // Find the corresponding variation for this option
              const variation = initialValues.variations?.find((v) =>
                v.options.some((o) => o.id === opt.option.id)
              );
              const variationName = variation?.name || "";
              const optionName = opt.option.name;
              return `${variationName}: ${optionName}`;
            });

            return {
              id: priceVariant.id,
              optionCombination,
              optionLabels,
              price: priceVariant.price,
              stock: priceVariant.stock,
              sku: priceVariant.sku,
            };
          });

        // Import price variants into the store
        useProductVariationStore
          .getState()
          .importPriceVariants(priceVariantsForStore);
      }
    }
  }, [
    initialValues?.variations,
    initialValues?.priceVariants,
    importVariations,
  ]);

  const formSchema = Yup.object({
    name: Yup.string().required("Nama produk harus diisi"),
    slug: Yup.string().required("Slug harus diisi"),
    description: Yup.string().nullable(),
    featuredImage: Yup.object({
      url: Yup.string().required("URL gambar harus diisi"),
      alt: Yup.string().required("Alt text harus diisi"),
    }).nullable(),
    additionalImages: Yup.array().of(
      Yup.object({
        url: Yup.string().required("URL gambar harus diisi"),
        alt: Yup.string().required("Alt text harus diisi"),
      })
    ),
    basePrice: Yup.number().nullable().min(0, "Harga tidak boleh negatif"),
    baseStock: Yup.number()
      .nullable()
      .integer("Stok harus bilangan bulat")
      .min(0, "Stok tidak boleh negatif"),
    hasVariations: Yup.boolean().default(false),
    specialLabel: Yup.string().nullable(),
    weight: Yup.number().nullable().min(0, "Berat tidak boleh negatif"),
    dimensions: Yup.object({
      width: Yup.number().min(0, "Lebar tidak boleh negatif"),
      length: Yup.number().min(0, "Panjang tidak boleh negatif"),
      height: Yup.number().min(0, "Tinggi tidak boleh negatif"),
    }).nullable(),
    meta: Yup.object({
      title: Yup.string(),
      description: Yup.string(),
      ogImage: Yup.string(),
    }).nullable(),
    categoryId: Yup.string().nullable(),
    collectionId: Yup.string().nullable(),
  });

  const formik = useFormik<CreateProductInput>({
    initialValues: {
      name: initialValues?.name || "",
      slug: initialValues?.slug || "",
      description: initialValues?.description || "",
      featuredImage: initialValues?.featuredImage || null,
      additionalImages: initialValues?.additionalImages || [],
      basePrice: initialValues?.basePrice || null,
      baseStock: initialValues?.baseStock || null,
      hasVariations: initialValues?.hasVariations || false,
      specialLabel: initialValues?.specialLabel || "",
      weight: initialValues?.weight || null,
      dimensions: initialValues?.dimensions || null,
      meta: initialValues?.meta || null,
      categoryId: initialValues?.categoryId || null,
      collectionId: initialValues?.collectionId || null,
    },
    validationSchema: formSchema,
    onSubmit: async (values) => {
      try {
        // Pastikan semua data variasi valid dan memiliki format yang benar
        const processedVariations = variations.map((variation) => ({
          id: variation.id || undefined, // Gunakan undefined daripada null
          name: variation.name,
          options: variation.options.map((option) => ({
            id: option.id || undefined, // Gunakan undefined daripada null
            name: option.name,
            imageUrl: option.imageUrl,
          })),
        }));

        // Proses price variants agar tidak ada nilai yang null
        const processedPriceVariants = hasVariations
          ? priceVariants
              .filter((pv) => pv.price !== null && pv.stock !== null) // Jangan sertakan varian dengan nilai null
              .map((pv) => ({
                id: pv.id,
                optionCombination: pv.optionCombination,
                optionLabels: pv.optionLabels,
                price: pv.price || 0, // Gunakan 0 daripada null
                stock: pv.stock || 0, // Gunakan 0 daripada null
                sku: pv.sku || undefined, // Gunakan undefined daripada null
              }))
          : [];

        // Set the hasVariations value from the store before submitting
        const submissionValues = {
          ...values,
          hasVariations: hasVariations,
          // Include the variations from store with proper formatting
          variations: processedVariations,
          // Include the price variants from store if product has variations, with proper formatting
          priceVariants: processedPriceVariants,
        };

        await onSubmit(submissionValues);

        // Reset variation store after successful submission
        resetVariations();

        // Invalidate the products cache to ensure fresh data display
        mutate(
          (key: string) =>
            typeof key === "string" && key.startsWith("/api/products"),
          undefined,
          { revalidate: true }
        );

        toast({
          title: initialValues
            ? "Produk berhasil diperbarui"
            : "Produk berhasil ditambahkan",
          description: `Produk ${values.name} telah ${
            initialValues ? "diperbarui" : "ditambahkan"
          }`,
        });
      } catch (error) {
        console.error("Error submitting product form:", error);
        toast({
          variant: "destructive",
          title: "Gagal menyimpan produk",
          description:
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat menyimpan produk",
        });
      }
    },
  });

  // Get meta fields from initial values or set defaults
  const [metaTitle, setMetaTitle] = useState<string>(
    initialValues?.meta?.title || ""
  );
  const [metaDescription, setMetaDescription] = useState<string>(
    initialValues?.meta?.description || ""
  );

  // Track if user has manually edited the meta fields
  const [metaTitleManuallyEdited, setMetaTitleManuallyEdited] =
    useState<boolean>(!!initialValues?.meta?.title);
  const [metaDescriptionManuallyEdited, setMetaDescriptionManuallyEdited] =
    useState<boolean>(!!initialValues?.meta?.description);

  // Auto-generate slug when name changes
  useEffect(() => {
    if (formik.values.name && !initialValues?.slug) {
      const generatedSlug = slugify(formik.values.name);
      formik.setFieldValue("slug", generatedSlug);
    }
  }, [formik.values.name, initialValues?.slug]);

  // Auto-generate excerpt from description
  useEffect(() => {
    if (formik.values.description) {
      const newExcerpt = createExcerptFromHtml(formik.values.description);
      setExcerpt(newExcerpt);
    } else {
      setExcerpt("");
    }
  }, [formik.values.description]);

  // Auto-update meta title when product name changes (if not manually edited)
  useEffect(() => {
    if (formik.values.name && !metaTitleManuallyEdited) {
      setMetaTitle(formik.values.name);
      formik.setFieldValue("meta", {
        ...formik.values.meta,
        title: formik.values.name,
      });
    }
  }, [formik.values.name, metaTitleManuallyEdited]);

  // Auto-update meta description when excerpt changes (if not manually edited)
  useEffect(() => {
    if (excerpt && !metaDescriptionManuallyEdited) {
      setMetaDescription(excerpt);
      formik.setFieldValue("meta", {
        ...formik.values.meta,
        description: excerpt,
      });
    }
  }, [excerpt, metaDescriptionManuallyEdited]);

  // Set OG image from featured image (only if meta exists and no OG image already set)
  useEffect(() => {
    if (formik.values.featuredImage?.url) {
      formik.setFieldValue("meta", {
        ...formik.values.meta,
        ogImage: formik.values.meta?.ogImage || formik.values.featuredImage.url,
      });
    }
  }, [formik.values.featuredImage?.url]);

  // Handle featured image change
  const handleFeaturedImageChange = (imageUrl: string | null) => {
    if (imageUrl) {
      formik.setFieldValue("featuredImage", {
        url: imageUrl,
        alt: formik.values.name || "Product Image",
      });
    } else {
      formik.setFieldValue("featuredImage", null);
    }
  };

  // Handle additional image change
  const handleAdditionalImageChange = (
    index: number,
    imageUrl: string | null
  ) => {
    const additionalImages = [...(formik.values.additionalImages || [])];

    if (imageUrl) {
      // Add or update image
      if (index < additionalImages.length) {
        additionalImages[index] = {
          url: imageUrl,
          alt: `${formik.values.name || "Product"} ${index + 1}`,
        };
      } else {
        additionalImages.push({
          url: imageUrl,
          alt: `${formik.values.name || "Product"} ${
            additionalImages.length + 1
          }`,
        });
      }
    } else {
      // Remove image
      if (index < additionalImages.length) {
        additionalImages.splice(index, 1);
      }
    }

    formik.setFieldValue("additionalImages", additionalImages);
  };

  // Handle special label selection
  const handleSpecialLabelChange = (value: string) => {
    // Use null for the "none" option, otherwise use the selected value
    formik.setFieldValue("specialLabel", value === "none" ? null : value);
  };

  // Handle category selection with proper null handling
  const handleCategoryChange = (value: string) => {
    formik.setFieldValue("categoryId", value === "none" ? null : value);
  };

  // Handle collection selection with proper null handling
  const handleCollectionChange = (value: string) => {
    formik.setFieldValue("collectionId", value === "none" ? null : value);
  };

  // Handle meta title change
  const handleMetaTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMetaTitle(value);
    setMetaTitleManuallyEdited(true);
    formik.setFieldValue("meta", {
      ...formik.values.meta,
      title: value,
    });
  };

  // Handle meta description change
  const handleMetaDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setMetaDescription(value);
    setMetaDescriptionManuallyEdited(true);
    formik.setFieldValue("meta", {
      ...formik.values.meta,
      description: value,
    });
  };

  const router = useRouter();

  /**
   * Fungsi untuk menghapus gambar dari Cloudinary
   * @param url URL gambar yang akan dihapus
   */
  const deleteCloudinaryImage = async (url: string): Promise<boolean> => {
    try {
      await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      return true;
    } catch (error) {
      console.error("Error deleting image:", error);
      return false;
    }
  };

  /**
   * Mengidentifikasi apakah URL adalah gambar yang baru saja diupload
   * @param url URL gambar
   * @param initialUrl URL gambar awal (jika ada)
   * @returns boolean - true jika gambar baru ditambahkan dan perlu dibersihkan
   */
  const isNewlyUploadedImage = (
    url: string | undefined,
    initialUrl: string | undefined
  ): boolean => {
    // Jika tidak ada URL, tidak perlu dibersihkan
    if (!url) return false;

    // Jika URL-nya sama dengan yang awal, tidak perlu dibersihkan
    if (initialUrl === url) return false;

    // Jika ada URL tapi tidak ada URL awal, ini adalah gambar baru
    return true;
  };

  /**
   * Membersihkan semua gambar yang diupload dalam formulir
   */
  const cleanupAllUploadedImages = async () => {
    if (!formik.dirty) return;

    setIsDeletingImages(true);
    const imagesToDelete: string[] = [];

    try {
      // 1. Periksa gambar utama
      if (
        formik.values.featuredImage?.url &&
        isNewlyUploadedImage(
          formik.values.featuredImage.url,
          initialValues?.featuredImage?.url
        )
      ) {
        imagesToDelete.push(formik.values.featuredImage.url);
      }

      // 2. Periksa gambar tambahan
      formik.values.additionalImages?.forEach((img, index) => {
        const initialImageUrl = initialValues?.additionalImages?.[index]?.url;
        if (img.url && isNewlyUploadedImage(img.url, initialImageUrl)) {
          imagesToDelete.push(img.url);
        }
      });

      // 3. Periksa gambar opsi variasi (hanya variasi pertama yang bisa memiliki gambar)
      const variationsFromStore = variations;

      if (variationsFromStore && variationsFromStore.length > 0) {
        const firstVariation = variationsFromStore[0];

        // Periksa apakah ada opsi dengan gambar
        if (firstVariation?.options) {
          firstVariation.options.forEach((option) => {
            if (!option.imageUrl) return;

            // Periksa apakah ini gambar baru yang perlu dihapus
            const isNewImage = !initialValues?.variations?.[0]?.options.some(
              (initialOption) => initialOption.imageUrl === option.imageUrl
            );

            if (isNewImage) {
              imagesToDelete.push(option.imageUrl);
            }
          });
        }
      }

      // Hapus semua gambar secara paralel
      if (imagesToDelete.length > 0) {
        toast({
          title: "Menghapus gambar",
          description: "Sedang membersihkan gambar yang telah diupload...",
        });

        await Promise.all(
          imagesToDelete.map((url) => deleteCloudinaryImage(url))
        );

        toast({
          title: "Pembersihan selesai",
          description: `${imagesToDelete.length} gambar berhasil dihapus`,
        });
      }
    } catch (error) {
      console.error("Error cleaning up images:", error);
      toast({
        variant: "destructive",
        title: "Gagal membersihkan gambar",
        description: "Beberapa gambar mungkin tidak berhasil dihapus",
      });
    } finally {
      setIsDeletingImages(false);

      // Reset variation store before navigating away
      resetVariations();

      // Invalidate cache before navigating away to ensure fresh data
      mutate(
        (key: string) =>
          typeof key === "string" && key.startsWith("/api/products"),
        undefined,
        { revalidate: true }
      );

      router.push("/dashboard/admin/product");
    }
  };

  // Replace window.confirm with Dialog component
  const handleCancel = () => {
    // If we have unsaved changes, show a confirmation dialog
    if (formik.dirty) {
      setConfirmDialogOpen(true);
    } else {
      // Reset variation store and navigate back if no changes
      resetVariations();
      router.push("/dashboard/admin/product");
    }
  };

  // Function to confirm navigation after dialog confirmation
  const handleConfirmNavigation = async () => {
    setConfirmDialogOpen(false);
    await cleanupAllUploadedImages();
  };

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        className="space-y-6 sm:space-y-8 pb-24"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Product Image */}
              <div>
                <LabelWithTooltip
                  htmlFor="featuredImage"
                  label="Gambar Utama"
                  tooltip="Gambar utama yang akan ditampilkan pada halaman produk dan daftar produk"
                />
                <div className="mt-2">
                  <ImageUploadPreview
                    id="featuredImage"
                    value={formik.values.featuredImage?.url || null}
                    onChange={handleFeaturedImageChange}
                    className="w-full aspect-square"
                  />
                </div>
                {formik.touched.featuredImage &&
                  formik.errors.featuredImage && (
                    <p className="text-sm text-destructive mt-2">
                      {typeof formik.errors.featuredImage === "string"
                        ? formik.errors.featuredImage
                        : "Gambar utama diperlukan"}
                    </p>
                  )}
              </div>

              {/* Basic Info */}
              <div className="md:col-span-2 space-y-3 sm:space-y-4 mt-4 md:mt-0">
                {/* Product Name */}
                <div className="space-y-2">
                  <LabelWithTooltip
                    htmlFor="name"
                    label="Nama Produk"
                    tooltip="Nama produk yang akan ditampilkan"
                  />
                  <Input
                    id="name"
                    name="name"
                    placeholder="Masukkan nama produk"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-sm text-destructive">
                      {formik.errors.name}
                    </p>
                  )}
                </div>

                {/* Product Slug */}
                <div className="space-y-2">
                  <LabelWithTooltip
                    htmlFor="slug"
                    label="Slug"
                    tooltip="URL-friendly identifier yang akan digunakan pada URL produk. Dihasilkan otomatis dari nama produk."
                  />
                  <Input
                    id="slug"
                    name="slug"
                    placeholder="produk-nama"
                    value={formik.values.slug}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <LabelWithTooltip
                    htmlFor="categoryId"
                    label="Kategori"
                    tooltip="Kategori produk untuk pengelompokan"
                  />
                  <Select
                    name="categoryId"
                    value={formik.values.categoryId || "none"}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tanpa Kategori</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Collection */}
                <div className="space-y-2">
                  <LabelWithTooltip
                    htmlFor="collectionId"
                    label="Koleksi"
                    tooltip="Koleksi produk untuk pengelompokan khusus"
                  />
                  <Select
                    name="collectionId"
                    value={formik.values.collectionId || "none"}
                    onValueChange={handleCollectionChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih koleksi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tanpa Koleksi</SelectItem>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Special Label */}
                <div className="space-y-2">
                  <LabelWithTooltip
                    htmlFor="specialLabel"
                    label="Label Khusus"
                    tooltip="Label khusus untuk produk, seperti Produk Baru, Best Seller, dll."
                  />
                  <Select
                    name="specialLabel"
                    value={formik.values.specialLabel || "none"}
                    onValueChange={handleSpecialLabelChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih label" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIAL_LABELS.map((label) => (
                        <SelectItem key={label.value} value={label.value}>
                          {label.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <LabelWithTooltip
                htmlFor="description"
                label="Deskripsi Produk"
                tooltip="Deskripsi detail tentang produk ini. Mendukung format HTML."
              />
              {/* Adjust minimum height for better mobile editing */}
              <div className="min-h-[250px] sm:min-h-[300px]">
                <QuillEditor
                  value={formik.values.description || ""}
                  onChange={(value) =>
                    formik.setFieldValue("description", value)
                  }
                  ref={quillRef}
                />
              </div>

              {/* Auto-generated excerpt */}
              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="excerpt"
                  label="Ringkasan Otomatis"
                  tooltip="Ringkasan singkat dari deskripsi produk yang dihasilkan secara otomatis."
                />
                <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                  {excerpt ||
                    "Ringkasan akan dihasilkan secara otomatis dari deskripsi."}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Images */}
        <Card>
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
            <CardTitle>Gambar Tambahan</CardTitle>
            <CardDescription>
              Upload gambar tambahan produk (maksimal 8 gambar)
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Generate 8 image upload slots */}
              {Array.from({ length: 8 }).map((_, index) => {
                const existingImage = formik.values.additionalImages?.[index];
                return (
                  <div key={index} className="space-y-1 sm:space-y-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      {`Gambar ${index + 1}`}
                    </div>
                    <ImageUploadPreview
                      id={`additional-image-${index}`}
                      value={existingImage?.url || null}
                      onChange={(url) =>
                        handleAdditionalImageChange(index, url)
                      }
                      className="aspect-square w-full h-auto"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Product Variations and Pricing */}
        <ProductVariationSection
          onPriceChange={(price) => formik.setFieldValue("basePrice", price)}
          onStockChange={(stock) => formik.setFieldValue("baseStock", stock)}
          basePrice={formik.values.basePrice ?? null}
          baseStock={formik.values.baseStock ?? null}
        />

        {/* Product Dimensions */}
        <Card>
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
            <CardTitle>Dimensi Produk</CardTitle>
            <CardDescription>
              Informasi dimensi produk untuk kalkulasi pengiriman
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Weight */}
              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="weight"
                  label="Berat (gram)"
                  tooltip="Berat produk dalam gram"
                />
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  placeholder="0"
                  value={formik.values.weight || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.weight && formik.errors.weight && (
                  <p className="text-sm text-destructive">
                    {formik.errors.weight as string}
                  </p>
                )}
              </div>

              {/* Dimensions */}
              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="dimensions"
                  label="Dimensi (cm)"
                  tooltip="Panjang, lebar, dan tinggi produk dalam sentimeter"
                />
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="dimensions.length"
                      className="text-xs text-muted-foreground"
                    >
                      Panjang
                    </label>
                    <Input
                      id="dimensions.length"
                      name="dimensions.length"
                      type="number"
                      placeholder="0"
                      value={formik.values.dimensions?.length || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="dimensions.width"
                      className="text-xs text-muted-foreground"
                    >
                      Lebar
                    </label>
                    <Input
                      id="dimensions.width"
                      name="dimensions.width"
                      type="number"
                      placeholder="0"
                      value={formik.values.dimensions?.width || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="dimensions.height"
                      className="text-xs text-muted-foreground"
                    >
                      Tinggi
                    </label>
                    <Input
                      id="dimensions.height"
                      name="dimensions.height"
                      type="number"
                      placeholder="0"
                      value={formik.values.dimensions?.height || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                </div>
                {formik.touched.dimensions && formik.errors.dimensions && (
                  <p className="text-sm text-destructive">
                    {typeof formik.errors.dimensions === "string"
                      ? formik.errors.dimensions
                      : "Dimensi harus berupa angka positif"}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meta & SEO */}
        <Card>
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
            <CardTitle>SEO & Meta</CardTitle>
            <CardDescription>
              Informasi untuk pengoptimalan mesin pencari (SEO)
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="space-y-4">
              {/* Google Search Preview */}
              <div className="p-3 sm:p-4 border rounded-md bg-white mb-4 overflow-hidden">
                <div className="text-xs text-muted-foreground mb-2 font-medium">
                  Preview di Google
                </div>
                <GoogleSearchPreview
                  title={metaTitle || formik.values.name}
                  description={
                    metaDescription ||
                    excerpt ||
                    formik.values.description ||
                    ""
                  }
                  slug={`products/${formik.values.slug}`}
                />
              </div>

              {/* Meta Title */}
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <LabelWithTooltip
                    htmlFor="meta.title"
                    label="Meta Title"
                    tooltip="Judul yang muncul di hasil pencarian. Idealnya 50-60 karakter."
                  />
                  {metaTitleManuallyEdited && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMetaTitleManuallyEdited(false);
                        setMetaTitle(formik.values.name);
                        formik.setFieldValue("meta", {
                          ...formik.values.meta,
                          title: formik.values.name,
                        });
                      }}
                      className="h-6 text-xs justify-start sm:justify-center w-auto"
                    >
                      Selaraskan dengan nama produk
                    </Button>
                  )}
                </div>
                <Input
                  id="meta.title"
                  name="meta.title"
                  placeholder="Gunakan nama produk yang menarik"
                  value={metaTitle}
                  onChange={handleMetaTitleChange}
                  onBlur={formik.handleBlur}
                />
                <CharacterCountSEO current={metaTitle.length} type="title" />
              </div>

              {/* Meta Description */}
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <LabelWithTooltip
                    htmlFor="meta.description"
                    label="Meta Description"
                    tooltip="Deskripsi yang muncul di hasil pencarian. Idealnya 150-160 karakter."
                  />
                  {metaDescriptionManuallyEdited && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMetaDescriptionManuallyEdited(false);
                        setMetaDescription(excerpt);
                        formik.setFieldValue("meta", {
                          ...formik.values.meta,
                          description: excerpt,
                        });
                      }}
                      className="h-6 text-xs justify-start sm:justify-center w-auto"
                    >
                      Selaraskan dengan deskripsi
                    </Button>
                  )}
                </div>
                <textarea
                  id="meta.description"
                  name="meta.description"
                  rows={3}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Deskripsi singkat dan menarik tentang produk"
                  value={metaDescription}
                  onChange={handleMetaDescriptionChange}
                  onBlur={formik.handleBlur}
                ></textarea>
                <CharacterCountSEO
                  current={metaDescription.length}
                  type="description"
                />
              </div>

              {/* Hidden OG Image field - uses featuredImage by default */}
              <input
                type="hidden"
                name="meta.ogImage"
                value={
                  formik.values.meta?.ogImage ||
                  formik.values.featuredImage?.url ||
                  ""
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Sticky Form Actions */}
        <div className="fixed bottom-0 left-0 right-0 py-3 px-4 sm:py-4 sm:px-6 bg-background border-t z-[5] shadow-[0_-1px_2px_rgba(0,0,0,0.1)]">
          <div className="container flex items-center justify-end gap-2 sm:gap-4 max-w-7xl mx-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formik.isValid}
              className="flex-1 sm:flex-none"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {initialValues ? "Perbarui Produk" : "Tambah Produk"}
            </Button>
          </div>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onOpenChange={(open) => !isDeletingImages && setConfirmDialogOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pembatalan</DialogTitle>
            <DialogDescription>
              Anda memiliki perubahan yang belum disimpan. Yakin ingin
              membatalkan?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isDeletingImages}
            >
              Lanjutkan Mengedit
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmNavigation}
              disabled={isDeletingImages}
            >
              {isDeletingImages ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membersihkan...
                </>
              ) : (
                "Ya, Batalkan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductForm;
