/**
 * Category Store
 *
 * Store Zustand untuk pengelolaan state category di sisi klien
 */

import { create } from "zustand";
import {
  CategoryData,
  CategoryCreateInput,
  CategoryUpdateInput,
} from "@/types/category";
import { ApiResponse } from "@/types/common";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/lib/api/categories";

/**
 * Interface untuk state category
 */
interface CategoryState {
  /** Daftar kategori */
  categories: CategoryData[];
  /** Status loading */
  loading: boolean;
  /** Pesan error */
  error: string | null;
  /** State untuk kategori yang sedang dihapus (ID kategori: boolean) */
  deletingCategories: Record<string, boolean>;

  /** Mengambil daftar kategori */
  fetchCategories: () => Promise<void>;
  /** Membuat kategori baru */
  createCategory: (data: CategoryCreateInput) => Promise<CategoryData>;
  /** Memperbarui kategori */
  updateCategory: (
    id: string,
    data: CategoryUpdateInput
  ) => Promise<CategoryData>;
  /** Menghapus kategori */
  deleteCategory: (id: string) => Promise<ApiResponse>;
  /** Mengatur status penghapusan kategori */
  setDeletingCategory: (id: string, isDeleting: boolean) => void;
}

/**
 * Zustand store untuk pengelolaan kategori
 */
export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,
  deletingCategories: {},

  /**
   * Mengambil data kategori dari API
   */ fetchCategories: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getCategories();
      if (response.success && response.data) {
        set({ categories: response.data, loading: false });
      } else {
        set({
          error: response.message || "Gagal mengambil kategori",
          loading: false,
        });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Gagal mengambil kategori",
        loading: false,
      });
    }
  },

  /**
   * Membuat kategori baru
   * @param data Data kategori yang akan dibuat
   * @returns Kategori yang dibuat
   */
  createCategory: async (data: CategoryCreateInput) => {
    try {
      set({ loading: true, error: null });
      const response = await createCategory(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Gagal membuat kategori");
      }
      const newCategory = response.data;
      set((state) => ({
        categories: [...state.categories, newCategory],
        loading: false,
      }));
      return newCategory;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Gagal membuat kategori",
        loading: false,
      });
      throw error;
    }
  },

  /**
   * Memperbarui kategori yang sudah ada
   * @param id ID kategori yang akan diperbarui
   * @param data Data kategori yang diperbarui
   * @returns Kategori yang diperbarui
   */
  updateCategory: async (id: string, data: CategoryUpdateInput) => {
    try {
      set({ loading: true, error: null });
      const response = await updateCategory(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Gagal memperbarui kategori");
      }
      const updatedCategory = response.data;
      set((state) => ({
        categories: state.categories.map((category) =>
          category.id === id ? updatedCategory : category
        ),
        loading: false,
      }));
      return updatedCategory;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Gagal memperbarui kategori",
        loading: false,
      });
      throw error;
    }
  },

  /**
   * Menghapus kategori
   * @param id ID kategori yang akan dihapus
   * @returns Status keberhasilan dan pesan
   */
  deleteCategory: async (id: string) => {
    try {
      set((state) => ({
        deletingCategories: { ...state.deletingCategories, [id]: true },
      }));

      const response = await deleteCategory(id);

      if (response.success) {
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
          deletingCategories: { ...state.deletingCategories, [id]: false },
        }));
      } else {
        set((state) => ({
          error: response.message || "Gagal menghapus kategori",
          deletingCategories: { ...state.deletingCategories, [id]: false },
        }));
      }

      return response;
    } catch (error) {
      set((state) => ({
        error:
          error instanceof Error ? error.message : "Gagal menghapus kategori",
        deletingCategories: { ...state.deletingCategories, [id]: false },
      }));
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Gagal menghapus kategori",
      };
    }
  },

  /**
   * Mengatur status penghapusan kategori
   * @param id ID kategori
   * @param isDeleting Status penghapusan
   */
  setDeletingCategory: (id, isDeleting) => {
    set((state) => ({
      deletingCategories: { ...state.deletingCategories, [id]: isDeleting },
    }));
  },
}));
