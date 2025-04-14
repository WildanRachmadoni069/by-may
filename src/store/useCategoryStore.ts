import { create } from "zustand";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/utils/category";

interface Category {
  id: string;
  name: string;
  value: string;
  label: string;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const categoriesData = await getCategories();
      set({ categories: categoriesData, loading: false, error: null });
    } catch (error) {
      console.error("Error fetching categories:", error);
      set({ error: "Failed to fetch categories", loading: false });
    }
  },

  addCategory: async (name: string) => {
    set({ loading: true });
    try {
      const newCategory = await createCategory(name);
      set((state) => ({
        categories: [...state.categories, newCategory],
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Error adding category:", error);
      set({ error: "Failed to add category", loading: false });
      throw error;
    }
  },

  updateCategory: async (id: string, name: string) => {
    set({ loading: true });
    try {
      const updatedCategory = await updateCategory(id, name);
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === id ? updatedCategory : c
        ),
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Error updating category:", error);
      set({ error: "Failed to update category", loading: false });
      throw error;
    }
  },

  deleteCategory: async (id: string) => {
    set({ loading: true });
    try {
      await deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Error deleting category:", error);
      set({ error: "Failed to delete category", loading: false });
      throw error;
    }
  },
}));
