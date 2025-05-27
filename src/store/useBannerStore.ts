/**
 * Banner Store
 *
 * Store Zustand untuk pengelolaan state banner di sisi klien
 */

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

/**
 * Tipe untuk status filter banner
 */
export type BannerFilterStatus = "all" | "active" | "inactive";

/**
 * Interface untuk state banner
 */
interface BannerState {
  /** Daftar banner */
  banners: BannerData[];
  /** Status loading */
  loading: boolean;
  /** Pesan error */
  error: string | null;
  /** State filter */
  filter: {
    status: BannerFilterStatus;
  };
  /** Banner yang sedang dihapus (ID banner: boolean) */
  deletingBanners: Record<string, boolean>;

  /** Mengambil daftar banner */
  fetchBanners: () => Promise<void>;
  /** Membuat banner baru */
  createBanner: (data: BannerCreateInput) => Promise<BannerData>;
  /** Memperbarui banner */
  updateBanner: (id: string, data: BannerUpdateInput) => Promise<BannerData>;
  /** Menghapus banner */
  deleteBanner: (id: string) => Promise<void>;
  /** Mendapatkan banner yang aktif */
  getActiveBanners: () => BannerData[];
  /** Mendapatkan banner yang difilter berdasarkan status */
  getFilteredBanners: () => BannerData[];
  /** Mengatur filter status */
  setFilterStatus: (status: BannerFilterStatus) => void;
  /** Mereset filter ke default */
  resetFilter: () => void;
  /** Mengatur status deleting banner */
  setDeletingBanner: (id: string, isDeleting: boolean) => void;
}

/**
 * Zustand store untuk pengelolaan banner
 */
export const useBannerStore = create<BannerState>((set, get) => ({
  banners: [],
  loading: false,
  error: null,
  filter: {
    status: "all",
  },
  deletingBanners: {},

  /**
   * Mengambil data banner dari API
   */
  fetchBanners: async () => {
    try {
      set({ loading: true, error: null });
      const banners = await getBanners();
      set({ banners, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Gagal mengambil banner",
        loading: false,
      });
    }
  },

  /**
   * Membuat banner baru
   * @param data Data banner yang akan dibuat
   * @returns Banner yang dibuat
   */
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
        error: error instanceof Error ? error.message : "Gagal membuat banner",
        loading: false,
      });
      throw error;
    }
  },

  /**
   * Memperbarui banner yang sudah ada
   * @param id ID banner yang akan diperbarui
   * @param data Data banner yang diperbarui
   * @returns Banner yang diperbarui
   */
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
          error instanceof Error ? error.message : "Gagal memperbarui banner",
        loading: false,
      });
      throw error;
    }
  },

  /**
   * Menghapus banner
   * @param id ID banner yang akan dihapus
   */
  deleteBanner: async (id: string) => {
    try {
      set((state) => ({
        deletingBanners: { ...state.deletingBanners, [id]: true },
      }));
      await deleteBanner(id);
      set((state) => ({
        banners: state.banners.filter((banner) => banner.id !== id),
        deletingBanners: { ...state.deletingBanners, [id]: false },
      }));
    } catch (error) {
      set((state) => ({
        error:
          error instanceof Error ? error.message : "Gagal menghapus banner",
        deletingBanners: { ...state.deletingBanners, [id]: false },
      }));
      throw error;
    }
  },

  /**
   * Mendapatkan banner yang aktif saja
   * @returns Array banner yang aktif
   */
  getActiveBanners: () => {
    return get().banners.filter((banner) => banner.active);
  },

  /**
   * Mendapatkan banner yang difilter berdasarkan status
   * @returns Array banner yang difilter
   */
  getFilteredBanners: () => {
    const { banners, filter } = get();
    if (filter.status === "all") return banners;
    return banners.filter((banner) =>
      filter.status === "active" ? banner.active : !banner.active
    );
  },

  /**
   * Mengatur filter status
   * @param status Status filter
   */
  setFilterStatus: (status) => {
    set((state) => ({
      filter: { ...state.filter, status },
    }));
  },

  /**
   * Mereset filter ke default
   */
  resetFilter: () => {
    set({
      filter: { status: "all" },
    });
  },

  /**
   * Mengatur status deleting banner
   * @param id ID banner
   * @param isDeleting Status penghapusan
   */
  setDeletingBanner: (id, isDeleting) => {
    set((state) => ({
      deletingBanners: { ...state.deletingBanners, [id]: isDeleting },
    }));
  },
}));
