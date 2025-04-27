import { create } from "zustand";

// Type definitions for variations
export interface VariationOption {
  id?: string;
  name: string;
  imageUrl?: string;
}

export interface Variation {
  id?: string;
  name: string;
  options: VariationOption[];
}

export interface PriceVariant {
  id?: string;
  optionIds: string[];
  price: number;
  stock: number;
  sku?: string;
}

// Add these types to the store
export interface PriceVariantItem {
  id?: string;
  optionCombination: string[]; // Array of option IDs or names that make up this combination
  optionLabels: string[]; // Human-readable labels for display
  price: number | null;
  stock: number | null;
  sku?: string;
}

interface ProductVariationState {
  // State
  hasVariations: boolean;
  variations: Variation[];
  openVariationForms: number[]; // Track which variation forms are open
  priceVariants: PriceVariantItem[];

  // Actions
  setHasVariations: (hasVariations: boolean) => void;
  addVariation: () => void;
  updateVariation: (index: number, variation: Partial<Variation>) => void;
  removeVariation: (index: number) => void;
  addOptionToVariation: (variationIndex: number) => void;
  updateOptionInVariation: (
    variationIndex: number,
    optionIndex: number,
    option: Partial<VariationOption>
  ) => void;
  removeOptionFromVariation: (
    variationIndex: number,
    optionIndex: number
  ) => void;
  resetVariations: () => void;
  importVariations: (variations: Variation[]) => void;
  setVariationFormOpen: (index: number, isOpen: boolean) => void;

  // New actions for price variant management
  generatePriceVariants: () => void;
  updatePriceVariant: (
    combinationKey: string,
    data: Partial<PriceVariantItem>
  ) => void;
}

export const useProductVariationStore = create<ProductVariationState>(
  (set, get) => ({
    // Initial state
    hasVariations: false,
    variations: [],
    openVariationForms: [],
    priceVariants: [],

    // Toggle variations on/off
    setHasVariations: (hasVariations) =>
      set((state) => {
        // If turning on variations and none exist, create an initial one
        if (hasVariations && state.variations.length === 0) {
          return {
            hasVariations,
            variations: [{ name: "", options: [{ name: "" }] }],
          };
        }

        // If turning off variations, clear price variants
        if (!hasVariations) {
          return {
            hasVariations,
            priceVariants: [],
          };
        }

        return { hasVariations };
      }),

    // Add a new variation (limited to 2)
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

    // Update a variation's properties
    updateVariation: (index, variation) =>
      set((state) => {
        const newVariations = [...state.variations];
        if (index >= 0 && index < newVariations.length) {
          newVariations[index] = { ...newVariations[index], ...variation };
        }
        return { variations: newVariations };
      }),

    // Remove a variation
    removeVariation: (index) =>
      set((state) => {
        const newVariations = [...state.variations];
        if (index >= 0 && index < newVariations.length) {
          newVariations.splice(index, 1);

          // If removing the last variation, turn off hasVariations
          if (newVariations.length === 0) {
            return { variations: newVariations, hasVariations: false };
          }

          return { variations: newVariations };
        }
        return state;
      }),

    // Add a new option to a variation
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

    // Update an option in a variation
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

    // Remove an option from a variation
    removeOptionFromVariation: (variationIndex, optionIndex) =>
      set((state) => {
        const newVariations = [...state.variations];
        if (
          variationIndex >= 0 &&
          variationIndex < newVariations.length &&
          optionIndex >= 0 &&
          optionIndex < newVariations[variationIndex].options.length
        ) {
          // Don't remove if it's the last option
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

    // Reset all variations
    resetVariations: () => set({ variations: [], hasVariations: false }),

    // Import variations from an external source (e.g. for editing)
    importVariations: (variations) =>
      set({
        variations,
        hasVariations: variations.length > 0,
      }),

    // Toggle variation form open/closed
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

    // Generate price variants based on current variations
    generatePriceVariants: () => {
      const { variations } = get();

      // If there are no variations, don't generate price variants
      if (variations.length === 0) {
        set({ priceVariants: [] });
        return;
      }

      // Get existing price variants to preserve values
      const existingPriceVariants = get().priceVariants;

      // Helper function to generate option combinations recursively
      const generateCombinations = (
        currentVariationIndex: number,
        currentCombination: string[] = [],
        currentLabels: string[] = []
      ): { combination: string[]; labels: string[] }[] => {
        // Base case: if we've processed all variations, return the current combination
        if (currentVariationIndex >= variations.length) {
          return [{ combination: currentCombination, labels: currentLabels }];
        }

        const currentVariation = variations[currentVariationIndex];
        let results: { combination: string[]; labels: string[] }[] = [];

        // For each option in the current variation, create a new combination
        currentVariation.options.forEach((option) => {
          // Create a unique ID for the option if it doesn't have one
          const optionId =
            option.id || `temp-${currentVariation.name}-${option.name}`;
          const optionLabel = `${currentVariation.name}: ${option.name}`;

          // Recursively generate combinations for the next variation level
          const nextCombinations = generateCombinations(
            currentVariationIndex + 1,
            [...currentCombination, optionId],
            [...currentLabels, optionLabel]
          );

          results = [...results, ...nextCombinations];
        });

        return results;
      };

      // Generate all possible combinations
      const allCombinations = generateCombinations(0);

      // Map to price variant objects, preserving existing values
      const newPriceVariants = allCombinations.map(
        ({ combination, labels }) => {
          // Create a unique key for this combination
          const combinationKey = combination.join("|");

          // Find existing price variant with the same combination
          const existingVariant = existingPriceVariants.find(
            (pv) => pv.optionCombination.join("|") === combinationKey
          );

          // Use existing values or defaults
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

    // Update a specific price variant by combination key
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
