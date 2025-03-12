"use client";

import CollectionForm from "@/components/admin/product/CollectionForm";
import CollectionList from "@/components/admin/product/CollectionList";

export default function CollectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Koleksi Produk</h1>
        <p className="text-muted-foreground">
          Kelola koleksi untuk mengelompokkan produk berdasarkan tema atau musim
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <CollectionForm />
        <CollectionList />
      </div>
    </div>
  );
}
