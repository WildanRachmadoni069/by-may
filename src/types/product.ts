export interface Image {
  url: string;
  alt: string;
}

export interface Dimensions {
  width: number;
  length: number;
  height: number;
}

export interface Meta {
  title: string;
  description: string;
  ogImage?: string;
}

export interface ProductVariationOption {
  id: string;
  variationId: string;
  name: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariation {
  id: string;
  productId: string;
  name: string;
  options: ProductVariationOption[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceVariantToOption {
  priceVariantId: string;
  optionId: string;
  option: ProductVariationOption;
}

export interface PriceVariant {
  id: string;
  productId: string;
  price: number;
  stock: number;
  sku?: string;
  options: PriceVariantToOption[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  featuredImage?: Image;
  additionalImages: Image[];
  basePrice?: number;
  baseStock?: number;
  hasVariations: boolean;
  specialLabel?: string;
  weight?: number;
  dimensions?: Dimensions;
  meta?: Meta;
  categoryId?: string;
  collectionId?: string;
  variations: ProductVariation[];
  priceVariants: PriceVariant[];
  createdAt: Date;
  updatedAt: Date;
}

// Form submission types
export interface CreateProductInput {
  name: string;
  slug: string;
  description?: string | null;
  featuredImage?: Image | null;
  additionalImages?: Image[] | null;
  basePrice?: number | null;
  baseStock?: number | null;
  hasVariations: boolean;
  specialLabel?: string | null;
  weight?: number | null;
  dimensions?: Dimensions | null;
  meta?: Meta | null;
  categoryId?: string | null;
  collectionId?: string | null;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

// Types for product variation management
export interface CreateVariationInput {
  productId: string;
  name: string;
  options: { name: string; imageUrl?: string }[];
}

export interface UpdateVariationInput {
  id: string;
  name?: string;
  options?: { id?: string; name: string; imageUrl?: string }[];
}

export interface CreatePriceVariantInput {
  productId: string;
  price: number;
  stock: number;
  sku?: string;
  optionIds: string[]; // IDs of the selected options
}

export interface UpdatePriceVariantInput {
  id: string;
  price?: number;
  stock?: number;
  sku?: string;
  optionIds?: string[];
}
