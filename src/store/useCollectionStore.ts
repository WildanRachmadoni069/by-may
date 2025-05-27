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
  /** State untuk koleksi yang sedang dihapus (slug koleksi: boolean) */
  deletingCollections: Record<string, boolean>;
  /** Mengambil daftar koleksi */
  fetchCollections: () => Promise<void>;
  /** Membuat koleksi baru */
  createCollection: (data: CollectionCreateInput) => Promise<CollectionData>;
  /** Memperbarui koleksi */
  updateCollection: (
    slug: string,
    data: CollectionUpdateInput
  ) => Promise<CollectionData>;
  /** Menghapus koleksi */
  deleteCollection: (
    slug: string
  ) => Promise<{ success: boolean; message?: string }>;
  /** Mengatur status penghapusan koleksi */
  setDeletingCollection: (slug: string, isDeleting: boolean) => void;
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
          slug: newCollection.slug,
          value: newCollection.slug,
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
   * Memperbarui koleksi
   * @param slug Slug koleksi yang akan diperbarui
   * @param data Data koleksi yang diperbarui
   * @returns Koleksi yang diperbarui
   */
  updateCollection: async (slug: string, data: CollectionUpdateInput) => {
    try {
      set({ loading: true, error: null });
      const updatedCollection = await updateCollection(slug, data);
      set((state) => ({
        collections: state.collections.map((collection) =>
          collection.slug === slug
            ? {
                id: updatedCollection.id,
                name: updatedCollection.name,
                slug: updatedCollection.slug,
                value: updatedCollection.slug,
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
   * @param slug Slug koleksi yang akan dihapus
   */
  deleteCollection: async (slug: string) => {
    try {
      get().setDeletingCollection(slug, true);
      await deleteCollection(slug);
      set((state) => ({
        collections: state.collections.filter((c) => c.slug !== slug),
        error: null,
      }));
      get().setDeletingCollection(slug, false);
      return { success: true };
    } catch (error) {
      get().setDeletingCollection(slug, false);
      const message =
        error instanceof Error ? error.message : "Gagal menghapus koleksi";
      set({ error: message });
      return { success: false, message };
    }
  },

  /**
   * Mengatur status penghapusan koleksi
   * @param slug Slug koleksi
   * @param isDeleting Status penghapusan
   */
  setDeletingCollection: (slug: string, isDeleting: boolean) => {
    set((state) => ({
      deletingCollections: {
        ...state.deletingCollections,
        [slug]: isDeleting,
      },
    }));
  },
}));
