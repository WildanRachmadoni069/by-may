import { create } from "zustand";

export type FilterCategory = string;
export type FilterCollection = string;
export type SortBy = "newest" | "price-asc" | "price-desc";

type FilterState = {
  category: FilterCategory;
  collection: FilterCollection;
  sortBy: SortBy;
  searchQuery: string;

  setCategory: (category: FilterCategory) => void;
  setCollection: (collection: FilterCollection) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: {
    category?: FilterCategory;
    collection?: FilterCollection;
    sortBy?: SortBy;
    searchQuery?: string;
  }) => void;
};

export const useProductFilterStore = create<FilterState>((set) => ({
  category: "all",
  collection: "all",
  sortBy: "newest",
  searchQuery: "",

  setCategory: (category) => set({ category }),
  setCollection: (collection) => set({ collection }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setFilters: (filters) =>
    set((state) => ({
      category: filters.category ?? state.category,
      collection: filters.collection ?? state.collection,
      sortBy: filters.sortBy ?? state.sortBy,
      searchQuery: filters.searchQuery ?? state.searchQuery,
    })),
}));
