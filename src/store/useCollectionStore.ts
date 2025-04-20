/**
 * Collection Store
 *
 * Store Zustand untuk pengelolaan state collection di sisi klien
 */

import { create } from "zustand";
import {
  CollectionData,
  CollectionCreateInput,
  CollectionUpdateInput,
  CollectionOption,
} from "@/types/collection";
import {
  createCollection,
  deleteCollection,
  getCollections,
  getCollectionOptions,
  updateCollection,
} from "@/lib/api/collections";

/**
 * Interface untuk state collection
 */
interface CollectionState {
  /** Daftar koleksi */
  collections: CollectionOption[];
  /** Status loading */
  loading: boolean;
  /** Pesan error */
  error: string | null;
  /** State untuk koleksi yang sedang dihapus (ID koleksi: boolean) */
  deletingCollections: Record<string, boolean>;
  /** Mengambil daftar koleksi */
  fetchCollections: () => Promise<void>;
  /** Membuat koleksi baru */
  createCollection: (data: CollectionCreateInput) => Promise<CollectionData>;
  /** Memperbarui koleksi */
  updateCollection: (
    id: string,
    data: CollectionUpdateInput
  ) => Promise<CollectionData>;
  /** Menghapus koleksi */
  deleteCollection: (
    id: string
  ) => Promise<{ success: boolean; message?: string }>;
  /** Mengatur status penghapusan koleksi */
  setDeletingCollection: (id: string, isDeleting: boolean) => void;
}

/**
 * Zustand store untuk pengelolaan koleksi
 */
export const useCollectionStore = create<CollectionState>((set, get) => ({
  collections: [],
  loading: false,
  error: null,
  deletingCollections: {},

  /**
   * Mengambil data koleksi dari API
   */
  fetchCollections: async () => {
    try {
      set({ loading: true, error: null });
      const collections = await getCollectionOptions();
      set({ collections, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Gagal mengambil koleksi",
        loading: false,
      });
    }
  },

  /**
   * Membuat koleksi baru
   * @param data Data koleksi yang akan dibuat
   * @returns Koleksi yang dibuat
   */
  createCollection: async (data: CollectionCreateInput) => {
    try {
      set({ loading: true, error: null });
      const newCollection = await createCollection(data);
      set((state) => {
        // Konversi ke format option
        const newOption: CollectionOption = {
          id: newCollection.id,
          name: newCollection.name,
          value: newCollection.id,
          label: newCollection.name,
        };
        return {
          collections: [...state.collections, newOption],
          loading: false,
          error: null,
        };
      });
      return newCollection;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Gagal membuat koleksi",
        loading: false,
      });
      throw error;
    }
  },

  /**
   * Memperbarui koleksi yang sudah ada
   * @param id ID koleksi yang akan diperbarui
   * @param data Data koleksi yang diperbarui
   * @returns Koleksi yang diperbarui
   */
  updateCollection: async (id: string, data: CollectionUpdateInput) => {
    try {
      set({ loading: true, error: null });
      const updatedCollection = await updateCollection(id, data);
      set((state) => ({
        collections: state.collections.map((collection) =>
          collection.id === id
            ? {
                id: updatedCollection.id,
                name: updatedCollection.name,
                value: updatedCollection.id,
                label: updatedCollection.name,
              }
            : collection
        ),
        loading: false,
        error: null,
      }));
      return updatedCollection;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Gagal memperbarui koleksi",
        loading: false,
      });
      throw error;
    }
  },

  /**
   * Menghapus koleksi
   * @param id ID koleksi yang akan dihapus
   * @returns Status keberhasilan dan pesan
   */
  deleteCollection: async (id: string) => {
    try {
      set((state) => ({
        deletingCollections: { ...state.deletingCollections, [id]: true },
      }));

      const result = await deleteCollection(id);

      if (result.success) {
        set((state) => ({
          collections: state.collections.filter(
            (collection) => collection.id !== id
          ),
          deletingCollections: { ...state.deletingCollections, [id]: false },
        }));
      } else {
        set((state) => ({
          error: result.message || "Gagal menghapus koleksi",
          deletingCollections: { ...state.deletingCollections, [id]: false },
        }));
      }

      return result;
    } catch (error) {
      set((state) => ({
        error:
          error instanceof Error ? error.message : "Gagal menghapus koleksi",
        deletingCollections: { ...state.deletingCollections, [id]: false },
      }));
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Gagal menghapus koleksi",
      };
    }
  },

  /**
   * Mengatur status penghapusan koleksi
   * @param id ID koleksi
   * @param isDeleting Status penghapusan
   */
  setDeletingCollection: (id, isDeleting) => {
    set((state) => ({
      deletingCollections: { ...state.deletingCollections, [id]: isDeleting },
    }));
  },
}));
