/**
 * Definisi tipe untuk item keranjang belanja
 */
export interface CartItem {
  /** ID unik item keranjang */
  id?: string;
  /** ID pengguna pemilik keranjang */
  userId: string;
  /** ID produk */
  productId: string;
  /** ID varian harga (jika produk memiliki variasi) */
  priceVariantId?: string | null;
  /** Jumlah produk */
  quantity: number;
  /** Data produk (untuk tampilan) */
  product?: {
    name: string;
    slug: string;
    featuredImage?: {
      url: string;
      alt: string;
    } | null;
  };
  /** Data varian harga (untuk tampilan) */
  priceVariant?: {
    price: number;
    stock: number;
    options: Array<{
      option: {
        id: string;
        name: string;
        imageUrl?: string;
        variation: {
          id: string;
          name: string;
        };
      };
    }>;
  };
  /** Waktu pembuatan */
  createdAt?: Date;
  /** Waktu update terakhir */
  updatedAt?: Date;
}

export interface CartStore {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  initializeCart: () => Promise<void>;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (productId: string, variationKey?: string) => Promise<void>;
  updateQuantity: (
    productId: string,
    quantity: number,
    variationKey?: string
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export interface CartData {
  items: CartItem[];
}

/**
 * Input untuk menambahkan item ke keranjang
 */
export interface AddToCartInput {
  /** ID produk */
  productId: string;
  /** ID varian harga (untuk produk dengan variasi) */
  priceVariantId?: string | null;
  /** Jumlah produk */
  quantity: number;
}

/**
 * Input untuk mengubah jumlah item di keranjang
 */
export interface UpdateCartItemInput {
  /** ID item keranjang */
  id: string;
  /** Jumlah produk baru */
  quantity: number;
}

/**
 * Ringkasan keranjang untuk tampilan
 */
export interface CartSummary {
  /** Jumlah total item di keranjang */
  totalItems: number;
  /** Total harga semua item di keranjang */
  totalAmount: number;
}
