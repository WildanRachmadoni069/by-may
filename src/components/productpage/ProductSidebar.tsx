"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
import { useProductStore } from "@/store/useProductStore";

function ProductSidebar() {
  const { categories, fetchCategories } = useCategoryStore();
  const { collections, fetchCollections } = useCollectionStore();
  const filters = useProductFilterStore();
  const { fetchFilteredProducts, loading } = useProductStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchCollections();
  }, [fetchCategories, fetchCollections]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      fetchFilteredProducts({
        category: filters.category,
        collection: filters.collection,
        sortBy: filters.sortBy,
        itemsPerPage: 12,
      });
      return;
    }

    fetchFilteredProducts({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
      itemsPerPage: 12,
      searchQuery: searchQuery.trim(),
    });
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    fetchFilteredProducts({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
      itemsPerPage: 12,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="space-y-2">
        <label className="text-sm font-medium pb-4">Pencarian</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
          <Button size="sm" onClick={handleSearch} disabled={loading}>
            {loading ? "..." : "Cari"}
          </Button>
        </div>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetSearch}
            className="w-full text-muted-foreground"
            disabled={loading}
          >
            Reset Pencarian
          </Button>
        )}
      </div>

      {/* Urutan */}
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

      {/* Category & Collection filters */}
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

      {/* Reset all filters */}
      <Button
        className="w-full"
        onClick={() => {
          filters.resetFilters();
          setSearchQuery("");
          handleResetSearch();
        }}
      >
        Reset Semua Filter
      </Button>
    </div>
  );
}

export default ProductSidebar;
