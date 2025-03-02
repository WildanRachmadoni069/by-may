import { create } from "zustand";

interface FilterState {
  category: string;
  collection: string;
  sortBy: string;
  setCategory: (category: string) => void;
  setCollection: (collection: string) => void;
  setSortBy: (sort: string) => void;
  resetFilters: () => void;
}

export const useProductFilterStore = create<FilterState>((set) => ({
  category: "all",
  collection: "all",
  sortBy: "newest",
  setCategory: (category) => set({ category }),
  setCollection: (collection) => set({ collection }),
  setSortBy: (sortBy) => set({ sortBy }),
  resetFilters: () =>
    set({
      category: "all",
      collection: "all",
      sortBy: "newest",
    }),
}));
