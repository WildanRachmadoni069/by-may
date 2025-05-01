/**
 * Store Variasi Produk
 *
 * Store ini mengelola state variasi produk, opsi variasi, dan varian harga
 * untuk digunakan dalam formulir pembuatan dan pengeditan produk.
 */

import { create } from "zustand";

/**
 * Tipe data untuk opsi variasi
 */
export interface VariationOption {
  /** ID opsi, opsional untuk opsi baru */
  id?: string;
  /** Nama opsi (contoh: "Merah", "XL") */
  name: string;
  /** URL gambar opsi, opsional */
  imageUrl?: string;
}

/**
 * Tipe data untuk variasi produk
 */
export interface Variation {
  /** ID variasi, opsional untuk variasi baru */
  id?: string;
  /** Nama variasi (contoh: "Warna", "Ukuran") */
  name: string;
  /** Daftar opsi dalam variasi ini */
  options: VariationOption[];
}

/**
 * Tipe data untuk varian harga
 */
export interface PriceVariant {
  /** ID varian harga, opsional untuk varian baru */
  id?: string;
  /** ID-ID opsi yang membentuk kombinasi ini */
  optionIds: string[];
  /** Harga varian */
  price: number;
  /** Stok varian */
  stock: number;
  /** Kode SKU opsional */
  sku?: string;
}

/**
 * Tipe data untuk item varian harga yang digunakan dalam UI
 */
export interface PriceVariantItem {
  /** ID varian harga, opsional untuk varian baru */
  id?: string;
  /** Array ID atau nama opsi yang membentuk kombinasi ini */
  optionCombination: string[];
  /** Label yang dapat dibaca untuk tampilan UI */
  optionLabels: string[];
  /** Harga varian */
  price: number | null;
  /** Stok varian */
  stock: number | null;
  /** Kode SKU varian */
  sku?: string;
}

/**
 * Interface untuk state store variasi produk
 */
interface ProductVariationState {
  /** Menunjukkan apakah produk memiliki variasi */
  hasVariations: boolean;
  /** Daftar variasi produk */
  variations: Variation[];
  /** Indeks variasi yang sedang dalam mode edit */
  openVariationForms: number[];
  /** Daftar varian harga beserta kombinasi opsinya */
  priceVariants: PriceVariantItem[];

  // Aksi-aksi yang dapat dilakukan pada store
  /** Mengatur status memiliki variasi */
  setHasVariations: (hasVariations: boolean) => void;
  /** Menambahkan variasi baru */
  addVariation: () => void;
  /** Memperbarui variasi yang ada */
  updateVariation: (index: number, variation: Partial<Variation>) => void;
  /** Menghapus variasi */
  removeVariation: (index: number) => void;
  /** Menambahkan opsi baru ke variasi */
  addOptionToVariation: (variationIndex: number) => void;
  /** Memperbarui opsi dalam variasi */
  updateOptionInVariation: (
    variationIndex: number,
    optionIndex: number,
    option: Partial<VariationOption>
  ) => void;
  /** Menghapus opsi dari variasi */
  removeOptionFromVariation: (
    variationIndex: number,
    optionIndex: number
  ) => void;
  /** Mengatur ulang semua variasi */
  resetVariations: () => void;
  /** Mengimpor variasi dari sumber eksternal */
  importVariations: (variations: Variation[]) => void;
  /** Mengatur status formulir variasi terbuka/tertutup */
  setVariationFormOpen: (index: number, isOpen: boolean) => void;

  /** Menghasilkan varian harga berdasarkan kombinasi opsi */
  generatePriceVariants: () => void;
  /** Memperbarui varian harga */
  updatePriceVariant: (
    combinationKey: string,
    data: Partial<PriceVariantItem>
  ) => void;
}

/**
 * Store Zustand untuk mengelola variasi produk dan varian harga
 */
export const useProductVariationStore = create<ProductVariationState>(
  (set, get) => ({
    // State awal
    hasVariations: false,
    variations: [],
    openVariationForms: [],
    priceVariants: [],

    // Mengaktifkan atau menonaktifkan variasi
    setHasVariations: (hasVariations) =>
      set((state) => {
        // Jika mengaktifkan variasi dan belum ada variasi, buat satu variasi awal
        if (hasVariations && state.variations.length === 0) {
          return {
            hasVariations,
            variations: [{ name: "", options: [{ name: "" }] }],
          };
        }

        // Jika menonaktifkan variasi, hapus varian harga
        if (!hasVariations) {
          return {
            hasVariations,
            priceVariants: [],
          };
        }

        return { hasVariations };
      }),

    // Menambahkan variasi baru (dibatasi hingga 2 variasi)
    addVariation: () =>
      set((state) => {
        if (state.variations.length >= 2) return state;

        return {
          variations: [
            ...state.variations,
            { name: "", options: [{ name: "" }] },
          ],
        };
      }),

    // Memperbarui properti variasi
    updateVariation: (index, variation) =>
      set((state) => {
        const newVariations = [...state.variations];
        if (index >= 0 && index < newVariations.length) {
          newVariations[index] = { ...newVariations[index], ...variation };
        }
        return { variations: newVariations };
      }),

    // Menghapus variasi
    removeVariation: (index) =>
      set((state) => {
        const newVariations = [...state.variations];
        if (index >= 0 && index < newVariations.length) {
          newVariations.splice(index, 1);

          // Jika menghapus variasi terakhir, nonaktifkan hasVariations
          if (newVariations.length === 0) {
            return { variations: newVariations, hasVariations: false };
          }

          return { variations: newVariations };
        }
        return state;
      }),

    // Menambahkan opsi baru ke variasi
    addOptionToVariation: (variationIndex) =>
      set((state) => {
        const newVariations = [...state.variations];
        if (variationIndex >= 0 && variationIndex < newVariations.length) {
          newVariations[variationIndex] = {
            ...newVariations[variationIndex],
            options: [...newVariations[variationIndex].options, { name: "" }],
          };
          return { variations: newVariations };
        }
        return state;
      }),

    // Memperbarui opsi dalam variasi
    updateOptionInVariation: (variationIndex, optionIndex, option) =>
      set((state) => {
        const newVariations = [...state.variations];
        if (
          variationIndex >= 0 &&
          variationIndex < newVariations.length &&
          optionIndex >= 0 &&
          optionIndex < newVariations[variationIndex].options.length
        ) {
          const newOptions = [...newVariations[variationIndex].options];
          newOptions[optionIndex] = {
            ...newOptions[optionIndex],
            ...option,
          };

          newVariations[variationIndex] = {
            ...newVariations[variationIndex],
            options: newOptions,
          };

          return { variations: newVariations };
        }
        return state;
      }),

    // Menghapus opsi dari variasi
    removeOptionFromVariation: (variationIndex, optionIndex) =>
      set((state) => {
        const newVariations = [...state.variations];
        if (
          variationIndex >= 0 &&
          variationIndex < newVariations.length &&
          optionIndex >= 0 &&
          optionIndex < newVariations[variationIndex].options.length
        ) {
          // Jangan hapus jika ini adalah opsi terakhir
          if (newVariations[variationIndex].options.length <= 1) {
            return state;
          }

          const newOptions = [...newVariations[variationIndex].options];
          newOptions.splice(optionIndex, 1);

          newVariations[variationIndex] = {
            ...newVariations[variationIndex],
            options: newOptions,
          };

          return { variations: newVariations };
        }
        return state;
      }),

    // Mengatur ulang semua variasi
    resetVariations: () => set({ variations: [], hasVariations: false }),

    // Mengimpor variasi dari sumber eksternal
    importVariations: (variations) =>
      set({
        variations,
        hasVariations: variations.length > 0,
      }),

    // Mengatur status formulir variasi terbuka/tertutup
    setVariationFormOpen: (index, isOpen) =>
      set((state) => {
        if (isOpen && !state.openVariationForms.includes(index)) {
          return { openVariationForms: [...state.openVariationForms, index] };
        }
        if (!isOpen && state.openVariationForms.includes(index)) {
          return {
            openVariationForms: state.openVariationForms.filter(
              (i) => i !== index
            ),
          };
        }
        return state;
      }),

    // Menghasilkan varian harga berdasarkan kombinasi opsi yang ada
    generatePriceVariants: () => {
      const { variations } = get();

      // Jika tidak ada variasi, jangan hasilkan varian harga
      if (variations.length === 0) {
        set({ priceVariants: [] });
        return;
      }

      // Dapatkan varian harga yang sudah ada untuk mempertahankan nilai
      const existingPriceVariants = get().priceVariants;

      // Fungsi pembantu untuk menghasilkan kombinasi opsi secara rekursif
      const generateCombinations = (
        currentVariationIndex: number,
        currentCombination: string[] = [],
        currentLabels: string[] = []
      ): { combination: string[]; labels: string[] }[] => {
        // Kasus dasar: jika semua variasi telah diproses, kembalikan kombinasi saat ini
        if (currentVariationIndex >= variations.length) {
          return [{ combination: currentCombination, labels: currentLabels }];
        }

        const currentVariation = variations[currentVariationIndex];
        let results: { combination: string[]; labels: string[] }[] = [];

        // Untuk setiap opsi dalam variasi saat ini, buat kombinasi baru
        currentVariation.options.forEach((option) => {
          // Gunakan ID yang sebenarnya jika tersedia, jika tidak buat ID sementara
          const optionId =
            option.id || `temp-${currentVariation.name}-${option.name}`;
          const optionLabel = `${currentVariation.name}: ${option.name}`;

          // Secara rekursif hasilkan kombinasi untuk level variasi berikutnya
          const nextCombinations = generateCombinations(
            currentVariationIndex + 1,
            [...currentCombination, optionId],
            [...currentLabels, optionLabel]
          );

          results = [...results, ...nextCombinations];
        });

        return results;
      };

      // Hasilkan semua kombinasi yang mungkin
      const allCombinations = generateCombinations(0);

      // Petakan ke objek varian harga, pertahankan nilai yang sudah ada
      const newPriceVariants = allCombinations.map(
        ({ combination, labels }) => {
          // Buat kunci unik untuk kombinasi ini
          const combinationKey = combination.join("|");

          // Temukan varian harga yang ada dengan kombinasi yang sama
          const existingVariant = existingPriceVariants.find(
            (pv) => pv.optionCombination.join("|") === combinationKey
          );

          // Gunakan nilai yang ada atau default
          return {
            id: existingVariant?.id,
            optionCombination: combination,
            optionLabels: labels,
            price: existingVariant?.price ?? null,
            stock: existingVariant?.stock ?? null,
            sku: existingVariant?.sku,
          };
        }
      );

      set({ priceVariants: newPriceVariants });
    },

    // Perbarui varian harga tertentu berdasarkan kunci kombinasi
    updatePriceVariant: (combinationKey, data) => {
      set((state) => {
        const updatedVariants = state.priceVariants.map((variant) => {
          if (variant.optionCombination.join("|") === combinationKey) {
            return { ...variant, ...data };
          }
          return variant;
        });

        return { priceVariants: updatedVariants };
      });
    },
  })
);
