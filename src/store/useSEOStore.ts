/**
 * Store SEO Settings
 *
 * Store ini mengelola state pengaturan SEO untuk digunakan di seluruh aplikasi,
 * terutama untuk state UI di halaman admin SEO. Untuk fetching data,
 * gunakan hooks useSEOSettings dan useSEOSetting.
 */

import { create } from "zustand";
import { SEOSetting, UpdateSEOSettingInput } from "@/types/seo";

/**
 * Interface untuk state store SEO
 */
interface SEOState {
  /** Status loading */
  loading: boolean;
  /** Pesan error */
  error: string | null;
  /** Pengaturan SEO untuk halaman tertentu */
  currentSEOSetting: SEOSetting | null;

  /** Mengatur pengaturan SEO saat ini */
  setCurrentSEOSetting: (seoSetting: SEOSetting | null) => void;
  /** Mengatur status loading */
  setLoading: (isLoading: boolean) => void;
  /** Mengatur pesan error */
  setError: (error: string | null) => void;
  /** Memperbarui pengaturan SEO secara parsial (hanya nilai yang berubah) */
  updateCurrentSEOSetting: (updates: Partial<UpdateSEOSettingInput>) => void;
  /** Mengatur ulang state */
  reset: () => void;
}

/**
 * Store Zustand untuk mengelola state UI pengaturan SEO
 */
export const useSEOStore = create<SEOState>((set) => ({
  loading: false,
  error: null,
  currentSEOSetting: null,

  /**
   * Mengatur pengaturan SEO saat ini
   */
  setCurrentSEOSetting: (seoSetting) => {
    set({ currentSEOSetting: seoSetting });
  },

  /**
   * Mengatur status loading
   */
  setLoading: (isLoading) => {
    set({ loading: isLoading });
  },

  /**
   * Mengatur pesan error
   */
  setError: (error) => {
    set({ error });
  },

  /**
   * Memperbarui pengaturan SEO secara parsial
   */
  updateCurrentSEOSetting: (updates) => {
    set((state) => {
      if (!state.currentSEOSetting) return state;

      return {
        currentSEOSetting: {
          ...state.currentSEOSetting,
          ...updates,
        },
      };
    });
  },

  /**
   * Mengatur ulang state
   */
  reset: () => {
    set({
      loading: false,
      error: null,
      currentSEOSetting: null,
    });
  },
}));
