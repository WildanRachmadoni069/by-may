export interface ProductOption {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface ProductVariation {
  id: string;
  name: string;
  options: ProductOption[];
}

export interface ProductDimensions {
  width: number;
  length: number;
  height: number;
}

export interface VariationPrice {
  price: number;
  stock: number;
}

export interface ProductSEO {
  title: string;
  description: string;
  keywords: string[];
}

// Type for combination components used in the UI
export interface VariationCombination {
  id: string;
  name: string;
  components: Array<{ variationId: string; optionId: string }>;
}

// Interface for form field options - make imageUrl consistently nullable
export interface VariationFormOption {
  id: string;
  name: string;
  imageUrl?: string | null; // Ensure consistent typing with both undefined and null
}

// Interface for variation form data
export interface VariationFormData {
  name: string;
  options: VariationFormOption[];
}

export interface ProductFormValues {
  id?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  specialLabel: string;
  mainImage: string | null;
  additionalImages: (string | null)[];
  hasVariations: boolean;
  basePrice?: number;
  baseStock?: number;
  variations: ProductVariation[];
  variationPrices: Record<string, VariationPrice>;
  weight: number;
  dimensions: ProductDimensions;
  seo: ProductSEO;
  collection?: string;
  searchKeywords?: string[];
}

export interface GetProductsOptions {
  category?: string;
  collection?: string;
  sortBy?: string;
  itemsPerPage?: number;
  lastDoc?: any;
  searchQuery?: string;
}

export interface Product extends ProductFormValues {
  id: string;
  createdAt: any;
  updatedAt: any;
}

export interface FilteredProductsResponse {
  products: Product[];
  lastDoc: any;
  hasMore: boolean;
}
