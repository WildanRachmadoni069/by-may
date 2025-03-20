"use client";
import { ProductForm } from "@/components/admin/product/ProductForm";
import React from "react";

function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tambah Produk</h1>
        <p className="text-muted-foreground">
          Tambahkan produk baru ke katalog toko Anda
        </p>
      </div>

      <ProductForm />
    </div>
  );
}

export default Page;
