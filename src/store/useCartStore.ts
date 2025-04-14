import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/cart";
import {
  getCartItems,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from "@/utils/cart";
import useAuthStore from "@/store/useAuthStore";

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
  clearCart: () => Promise<void>;

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
        set({ loading: true });
        try {
          // Get current user from auth store
          const user = useAuthStore.getState().currentUser;

          if (user) {
            // If logged in, get cart from database
            const items = await getCartItems(user.uid);
            set({ items, loading: false });
          } else {
            // If not logged in, keep local cart (handled by persist)
            set({ loading: false });
          }
        } catch (error) {
          console.error("Error initializing cart:", error);
          set({ error: "Failed to load cart", loading: false });
        }
      },

      addItem: async (item: CartItem) => {
        try {
          const user = useAuthStore.getState().currentUser;

          if (user) {
            // Add to database if logged in
            await addToCart(user.uid, item);
            // Refresh cart
            const items = await getCartItems(user.uid);
            set({ items });
          } else {
            // Add to local state if not logged in
            const { items } = get();
            const existingIndex = items.findIndex(
              (i) =>
                i.productId === item.productId &&
                i.variationKey === item.variationKey
            );

            if (existingIndex !== -1) {
              const updatedItems = [...items];
              updatedItems[existingIndex].quantity += item.quantity;
              set({ items: updatedItems });
            } else {
              set({ items: [...items, item] });
            }
          }
        } catch (error) {
          console.error("Error adding item to cart:", error);
          set({ error: "Failed to add item to cart" });
        }
      },

      updateQuantity: async (
        productId: string,
        quantity: number,
        variationKey?: string
      ) => {
        try {
          const user = useAuthStore.getState().currentUser;

          if (user) {
            // Update in database if logged in
            await updateCartItemQuantity(
              user.uid,
              productId,
              quantity,
              variationKey
            );
            // Refresh cart
            const items = await getCartItems(user.uid);
            set({ items });
          } else {
            // Update local state if not logged in
            const { items } = get();
            const updatedItems = items.map((item) =>
              item.productId === productId && item.variationKey === variationKey
                ? { ...item, quantity }
                : item
            );
            set({ items: updatedItems });
          }
        } catch (error) {
          console.error("Error updating item quantity:", error);
          set({ error: "Failed to update quantity" });
        }
      },

      removeItem: async (productId: string, variationKey?: string) => {
        try {
          const user = useAuthStore.getState().currentUser;

          if (user) {
            // Remove from database if logged in
            await removeFromCart(user.uid, productId, variationKey);
            // Refresh cart
            const items = await getCartItems(user.uid);
            set({ items });
          } else {
            // Remove from local state if not logged in
            const { items } = get();
            const filteredItems = items.filter(
              (item) =>
                !(
                  item.productId === productId &&
                  item.variationKey === variationKey
                )
            );
            set({ items: filteredItems });
          }
        } catch (error) {
          console.error("Error removing item from cart:", error);
          set({ error: "Failed to remove item" });
        }
      },

      clearCart: async () => {
        try {
          const user = useAuthStore.getState().currentUser;

          if (user) {
            // Clear from database if logged in
            await clearCart(user.uid);
          }

          // Always clear local state
          set({ items: [] });
        } catch (error) {
          console.error("Error clearing cart:", error);
          set({ error: "Failed to clear cart" });
        }
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
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        // Only persist items for guest users
        items: useAuthStore.getState().currentUser ? [] : state.items,
      }),
    }
  )
);
