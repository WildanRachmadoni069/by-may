import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types/cart";

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;

  // Methods
  initializeCart: () => Promise<void>;
  addItem: (item: CartItem) => Promise<void>;
  updateQuantity: (
    productId: string,
    quantity: number,
    variationKey?: string
  ) => Promise<void>;
  removeItem: (productId: string, variationKey?: string) => Promise<void>;
  clearCart: () => void;

  // Getters
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: true,
      error: null,

      initializeCart: async () => {
        set({ loading: false });
      },

      addItem: async (item: CartItem) => {
        const { items } = get();

        // Check if item already exists
        const existingItemIndex = items.findIndex(
          (cartItem) =>
            cartItem.productId === item.productId &&
            (item.variationKey
              ? cartItem.variationKey === item.variationKey
              : true)
        );

        if (existingItemIndex !== -1) {
          // Update quantity if item exists
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += item.quantity;

          set({ items: updatedItems });
        } else {
          // Add new item
          set({ items: [...items, item] });
        }
      },

      updateQuantity: async (
        productId: string,
        quantity: number,
        variationKey?: string
      ) => {
        const { items } = get();

        const updatedItems = items.map((item) => {
          // Match both product ID and variation key (if any)
          if (
            item.productId === productId &&
            (variationKey
              ? item.variationKey === variationKey
              : !item.variationKey)
          ) {
            return { ...item, quantity };
          }
          return item;
        });

        set({ items: updatedItems });
      },

      removeItem: async (productId: string, variationKey?: string) => {
        const { items } = get();

        const filteredItems = items.filter(
          (item) =>
            !(
              item.productId === productId &&
              (variationKey
                ? item.variationKey === variationKey
                : !item.variationKey)
            )
        );

        set({ items: filteredItems });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
