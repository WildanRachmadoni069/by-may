export const SPECIAL_LABELS = [
  { value: "none", label: "Tidak Ada" }, // Changed from empty string to "none"
  { value: "new", label: "Produk Baru" },
  { value: "best", label: "Best Seller" },
  { value: "sale", label: "Diskon" },
] as const;

// Remove or comment out CATEGORIES constant
// export const CATEGORIES = [...];

// export const CATEGORIES = [
//   { label: "Al-Quran", value: "quran" },
//   { label: "Sajadah", value: "prayer-rug" },
//   { label: "Tasbih", value: "prayer-beads" },
//   { label: "Hampers", value: "hampers" },
// ] as const;

export type SpecialLabel = (typeof SPECIAL_LABELS)[number]["value"];
// export type ProductCategory = (typeof CATEGORIES)[number]["value"];
