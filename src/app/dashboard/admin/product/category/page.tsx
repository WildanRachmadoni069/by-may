import CategoryForm from "@/components/admin/product/CategoryForm";
import CategoryList from "@/components/admin/product/CategoryList";
import React from "react";

function CategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Kategori Produk</h1>
        <p className="text-muted-foreground">
          Kelola kategori untuk mengorganisir produk Anda
        </p>
      </div>

      <div className="flex flex-col space-y-6">
        <CategoryForm />
        <CategoryList />
      </div>
    </div>
  );
}

export default CategoryPage;
