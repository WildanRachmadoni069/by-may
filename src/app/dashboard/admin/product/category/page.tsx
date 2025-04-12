"use client";

import CategoryForm from "@/components/admin/product/CategoryForm";
import CategoryList from "@/components/admin/product/CategoryList";
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function CategoryPage() {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header with title and add button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Kategori Produk</h1>
          <p className="text-muted-foreground">
            Kelola kategori untuk mengorganisir produk Anda
          </p>
        </div>
        <Button onClick={() => setIsAddSheetOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kategori
        </Button>
      </div>

      {/* Category list with the same styling as product list */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <CategoryList />
      </div>

      {/* Category form in a slide-out sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent className="w-full md:max-w-md">
          <SheetHeader>
            <SheetTitle>Tambah Kategori</SheetTitle>
            <SheetDescription>
              Buat kategori baru untuk produk Anda
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <CategoryForm onSuccess={() => setIsAddSheetOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default CategoryPage;
