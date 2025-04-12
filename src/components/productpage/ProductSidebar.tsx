"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
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
import { SortBy } from "@/store/useProductFilterStore";

interface ProductSidebarProps {
  onFilterApplied?: () => void;
}

function ProductSidebar({ onFilterApplied }: ProductSidebarProps) {
  const { categories, fetchCategories } = useCategoryStore();
  const { collections, fetchCollections } = useCollectionStore();
  const filters = useProductFilterStore();
  const { fetchFilteredProducts, loading } = useProductStore();

  // Track local filter state that will only be applied on submit
  const [localFilters, setLocalFilters] = useState({
    category: filters.category,
    collection: filters.collection,
    sortBy: filters.sortBy as SortBy,
  });

  // Initialize local filters from store
  useEffect(() => {
    setLocalFilters({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
    });
  }, [filters.category, filters.collection, filters.sortBy]);

  useEffect(() => {
    fetchCategories();
    fetchCollections();
  }, [fetchCategories, fetchCollections]);

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
      searchQuery: filters.searchQuery,
    });

    // Call the callback if provided
    if (onFilterApplied) {
      onFilterApplied();
    }
  };

  // Reset filters to defaults
  const handleResetFilters = () => {
    const defaultFilters = {
      category: "all",
      collection: "all",
      sortBy: "newest" as SortBy,
    };

    setLocalFilters(defaultFilters);

    // Update the filter store
    filters.setCategory(defaultFilters.category);
    filters.setCollection(defaultFilters.collection);
    filters.setSortBy(defaultFilters.sortBy);

    // Fetch with reset filters but keep search query
    fetchFilteredProducts({
      category: defaultFilters.category,
      collection: defaultFilters.collection,
      sortBy: defaultFilters.sortBy,
      itemsPerPage: 12,
      searchQuery: filters.searchQuery,
    });

    // Call the callback if provided
    if (onFilterApplied) {
      onFilterApplied();
    }
  };

  return (
    <div className="space-y-4">
      {/* Urutan */}
      <div>
        <label className="text-sm font-medium pb-4">Urutkan</label>
        <Select
          value={localFilters.sortBy}
          onValueChange={(value: SortBy) =>
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
