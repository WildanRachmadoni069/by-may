import CategoryForm from "@/components/admin/product/CategoryForm";
import CategoryList from "@/components/admin/product/CategoryList";
import React from "react";

function CategoryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manajemen Kategori Produk</h1>
      <div className="flex flex-col space-y-8">
        <CategoryForm />
        <CategoryList />
      </div>
    </div>
  );
}

export default CategoryPage;
