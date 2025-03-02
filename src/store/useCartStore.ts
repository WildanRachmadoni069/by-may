import { create } from "zustand";
import { CartItem, CartStore, CartData } from "@/types/cart";
import { getCart, updateCart, clearCart } from "@/lib/firebase/cart";

export const useCartStore = create<CartStore>()((set, get) => ({
  items: [],
  loading: false,
  error: null,

  initializeCart: async () => {
    set({ loading: true });
    try {
      const cart = await getCart();
      set({ items: cart.items || [], error: null });
    } catch (error) {
      set({ error: "Failed to fetch cart" });
      console.error("Error fetching cart:", error);
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (newItem: CartItem) => {
    set({ loading: true });
    try {
      const { items } = get();
      const existingItemIndex = items.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.variationKey === newItem.variationKey
      );

      let updatedItems: CartItem[];
      if (existingItemIndex > -1) {
        updatedItems = [...items];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
      } else {
        updatedItems = [...items, newItem];
      }

      await updateCart(updatedItems);
      set({ items: updatedItems, error: null });
    } catch (error) {
      set({ error: "Failed to add item" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removeItem: async (productId: string, variationKey?: string) => {
    set({ loading: true });
    try {
      const { items } = get();
      const updatedItems = items.filter(
        (item) =>
          !(
            item.productId === productId &&
            (!variationKey || item.variationKey === variationKey)
          )
      );
      await updateCart(updatedItems);
      set({ items: updatedItems, error: null });
    } catch (error) {
      set({ error: "Failed to remove item" });
      console.error("Error removing item:", error);
    } finally {
      set({ loading: false });
    }
  },

  updateQuantity: async (
    productId: string,
    quantity: number,
    variationKey?: string
  ) => {
    set({ loading: true });
    try {
      const { items } = get();
      const updatedItems = items.map((item) => {
        if (
          item.productId === productId &&
          (!variationKey || item.variationKey === variationKey)
        ) {
          return { ...item, quantity };
        }
        return item;
      });
      await updateCart(updatedItems);
      set({ items: updatedItems, error: null });
    } catch (error) {
      set({ error: "Failed to update quantity" });
      console.error("Error updating quantity:", error);
    } finally {
      set({ loading: false });
    }
  },

  clearCart: async () => {
    set({ loading: true });
    try {
      await clearCart();
      set({ items: [], error: null });
    } catch (error) {
      set({ error: "Failed to clear cart" });
      console.error("Error clearing cart:", error);
    } finally {
      set({ loading: false });
    }
  },

  getTotalItems: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
