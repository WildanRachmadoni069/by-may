export const SPECIAL_LABELS = [
  { label: "Populer", value: "popular" },
  { label: "Baru", value: "new" },
  { label: "Paling Laku", value: "best-seller" },
  { label: "Favorit", value: "favorite" },
] as const;

export const CATEGORIES = [
  { label: "Al-Quran", value: "quran" },
  { label: "Sajadah", value: "prayer-rug" },
  { label: "Tasbih", value: "prayer-beads" },
  { label: "Hampers", value: "hampers" },
] as const;

export type SpecialLabel = (typeof SPECIAL_LABELS)[number]["value"];
export type ProductCategory = (typeof CATEGORIES)[number]["value"];
