"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Filter, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useCollectionStore } from "@/store/useCollectionStore";
import { useProductStore } from "@/store/useProductStore";

interface ProductSidebarProps {
  onFilterApplied?: () => void;
  onFilterChange?: (filters: any) => void;
}

function ProductSidebar({
  onFilterApplied,
  onFilterChange,
}: ProductSidebarProps) {
  const { categories } = useCategoryStore();
  const { collections } = useCollectionStore();
  const { filters, loading } = useProductStore();

  // Use a ref to track if we've initialized the sidebar
  const initialized = useRef(false);

  // Local state for filters that will be batched and applied together
  const [localFilters, setLocalFilters] = useState({
    categorySlug: filters.categorySlug,
    collectionId: filters.collectionId,
    sortBy: filters.sortBy || "newest",
  });

  // Update local filters when store filters change, but only after initialization
  useEffect(() => {
    // Short delay on first render to avoid initialization issues
    if (!initialized.current) {
      const timer = setTimeout(() => {
        initialized.current = true;
        setLocalFilters({
          categorySlug: filters.categorySlug,
          collectionId: filters.collectionId,
          sortBy: filters.sortBy || "newest",
        });
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setLocalFilters({
        categorySlug: filters.categorySlug,
        collectionId: filters.collectionId,
        sortBy: filters.sortBy || "newest",
      });
    }
  }, [filters.categorySlug, filters.collectionId, filters.sortBy]);

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      categorySlug: value === "all" ? undefined : value,
    }));
  };

  // Handle collection selection
  const handleCollectionChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      collectionId: value === "all" ? undefined : value,
    }));
  };

  // Handle sort selection
  const handleSortChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: value,
    }));
  };

  // Apply all filters at once
  const handleApplyFilters = () => {
    if (onFilterChange) {
      // Apply all filters at once with page reset
      onFilterChange({
        ...localFilters,
        page: 1,
      });
    }

    // Close the mobile filter sheet if needed
    if (onFilterApplied) {
      onFilterApplied();
    }
  };
  // Reset all filters
  const handleResetFilters = () => {
    const defaultFilters = {
      categorySlug: undefined,
      collectionId: undefined,
      sortBy: "newest",
    };

    // Update local state
    setLocalFilters(defaultFilters);

    // Apply changes immediately if set to do so
    if (onFilterChange) {
      onFilterChange({
        ...defaultFilters,
        page: 1,
      });
    }

    if (onFilterApplied) {
      onFilterApplied();
    }
  };
  // Check if filters have changed from what's currently in the store
  const hasFilterChanges =
    localFilters.categorySlug !== filters.categorySlug ||
    localFilters.collectionId !== filters.collectionId ||
    localFilters.sortBy !== filters.sortBy;

  return (
    <div className="space-y-4">
      {/* Urutan */}
      <div>
        <label className="text-sm font-medium pb-4">Urutkan</label>
        <Select
          value={localFilters.sortBy || "newest"}
          onValueChange={handleSortChange}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Terbaru</SelectItem>
            <SelectItem value="oldest">Terlama</SelectItem>
            <SelectItem value="price-low">Harga Terendah</SelectItem>
            <SelectItem value="price-high">Harga Tertinggi</SelectItem>
            <SelectItem value="name-asc">Nama A-Z</SelectItem>
            <SelectItem value="name-desc">Nama Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category filter */}
      <div>
        <label className="text-sm font-medium pb-4">Kategori</label>
        <Select
          value={localFilters.categorySlug || "all"}
          onValueChange={handleCategoryChange}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Collection filter */}
      <div>
        <label className="text-sm font-medium pb-4">Koleksi</label>
        <Select
          value={localFilters.collectionId || "all"}
          onValueChange={handleCollectionChange}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Koleksi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Koleksi</SelectItem>
            {collections.map((collection) => (
              <SelectItem key={collection.id} value={collection.id}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Apply Filters button - highlight when changes are pending */}
      <Button
        className="w-full"
        onClick={handleApplyFilters}
        disabled={loading || !hasFilterChanges}
        variant={hasFilterChanges ? "default" : "outline"}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Menerapkan...
          </>
        ) : (
          <>
            <Filter className="h-4 w-4 mr-2" />
            Terapkan Filter
          </>
        )}
      </Button>

      {/* Reset Filters button */}
      <Button
        className="w-full"
        variant="outline"
        onClick={handleResetFilters}
        disabled={loading}
      >
        Reset Filter
      </Button>
    </div>
  );
}

export default ProductSidebar;
