export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedOptions?: Record<string, string>;
  variationKey?: string;
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
