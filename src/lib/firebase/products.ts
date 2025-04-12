import { db } from "./firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreError,
} from "firebase/firestore";
import {
  ProductFormValues,
  Product,
  GetProductsOptions,
  FilteredProductsResponse,
} from "@/types/product";
import { generateSearchKeywords } from "@/lib/utils";

/**
 * Clean an object by removing undefined values and replacing with appropriate defaults
 * Firestore doesn't accept undefined values
 */
function cleanObjectForFirestore(
  obj: Record<string, any>
): Record<string, any> {
  if (!obj || typeof obj !== "object") return obj;

  // If it's an array, map over the items and clean each one
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanObjectForFirestore(item));
  }

  const cleaned: Record<string, any> = {};

  // Process each key in the object
  Object.entries(obj).forEach(([key, value]) => {
    // Skip undefined values entirely
    if (value === undefined) return;

    // Recursively clean nested objects
    if (value && typeof value === "object") {
      cleaned[key] = cleanObjectForFirestore(value);
    } else {
      cleaned[key] = value;
    }
  });

  return cleaned;
}

// Helper to prepare product for saving to Firestore
const prepareProductData = (productData: ProductFormValues) => {
  // Handle special cases for products with variations
  let preparedData = { ...productData };

  // If product has variations, ensure basePrice and baseStock are set to 0 not undefined
  if (preparedData.hasVariations) {
    preparedData.basePrice = 0;
    preparedData.baseStock = 0;
  }

  // Generate search keywords for more flexible searching
  preparedData.searchKeywords = generateSearchKeywords(preparedData.name);

  // Add updated timestamp
  const withTimestamp = {
    ...preparedData,
    updatedAt: Timestamp.now(),
  };

  // Clean the data to remove any undefined values
  const cleanedData = cleanObjectForFirestore(withTimestamp);

  return cleanedData;
};

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, "products");
    const querySnapshot = await getDocs(productsRef);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error("Error getting products: ", error);
    throw error;
  }
};

// Get filtered products with pagination
export const getFilteredProducts = async (
  options: GetProductsOptions = {}
): Promise<FilteredProductsResponse> => {
  try {
    const {
      category = "all",
      collection: collectionFilter = "all",
      sortBy = "newest",
      itemsPerPage = 12,
      lastDoc = null,
      searchQuery = "",
    } = options;

    // For complex searches or when we need both search and filter/sort functionality
    if (searchQuery) {
      // First, build a query with just the filters (no search constraints)
      let q = query(collection(db, "products"));

      // Apply category filter
      if (category !== "all") {
        q = query(q, where("category", "==", category));
      }

      // Apply collection filter
      if (collectionFilter === "none") {
        q = query(q, where("collection", "in", ["", "none", null]));
      } else if (collectionFilter !== "all") {
        q = query(q, where("collection", "==", collectionFilter));
      }

      // Apply sorting - ensure createdAt field is used for newest
      if (sortBy === "newest") {
        q = query(q, orderBy("createdAt", "desc"));
      } else if (sortBy === "price-asc") {
        q = query(q, orderBy("basePrice", "asc"));
      } else if (sortBy === "price-desc") {
        q = query(q, orderBy("basePrice", "desc"));
      } else {
        // Default sorting
        q = query(q, orderBy("createdAt", "desc"));
      }

      // Get all matching documents (we'll filter and paginate in memory)
      const querySnapshot = await getDocs(q);

      const allFilteredProducts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      // Now filter by search query in memory
      const normalizedQuery = searchQuery.toLowerCase().trim();
      const filteredProducts = allFilteredProducts.filter((product) => {
        // Check if product name contains the search query
        const productName = product.name.toLowerCase();
        return productName.includes(normalizedQuery);
      });

      // Apply pagination in memory
      const startIdx = lastDoc ? Number(lastDoc) : 0;
      const endIdx = startIdx + itemsPerPage;
      const paginatedProducts = filteredProducts.slice(startIdx, endIdx);

      return {
        products: paginatedProducts,
        lastDoc: endIdx < filteredProducts.length ? endIdx : null,
        hasMore: endIdx < filteredProducts.length,
      };
    } else {
      // When no search query, use standard Firestore queries with filters and sorting
      let q = query(collection(db, "products"));

      // Apply category filter
      if (category !== "all") {
        q = query(q, where("category", "==", category));
      }

      // Apply collection filter
      if (collectionFilter === "none") {
        q = query(q, where("collection", "in", ["", "none", null]));
      } else if (collectionFilter !== "all") {
        q = query(q, where("collection", "==", collectionFilter));
      }

      // Ensure "newest" sorting uses createdAt field and is properly sorted descending
      if (sortBy === "newest") {
        q = query(q, orderBy("createdAt", "desc"));
      } else if (sortBy === "price-asc") {
        q = query(q, orderBy("basePrice", "asc"));
      } else if (sortBy === "price-desc") {
        q = query(q, orderBy("basePrice", "desc"));
      } else {
        // Default sorting
        q = query(q, orderBy("createdAt", "desc"));
      }

      // Apply pagination
      q = query(q, limit(itemsPerPage));

      // Apply startAfter for pagination if lastDoc exists
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      const hasMore = querySnapshot.docs.length === itemsPerPage;

      return {
        products,
        lastDoc: newLastDoc,
        hasMore,
      };
    }
  } catch (error) {
    console.error("Error getting filtered products: ", error);
    throw error;
  }
};

// Get a single product by ID
export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const productDoc = await getDoc(doc(db, "products", id));

    if (!productDoc.exists()) {
      return null;
    }

    return {
      id: productDoc.id,
      ...productDoc.data(),
    } as Product;
  } catch (error) {
    console.error("Error getting product: ", error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (
  productData: ProductFormValues
): Promise<Product> => {
  try {
    // Ensure createdAt is set to current timestamp for proper sorting
    const productWithTimestamp = {
      ...prepareProductData(productData),
      createdAt: Timestamp.now(), // This ensures all new products have a createdAt timestamp
    };

    const docRef = await addDoc(
      collection(db, "products"),
      productWithTimestamp
    );

    return {
      id: docRef.id,
      ...productWithTimestamp,
    } as Product;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Update an existing product
export const updateProduct = async (
  id: string,
  productData: Partial<ProductFormValues>
): Promise<Partial<Product>> => {
  try {
    const updatedData = prepareProductData(productData as ProductFormValues);
    await updateDoc(doc(db, "products", id), updatedData);

    return {
      id,
      ...updatedData,
    };
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "products", id));
  } catch (error) {
    console.error("Error deleting product: ", error);
    throw error;
  }
};
