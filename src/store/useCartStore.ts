import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CartItem,
  CartSummary,
  AddToCartInput,
  UpdateCartItemInput,
} from "@/types/cart";
import { calculateCartSummary } from "@/utils/cart";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "@/lib/api/cart";
import useAuthStore from "@/store/useAuthStore";

interface CartState {
  // State
  items: CartItem[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  summary: CartSummary;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (item: AddToCartInput) => Promise<CartItem>;
  updateItemQuantity: (input: UpdateCartItemInput) => Promise<CartItem>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => void;
  clearError: () => void;
  setInitialized: (value: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isLoading: false,
      isInitialized: false,
      error: null,
      summary: { totalItems: 0, totalAmount: 0 },

      // Actions
      fetchCart: async () => {
        // Get current auth state
        const user = useAuthStore.getState().currentUser;

        // Skip fetching if not logged in
        if (!user) {
          set({ isInitialized: true });
          return;
        }

        try {
          set({ isLoading: true, error: null });
          const items = await getCart();
          const summary = calculateCartSummary(items);
          set({ items, summary, isLoading: false, isInitialized: true });
        } catch (error) {
          console.error("Failed to fetch cart:", error);
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch cart",
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      addItem: async (item) => {
        // Check auth state
        const user = useAuthStore.getState().currentUser;

        // Ensure user is logged in
        if (!user) {
          throw new Error("User must be logged in to add items to cart");
        }

        try {
          set({ isLoading: true, error: null });
          const newItem = await addToCart(item);

          // Update the items and calculate new summary
          const updatedItems = [...get().items];

          // Check if the item already exists by productId and priceVariantId
          const existingItemIndex = updatedItems.findIndex(
            (i) =>
              i.productId === item.productId &&
              i.priceVariantId === item.priceVariantId
          );

          if (existingItemIndex >= 0) {
            // Update existing item
            updatedItems[existingItemIndex] = newItem;
          } else {
            // Add new item
            updatedItems.push(newItem);
          }

          const summary = calculateCartSummary(updatedItems);
          set({ items: updatedItems, summary, isLoading: false });

          return newItem;
        } catch (error) {
          console.error("Failed to add item to cart:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to add item to cart",
            isLoading: false,
          });
          throw error;
        }
      },

      updateItemQuantity: async (input) => {
        // Check auth state
        const user = useAuthStore.getState().currentUser;

        // Ensure user is logged in
        if (!user) {
          throw new Error("User must be logged in to update cart");
        }

        try {
          set({ isLoading: true, error: null });
          const updatedItem = await updateCartItem(input);

          // Update the items and calculate new summary
          const updatedItems = get().items.map((item) =>
            item.id === input.id ? updatedItem : item
          );

          const summary = calculateCartSummary(updatedItems);
          set({ items: updatedItems, summary, isLoading: false });

          return updatedItem;
        } catch (error) {
          console.error("Failed to update item quantity:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update item quantity",
            isLoading: false,
          });
          throw error;
        }
      },

      removeItem: async (id) => {
        // Check auth state
        const user = useAuthStore.getState().currentUser;

        // Ensure user is logged in
        if (!user) {
          throw new Error("User must be logged in to remove items from cart");
        }

        try {
          set({ isLoading: true, error: null });
          await removeFromCart(id);

          // Remove item from state and calculate new summary
          const updatedItems = get().items.filter((item) => item.id !== id);
          const summary = calculateCartSummary(updatedItems);
          set({ items: updatedItems, summary, isLoading: false });
        } catch (error) {
          console.error("Failed to remove item from cart:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to remove item from cart",
            isLoading: false,
          });
          throw error;
        }
      },

      clearCart: () => {
        set({
          items: [],
          summary: { totalItems: 0, totalAmount: 0 },
        });
      },

      clearError: () => set({ error: null }),

      setInitialized: (value) => set({ isInitialized: value }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        summary: state.summary,
      }),
    }
  )
);
