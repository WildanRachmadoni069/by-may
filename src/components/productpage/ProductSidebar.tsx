"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useCollectionStore } from "@/store/useCollectionStore";
import { useProductFilterStore } from "@/store/useProductFilterStore";

function ProductSidebar() {
  const { categories, fetchCategories } = useCategoryStore();
  const { collections, fetchCollections } = useCollectionStore();
  const filters = useProductFilterStore();

  useEffect(() => {
    fetchCategories();
    fetchCollections();
  }, [fetchCategories, fetchCollections]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium pb-4">Urutkan</label>
        <Select value={filters.sortBy} onValueChange={filters.setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Terbaru</SelectItem>
            <SelectItem value="price-asc">Harga Terendah</SelectItem>
            <SelectItem value="price-desc">Harga Tertinggi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium pb-4">Kategori</label>
        <Select value={filters.category} onValueChange={filters.setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium pb-4">Koleksi</label>
        <Select
          value={filters.collection}
          onValueChange={filters.setCollection}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Koleksi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Koleksi</SelectItem>
            <SelectItem value="none">Tanpa Koleksi</SelectItem>
            {collections.map((collection) => (
              <SelectItem key={collection.value} value={collection.value}>
                {collection.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button className="w-full" onClick={filters.resetFilters}>
        Reset Filter
      </Button>
    </div>
  );
}

export default ProductSidebar;
