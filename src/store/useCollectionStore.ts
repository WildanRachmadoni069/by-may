import { create } from "zustand";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";

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
  fetchCollections: () => void;
}

export const useCollectionStore = create<CollectionState>((set) => ({
  collections: [],
  loading: false,
  error: null,
  fetchCollections: () => {
    set({ loading: true });

    const q = query(collection(db, "collections"), orderBy("name", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const collectionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          value: doc.id,
          label: doc.data().name,
        }));
        set({ collections: collectionsData, loading: false, error: null });
      },
      (error) => {
        console.error("Error fetching collections:", error);
        set({ error: "Failed to fetch collections", loading: false });
      }
    );

    return () => unsubscribe();
  },
}));
