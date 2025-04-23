"use client";

import { ProductForm } from "@/components/admin/product/ProductForm";
import { useProductStore } from "@/store/useProductStore";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { ProductService } from "@/lib/services/product-service";

export default function EditProductPage() {
  const { slug } = useParams();
  const {
    selectedProduct: product,
    loading,
    error,
    fetchProductBySlug,
  } = useProductStore();
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      console.log("Mengambil produk dengan slug:", slug);
      fetchProductBySlug(slug as string);
    }
  }, [slug, fetchProductBySlug]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Produk Tidak Ditemukan</h1>
          <p className="text-muted-foreground">
            Produk yang Anda cari tidak ditemukan atau telah dihapus.
            {error && (
              <span className="text-red-500"> Detail error: {error}</span>
            )}
          </p>
        </div>
      </div>
    );
  }

  const formData = ProductService.transformToFormValues(product);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Edit Produk</h1>
        <p className="text-muted-foreground">
          Perbarui informasi produk yang sudah ada
        </p>
      </div>

      <ProductForm productSlug={product.slug} initialData={formData} />
    </div>
  );
}
