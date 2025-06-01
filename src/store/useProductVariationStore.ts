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

  // Menambahkan fungsi untuk impor varian harga
  importPriceVariants: (priceVariants: PriceVariantItem[]) => void;
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
      }), // Mengatur ulang semua variasi dan state terkait
    resetVariations: () =>
      set({
        variations: [],
        hasVariations: false,
        openVariationForms: [],
        priceVariants: [],
      }),

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
      const { variations, hasVariations } = get();

      // Validasi state
      if (!hasVariations || !variations || variations.length === 0) {
        set({ priceVariants: [] });
        return;
      }

      // Validasi bahwa semua variasi memiliki nama dan opsi yang valid
      const invalidVariations = variations.filter(
        (v) =>
          !v.name ||
          !v.options ||
          v.options.length === 0 ||
          v.options.some((o) => !o.name)
      );
      if (invalidVariations.length > 0) {
        console.warn("Found invalid variations:", invalidVariations);
        return;
      }

      // Simpan varian harga yang sudah ada
      const existingPriceVariants = [...get().priceVariants];

      // Fungsi pembantu untuk membuat label yang readable
      const createLabel = (
        variation: Variation,
        option: VariationOption
      ): string => {
        return `${variation.name}: ${option.name}`;
      };

      // Fungsi rekursif untuk generate kombinasi
      const generateCombinations = (
        currentIndex: number = 0,
        currentCombination: string[] = [],
        currentLabels: string[] = []
      ): Array<{ combination: string[]; labels: string[] }> => {
        if (currentIndex >= variations.length) {
          return [{ combination: currentCombination, labels: currentLabels }];
        }

        const currentVariation = variations[currentIndex];
        const results: Array<{ combination: string[]; labels: string[] }> = [];

        // Iterasi melalui opsi untuk variasi saat ini
        for (const option of currentVariation.options) {
          if (!option.name) continue;

          const optionId = option.id || `temp-${Date.now()}-${option.name}`;
          const label = createLabel(currentVariation, option);

          // Generate kombinasi untuk level berikutnya
          const nextCombinations = generateCombinations(
            currentIndex + 1,
            [...currentCombination, optionId],
            [...currentLabels, label]
          );

          results.push(...nextCombinations);
        }

        return results;
      };

      // Generate kombinasi baru
      const combinations = generateCombinations();

      // Map kombinasi ke price variants
      const newPriceVariants = combinations.map(({ combination, labels }) => {
        const combinationKey = combination.join("|");
        const existingVariant = existingPriceVariants.find(
          (pv) => pv.optionCombination.join("|") === combinationKey
        );

        // Buat variant baru, pertahankan nilai yang sudah ada jika ada
        const variant = {
          id: existingVariant?.id,
          optionCombination: combination,
          optionLabels: labels,
          price: existingVariant?.price ?? null,
          stock: existingVariant?.stock ?? null,
          sku: existingVariant?.sku,
        };

        return variant;
      });

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

    // Import price variants for edit mode
    importPriceVariants: (priceVariants) => {
      set({ priceVariants });
    },
  })
);
