"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "@/components/admin/product/ProductForm";
import { updateProductAction } from "@/app/actions/product-actions";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { CreateProductInput } from "@/types/product";
import { useProductVariationStore } from "@/store/useProductVariationStore";
import { useProduct } from "@/hooks/useProduct";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSWRConfig } from "swr";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/lib/debug";

export default function EditProductPage() {
  const params = useParams<{ slug: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { resetVariations } = useProductVariationStore();
  const { mutate: globalMutate } = useSWRConfig();
  const { toast } = useToast();

  // Use the SWR hook to fetch product data
  const { product, isLoading, error, mutate } = useProduct(params.slug);

  // Reset variation store when leaving the page
  useEffect(() => {
    return () => {
      resetVariations();
    };
  }, [resetVariations]);

  const handleSubmit = async (data: CreateProductInput) => {
    setIsSubmitting(true);
    try {
      const updatedProduct = await updateProductAction(params.slug, data);

      // Update SWR cache with the new data
      mutate(updatedProduct, false);

      // Reset variations store after successful update
      resetVariations();

      // Invalidate any products listings that might contain this product
      globalMutate(
        (key: string) =>
          typeof key === "string" &&
          key.startsWith("/api/products") &&
          !key.includes(params.slug),
        undefined,
        { revalidate: true }
      );

      // Show success toast
      toast({
        title: "Produk berhasil diperbarui",
        description: `Produk "${updatedProduct.name}" telah berhasil diperbarui.`,
      });

      router.push("/dashboard/admin/product");
    } catch (error) {
      logError("Failed to update product", error);
      toast({
        variant: "destructive",
        title: "Gagal memperbarui produk",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memperbarui produk.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-6 flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <div className="flex flex-col items-center space-y-4">
          <AlertCircle className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-bold text-destructive">
            {error ? error.message : "Product not found"}
          </h1>
          <Button
            onClick={() => router.push("/dashboard/admin/product")}
            className="mt-4"
          >
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/dashboard/admin/product")}
          aria-label="Kembali"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Produk: {product.name}</h1>
      </div>
      <ProductForm
        initialValues={product}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="edit"
      />
    </div>
  );
}
