import { create } from "zustand";
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from "@/utils/collection";

interface Collection {
  id: string;
  name: string;
  value: string;
  label: string;
}

interface CollectionState {
  collections: Collection[];
  loading: boolean;
  error: string | null;
  fetchCollections: () => Promise<void>;
  addCollection: (name: string) => Promise<void>;
  updateCollection: (id: string, name: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
}

export const useCollectionStore = create<CollectionState>((set) => ({
  collections: [],
  loading: false,
  error: null,

  fetchCollections: async () => {
    set({ loading: true });
    try {
      const collectionsData = await getCollections();
      set({ collections: collectionsData, loading: false, error: null });
    } catch (error) {
      console.error("Error fetching collections:", error);
      set({ error: "Failed to fetch collections", loading: false });
    }
  },

  addCollection: async (name: string) => {
    set({ loading: true });
    try {
      const newCollection = await createCollection(name);
      set((state) => ({
        collections: [...state.collections, newCollection],
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Error adding collection:", error);
      set({ error: "Failed to add collection", loading: false });
      throw error;
    }
  },

  updateCollection: async (id: string, name: string) => {
    set({ loading: true });
    try {
      const updatedCollection = await updateCollection(id, name);
      set((state) => ({
        collections: state.collections.map((c) =>
          c.id === id ? updatedCollection : c
        ),
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Error updating collection:", error);
      set({ error: "Failed to update collection", loading: false });
      throw error;
    }
  },

  deleteCollection: async (id: string) => {
    set({ loading: true });
    try {
      await deleteCollection(id);
      set((state) => ({
        collections: state.collections.filter((c) => c.id !== id),
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Error deleting collection:", error);
      set({ error: "Failed to delete collection", loading: false });
      throw error;
    }
  },
}));
