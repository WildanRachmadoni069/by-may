"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/product/ProductForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import { createProductAction } from "@/app/actions/product-actions";
import { useProductVariationStore } from "@/store/useProductVariationStore";
import { CreateProductInput } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { useSWRConfig } from "swr";

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { resetVariations } = useProductVariationStore();
  const { mutate } = useSWRConfig();

  // Reset variation store when entering the page
  useEffect(() => {
    resetVariations();
  }, [resetVariations]);

  // Get variation data from store
  const { variations, priceVariants, hasVariations, setHasVariations } =
    useProductVariationStore();

  const handleSubmit = async (values: CreateProductInput) => {
    try {
      setIsSubmitting(true);

      // Ensure hasVariations is correctly set in the store
      if (values.hasVariations !== hasVariations) {
        setHasVariations(values.hasVariations);
      }

      // Include variations and price variants from store
      const productData = {
        ...values,
        hasVariations,
        variations: hasVariations ? variations : [],
        priceVariants: hasVariations ? priceVariants : [],
      };

      // Create the product using server action
      const product = await createProductAction(productData);

      // Show success toast
      toast({
        title: "Produk berhasil ditambahkan",
        description: `Produk "${product.name}" telah berhasil ditambahkan.`,
      });

      // Invalidate products cache to ensure fresh data
      mutate(
        (key: string) =>
          typeof key === "string" && key.startsWith("/api/products"),
        undefined,
        { revalidate: true }
      );

      // Reset variations store after successful submission
      resetVariations();

      // Navigate to the product list
      router.push("/dashboard/admin/product");
    } catch (error) {
      console.error("Failed to create product:", error);
      toast({
        variant: "destructive",
        title: "Gagal menambahkan produk",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menambahkan produk.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb separator={<ChevronRight className="h-4 w-4" />}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard/admin/product">
            Produk
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>Tambah Produk</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold mb-2">Tambah Produk Baru</h1>
        <p className="text-muted-foreground">
          Isi formulir berikut untuk menambahkan produk baru ke toko Anda.
        </p>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="add"
      />
    </div>
  );
}
