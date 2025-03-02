"use client";

import CollectionForm from "@/components/admin/product/CollectionForm";
import CollectionList from "@/components/admin/product/CollectionList";
import { Card } from "@/components/ui/card";

export default function CollectionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manajemen Koleksi</h1>
      <div className="grid grid-cols-1 gap-6">
        <CollectionForm />
        <CollectionList />
      </div>
    </div>
  );
}
