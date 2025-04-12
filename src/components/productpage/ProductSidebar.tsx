"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search } from "lucide-react";
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
import { useSearchParams } from "next/navigation";

function ProductSidebar() {
  const { categories, fetchCategories } = useCategoryStore();
  const { collections, fetchCollections } = useCollectionStore();
  const filters = useProductFilterStore();
  const { fetchFilteredProducts, loading, currentSearchQuery } =
    useProductStore();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(
    initialQuery || currentSearchQuery
  );

  // Track local filter state that will only be applied on submit
  const [localFilters, setLocalFilters] = useState({
    category: filters.category,
    collection: filters.collection,
    sortBy: filters.sortBy,
  });

  // Initialize from URL or store
  useEffect(() => {
    if (initialQuery || currentSearchQuery) {
      setSearchQuery(initialQuery || currentSearchQuery);
    }

    // Also initialize local filters from store
    setLocalFilters({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
    });
  }, [
    initialQuery,
    currentSearchQuery,
    filters.category,
    filters.collection,
    filters.sortBy,
  ]);

  useEffect(() => {
    fetchCategories();
    fetchCollections();
  }, [fetchCategories, fetchCollections]);

  // Handle search separately from filters
  const handleSearch = () => {
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
    // Explicitly set searchQuery to empty string when resetting
    fetchFilteredProducts({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
      itemsPerPage: 12,
      searchQuery: "", // Ensure empty string is passed, not undefined
    });
  };

  // Apply all filters at once with the Apply button
  const handleApplyFilters = () => {
    // Update the filter store
    filters.setCategory(localFilters.category);
    filters.setCollection(localFilters.collection);
    filters.setSortBy(localFilters.sortBy);

    // Then fetch with all the new filter values and current search
    fetchFilteredProducts({
      category: localFilters.category,
      collection: localFilters.collection,
      sortBy: localFilters.sortBy,
      itemsPerPage: 12,
      searchQuery: searchQuery.trim(),
    });
  };

  // Reset filters to defaults
  const handleResetFilters = () => {
    const defaultFilters = {
      category: "all",
      collection: "all",
      sortBy: "newest",
    };

    setLocalFilters(defaultFilters);

    // Don't reset the search query when resetting filters
    // This lets users keep their search results while trying different filters
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
        <Select
          value={localFilters.sortBy}
          onValueChange={(value) =>
            setLocalFilters({ ...localFilters, sortBy: value })
          }
        >
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

      {/* Category filter */}
      <div>
        <label className="text-sm font-medium pb-4">Kategori</label>
        <Select
          value={localFilters.category}
          onValueChange={(value) =>
            setLocalFilters({ ...localFilters, category: value })
          }
        >
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

      {/* Collection filter */}
      <div>
        <label className="text-sm font-medium pb-4">Koleksi</label>
        <Select
          value={localFilters.collection}
          onValueChange={(value) =>
            setLocalFilters({ ...localFilters, collection: value })
          }
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

      {/* Apply Filters button */}
      <Button
        className="w-full"
        onClick={handleApplyFilters}
        disabled={loading}
      >
        <Filter className="h-4 w-4 mr-2" />
        Terapkan Filter
      </Button>

      {/* Reset Filters button */}
      <Button className="w-full" variant="outline" onClick={handleResetFilters}>
        Reset Filter
      </Button>
    </div>
  );
}

export default ProductSidebar;
