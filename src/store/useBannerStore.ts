import { create } from "zustand";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  url: string;
  active: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface BannerStore {
  // State
  banners: Banner[];
  loading: boolean;
  error: string | null;

  // Getters
  getActiveBanners: () => Banner[];

  // Actions
  fetchBanners: () => Promise<void>;
  getBanner: (id: string) => Promise<Banner | null>;
  addBanner: (banner: Omit<Banner, "id">) => Promise<Banner>;
  updateBanner: (id: string, banner: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  resetError: () => void;
}

export const useBannerStore = create<BannerStore>((set, get) => ({
  banners: [],
  loading: false,
  error: null,

  // Get only active banners (for frontend display)
  getActiveBanners: () => {
    return get().banners.filter((banner) => banner.active);
  },

  // Fetch all banners from Firestore
  fetchBanners: async () => {
    set({ loading: true, error: null });
    try {
      const bannersRef = collection(db, "banners");
      const bannersSnapshot = await getDocs(bannersRef);

      const fetchedBanners = bannersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Banner[];

      set({ banners: fetchedBanners, loading: false });
    } catch (error) {
      console.error("Error fetching banners:", error);
      set({
        error: "Failed to fetch banners",
        loading: false,
      });
    }
  },

  // Get a single banner by ID
  getBanner: async (id) => {
    try {
      // Check if banner already exists in state
      const existingBanner = get().banners.find((banner) => banner.id === id);
      if (existingBanner) return existingBanner;

      // Otherwise fetch from Firestore
      const bannerRef = doc(db, "banners", id);
      const bannerDoc = await getDoc(bannerRef);

      if (bannerDoc.exists()) {
        const data = bannerDoc.data();
        return {
          id,
          title: data.title || "",
          imageUrl: data.imageUrl || "",
          url: data.url || "",
          active: data.active ?? true,
          ...(data.createdAt && { createdAt: data.createdAt }),
          ...(data.updatedAt && { updatedAt: data.updatedAt }),
        } as Banner;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching banner ${id}:`, error);
      set({
        error: `Failed to fetch banner: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
      return null;
    }
  },

  // Add a new banner
  addBanner: async (banner) => {
    try {
      const bannersRef = collection(db, "banners");
      const docRef = await addDoc(bannersRef, {
        ...banner,
        createdAt: new Date(),
      });

      const newBanner = {
        id: docRef.id,
        ...banner,
        createdAt: new Date(),
      };

      set((state) => ({
        banners: [...state.banners, newBanner],
      }));

      return newBanner;
    } catch (error) {
      console.error("Error adding banner:", error);
      set({ error: `Failed to add banner: ${error}` });
      throw error;
    }
  },

  // Update an existing banner
  updateBanner: async (id, bannerData) => {
    try {
      const bannerRef = doc(db, "banners", id);
      const updateData = {
        ...bannerData,
        updatedAt: new Date(),
      };

      await updateDoc(bannerRef, updateData);

      set((state) => ({
        banners: state.banners.map((banner) =>
          banner.id === id
            ? { ...banner, ...bannerData, updatedAt: new Date() }
            : banner
        ),
      }));
    } catch (error) {
      console.error(`Error updating banner ${id}:`, error);
      set({ error: `Failed to update banner: ${error}` });
      throw error;
    }
  },

  // Delete a banner
  deleteBanner: async (id) => {
    try {
      await deleteDoc(doc(db, "banners", id));

      set((state) => ({
        banners: state.banners.filter((banner) => banner.id !== id),
      }));
    } catch (error) {
      console.error(`Error deleting banner ${id}:`, error);
      set({ error: `Failed to delete banner: ${error}` });
      throw error;
    }
  },

  // Reset error state
  resetError: () => set({ error: null }),
}));
