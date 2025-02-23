import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { CartItem, CartData } from "@/types/cart";

const CART_COLLECTION = "carts";
const TEMP_CART_ID = "temp-cart";

export const getCart = async (): Promise<CartData> => {
  const cartDoc = await getDoc(doc(db, CART_COLLECTION, TEMP_CART_ID));
  if (!cartDoc.exists()) {
    return { items: [] };
  }
  return cartDoc.data() as CartData;
};

export const updateCart = async (items: CartItem[]): Promise<CartItem[]> => {
  await setDoc(doc(db, CART_COLLECTION, TEMP_CART_ID), { items });
  return items;
};

export const clearCart = async (): Promise<CartItem[]> => {
  await deleteDoc(doc(db, CART_COLLECTION, TEMP_CART_ID));
  return [];
};
