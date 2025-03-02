"use client";

import { ProductForm } from "@/components/admin/product/ProductForm";
import { useProductStore } from "@/store/useProductStore";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const {
    selectedProduct: product,
    loading,
    error,
    fetchProduct,
  } = useProductStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchProduct(resolvedParams.id);
  }, [resolvedParams.id, fetchProduct]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !product) {
    return <div>Product not found</div>;
  }

  return <ProductForm productId={resolvedParams.id} initialData={product} />;
}
