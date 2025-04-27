"use client";

import ProductForm from "@/components/admin/product/ProductForm";

export default function EditProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Edit Produk</h1>
        <p className="text-muted-foreground">
          Perbarui informasi produk yang sudah ada
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
