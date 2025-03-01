import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  startAt,
  endAt,
  limit,
  startAfter,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import {
  ProductFormValues,
  GetProductsOptions,
  FilteredProductsResponse,
  Product,
} from "@/types/product";

const COLLECTION_NAME = "products";

function cleanData(
  data: any
): Record<string, any> | any[] | string | number | null {
  // If data is null or undefined, return null
  if (data === undefined || data === null) {
    return null;
  }

  // If data is a primitive type (not an object), return it as is
  if (typeof data !== "object") {
    return data;
  }

  // If data is an array, clean each element
  if (Array.isArray(data)) {
    return data.map((item) => cleanData(item));
  }

  // For objects, clean each property
  const cleaned: Record<string, any> = {};

  Object.keys(data).forEach((key) => {
    // Skip internal Firestore fields if they exist
    if (key.startsWith("_")) {
      return;
    }

    const value = data[key];

    // Handle special cases
    if (key === "basePrice" || key === "baseStock") {
      cleaned[key] = value === undefined || value === "" ? 0 : Number(value);
    }
    // Handle weight and dimensions
    else if (key === "weight") {
      cleaned[key] = value === undefined || value === "" ? 0 : Number(value);
    } else if (key === "dimensions") {
      cleaned[key] = {
        width: value?.width === undefined ? 0 : Number(value.width),
        length: value?.length === undefined ? 0 : Number(value.length),
        height: value?.height === undefined ? 0 : Number(value.height),
      };
    }
    // Handle variation prices
    else if (key === "variationPrices") {
      cleaned[key] = {};
      if (value && typeof value === "object") {
        Object.entries(value).forEach(
          ([priceKey, priceValue]: [string, any]) => {
            cleaned[key][priceKey] = {
              price:
                priceValue?.price === undefined ? 0 : Number(priceValue.price),
              stock:
                priceValue?.stock === undefined ? 0 : Number(priceValue.stock),
            };
          }
        );
      }
    }
    // Handle variations array
    else if (key === "variations") {
      cleaned[key] = Array.isArray(value)
        ? value.map((variation) => ({
            id: variation.id,
            name: variation.name,
            options: Array.isArray(variation.options)
              ? variation.options.map(
                  (opt: { id: string; name: string; imageUrl?: string }) => ({
                    id: opt.id,
                    name: opt.name,
                    imageUrl: opt.imageUrl || null,
                  })
                )
              : [],
          }))
        : [];
    }
    // Handle other properties
    else {
      cleaned[key] = cleanData(value);
    }
  });

  return cleaned;
}

export async function createProduct(productData: ProductFormValues) {
  const productsRef = collection(db, COLLECTION_NAME);

  const dataToSubmit = {
    ...(cleanData(productData) as Record<string, any>),
    createdAt: new Date(),
    updatedAt: new Date(),
    nameSearch: productData.name.toLowerCase().trim(),
  };

  const docRef = await addDoc(productsRef, dataToSubmit);
  return { id: docRef.id, ...dataToSubmit };
}

export async function updateProduct(
  productId: string,
  productData: Partial<ProductFormValues>
) {
  const productRef = doc(db, COLLECTION_NAME, productId);

  const updateData = {
    ...productData,
    ...(productData.name && {
      nameSearch: productData.name.toLowerCase().trim(),
    }),
    updatedAt: new Date(),
  };

  const cleanedData = cleanData(updateData) || {};

  const dataToUpdate = Object.entries(cleanedData).reduce(
    (acc, [key, value]) => {
      if (value !== null) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>
  );

  await updateDoc(productRef, dataToUpdate);
  return { id: productId, ...dataToUpdate };
}

// Add this helper function
async function deleteProductImage(imageUrl: string | null) {
  if (!imageUrl) return;

  try {
    const response = await fetch("/api/product/delete-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: imageUrl }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete product image");
    }
  } catch (error) {
    console.error("Error deleting product image:", error);
    throw error;
  }
}

export async function deleteProduct(productId: string) {
  try {
    // Get product data first
    const product = await getProduct(productId);
    if (!product) return;

    const deletePromises: Promise<any>[] = [];

    // Delete main image
    if (product.mainImage) {
      deletePromises.push(deleteProductImage(product.mainImage));
    }

    // Delete additional images - make sure to filter out null/undefined values
    if (product.additionalImages && Array.isArray(product.additionalImages)) {
      const additionalImagePromises = product.additionalImages
        .filter((img): img is string => Boolean(img))
        .map((img) => deleteProductImage(img));
      deletePromises.push(...additionalImagePromises);
    }

    // Delete variation images
    if (product.variations && Array.isArray(product.variations)) {
      product.variations.forEach((variation) => {
        if (variation.options && Array.isArray(variation.options)) {
          const variationImagePromises = variation.options
            .filter((opt) => opt && opt.imageUrl)
            .map((opt) => deleteProductImage(opt.imageUrl!));
          deletePromises.push(...variationImagePromises);
        }
      });
    }
    await Promise.all(deletePromises);

    // Finally delete product document from Firestore
    const productRef = doc(db, COLLECTION_NAME, productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

export async function getProduct(productId: string) {
  const productRef = doc(db, COLLECTION_NAME, productId);
  const productSnap = await getDoc(productRef);

  if (!productSnap.exists()) {
    return null;
  }

  return {
    id: productSnap.id,
    ...productSnap.data(),
  } as ProductFormValues & { id: string };
}

export async function getProducts() {
  const productsRef = collection(db, COLLECTION_NAME);
  const q = query(productsRef, orderBy("createdAt", "desc"));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getProductsByCategory(category: string) {
  const productsRef = collection(db, COLLECTION_NAME);
  const q = query(
    productsRef,
    where("category", "==", category),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getFilteredProducts({
  category,
  collection: collectionName,
  sortBy = "newest",
  itemsPerPage = 12,
  lastDoc,
  searchQuery,
}: GetProductsOptions): Promise<FilteredProductsResponse> {
  const productsRef = collection(db, COLLECTION_NAME);
  const constraints: QueryConstraint[] = [];

  // Add search query filter if provided
  if (searchQuery?.trim()) {
    const searchLower = searchQuery.toLowerCase().trim();
    constraints.push(orderBy("nameSearch")); // Required for startAt/endAt query
    constraints.push(startAt(searchLower));
    constraints.push(endAt(searchLower + "\uf8ff"));
  }

  // Add category filter
  if (category && category !== "all") {
    if (searchQuery) {
      // If searching, we need a composite index for nameSearch + category
      constraints.push(where("category", "==", category));
    } else {
      constraints.push(where("category", "==", category));
    }
  }

  // Add collection filter
  if (collectionName) {
    if (collectionName === "none") {
      constraints.push(where("collection", "==", null));
    } else if (collectionName !== "all") {
      constraints.push(where("collection", "==", collectionName));
    }
  }

  // Add sorting - only if not searching
  if (!searchQuery) {
    switch (sortBy) {
      case "price-asc":
        constraints.push(orderBy("basePrice", "asc"));
        break;
      case "price-desc":
        constraints.push(orderBy("basePrice", "desc"));
        break;
      case "newest":
      default:
        constraints.push(orderBy("createdAt", "desc"));
    }
  }

  // Add pagination
  constraints.push(limit(itemsPerPage));
  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(productsRef, ...constraints);
  const querySnapshot = await getDocs(q);

  const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
  const products = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  return {
    products,
    lastDoc: lastVisible,
    hasMore: querySnapshot.docs.length === itemsPerPage,
  };
}
