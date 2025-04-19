import { create } from "zustand";
import {
  BannerData,
  BannerCreateInput,
  BannerUpdateInput,
} from "@/types/banner";
import {
  createBanner,
  deleteBanner,
  getBanners,
  updateBanner,
} from "@/lib/api/banners";

interface BannerState {
  banners: BannerData[];
  loading: boolean;
  error: string | null;
  fetchBanners: () => Promise<void>;
  createBanner: (data: BannerCreateInput) => Promise<BannerData>;
  updateBanner: (id: string, data: BannerUpdateInput) => Promise<BannerData>;
  deleteBanner: (id: string) => Promise<void>;
  getActiveBanners: () => BannerData[];
}

export const useBannerStore = create<BannerState>((set, get) => ({
  banners: [],
  loading: false,
  error: null,

  fetchBanners: async () => {
    try {
      set({ loading: true, error: null });
      const banners = await getBanners();
      set({ banners, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch banners",
        loading: false,
      });
    }
  },

  createBanner: async (data: BannerCreateInput) => {
    try {
      set({ loading: true, error: null });
      const newBanner = await createBanner(data);
      set((state) => ({
        banners: [newBanner, ...state.banners],
        loading: false,
      }));
      return newBanner;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create banner",
        loading: false,
      });
      throw error;
    }
  },

  updateBanner: async (id: string, data: BannerUpdateInput) => {
    try {
      set({ loading: true, error: null });
      const updatedBanner = await updateBanner(id, data);
      set((state) => ({
        banners: state.banners.map((banner) =>
          banner.id === id ? updatedBanner : banner
        ),
        loading: false,
      }));
      return updatedBanner;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update banner",
        loading: false,
      });
      throw error;
    }
  },

  deleteBanner: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await deleteBanner(id);
      set((state) => ({
        banners: state.banners.filter((banner) => banner.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete banner",
        loading: false,
      });
      throw error;
    }
  },

  getActiveBanners: () => {
    return get().banners.filter((banner) => banner.active);
  },
}));
