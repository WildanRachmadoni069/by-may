import { create } from "zustand";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";

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
  fetchCategories: () => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,
  error: null,
  fetchCategories: () => {
    set({ loading: true });

    const q = query(collection(db, "categories"), orderBy("name", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const categoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          value: doc.id, // For select component
          label: doc.data().name, // For select component
        }));
        set({ categories: categoriesData, loading: false, error: null });
      },
      (error) => {
        console.error("Error fetching categories:", error);
        set({ error: "Failed to fetch categories", loading: false });
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  },
}));
