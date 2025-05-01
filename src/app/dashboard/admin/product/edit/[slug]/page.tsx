"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "@/components/admin/product/ProductForm";
import {
  getProductAction,
  updateProductAction,
} from "@/app/actions/product-actions";
import { Loader2 } from "lucide-react";
import { Product, CreateProductInput } from "@/types/product";
import { useProductVariationStore } from "@/store/useProductVariationStore";

export default function EditProductPage() {
  const params = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { resetVariations } = useProductVariationStore();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const fetchedProduct = await getProductAction(params.slug);
        if (!fetchedProduct) {
          setError("Product not found");
        } else {
          setProduct(fetchedProduct);
        }
      } catch (err) {
        setError("Failed to fetch product");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();

    // Reset variation store when leaving the page
    return () => {
      resetVariations();
    };
  }, [params.slug, resetVariations]);

  const handleSubmit = async (data: CreateProductInput) => {
    setIsSubmitting(true);
    try {
      await updateProductAction(params.slug, data);
      router.push("/dashboard/admin/product");
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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
        <h1 className="text-3xl font-bold text-destructive">
          {error || "Product not found"}
        </h1>
        <button
          onClick={() => router.push("/dashboard/admin/product")}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Edit Produk: {product.name}</h1>
      <ProductForm
        initialValues={product}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
