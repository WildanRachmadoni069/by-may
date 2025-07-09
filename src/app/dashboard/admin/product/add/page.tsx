"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/product/ProductForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createProductAction } from "@/app/actions/product-actions";
import { useProductVariationStore } from "@/store/useProductVariationStore";
import { CreateProductInput } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { useSWRConfig } from "swr";
import { logError } from "@/lib/debug";

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { resetVariations } = useProductVariationStore();
  const { mutate } = useSWRConfig();

  // Reset variation store saat masuk halaman
  useEffect(() => {
    resetVariations();
  }, [resetVariations]);

  // Ambil data variasi dari store
  const { variations, priceVariants, hasVariations, setHasVariations } =
    useProductVariationStore();

  const handleSubmit = async (values: CreateProductInput) => {
    try {
      setIsSubmitting(true);

      // Pastikan hasVariations diset dengan benar di store
      if (values.hasVariations !== hasVariations) {
        setHasVariations(values.hasVariations);
      }

      // Sertakan variations dan price variants dari store
      const productData = {
        ...values,
        hasVariations,
        variations: hasVariations ? variations : [],
        priceVariants: hasVariations ? priceVariants : [],
      };

      // Buat produk menggunakan server action
      const product = await createProductAction(productData);

      // Tampilkan toast sukses
      toast({
        title: "Produk berhasil ditambahkan",
        description: `Produk "${product.name}" telah berhasil ditambahkan.`,
      });

      // Invalidate cache produk untuk memastikan data fresh
      mutate(
        (key: string) =>
          typeof key === "string" && key.startsWith("/api/products"),
        undefined,
        { revalidate: true }
      );

      // Reset variations store setelah submission berhasil
      resetVariations();

      // Navigate ke daftar produk
      router.push("/dashboard/admin/product");
    } catch (error) {
      logError("AddProductPage.handleSubmit", error);
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
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/dashboard/admin/product")}
          aria-label="Kembali"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Tambah Produk Baru</h1>
      </div>

      <div>
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
