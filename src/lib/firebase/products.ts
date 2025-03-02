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

    let q = query(collection(db, "products"));

    // Apply category filter
    if (category !== "all") {
      q = query(q, where("category", "==", category));
    }

    // Apply collection filter
    if (collectionFilter === "none") {
      // Filter products without collection
      q = query(q, where("collection", "in", ["none", null, undefined]));
    } else if (collectionFilter !== "all") {
      q = query(q, where("collection", "==", collectionFilter));
    }

    // Apply search query if provided
    if (searchQuery) {
      // Normalize search query
      const normalizedQuery = searchQuery.toLowerCase().trim();

      // Search using searchKeywords field
      q = query(q, where("searchKeywords", "array-contains", normalizedQuery));
    } else {
      // Apply sorting when not searching
      const sortField =
        sortBy === "priceAsc" || sortBy === "priceDesc"
          ? "basePrice"
          : "createdAt";

      const sortDirection = sortBy === "priceDesc" ? "desc" : "asc";

      q = query(
        q,
        orderBy(sortField, sortDirection === "desc" ? "desc" : "asc")
      );
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

    // If no products found with exact match, try a more flexible search
    if (products.length === 0 && searchQuery) {
      // For more complex searches or partial matches, we need to fetch more data and filter in memory
      const broadQuery = query(collection(db, "products"));
      const allProducts = await getDocs(broadQuery);

      const filteredProducts = allProducts.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Product)
        )
        .filter((product) => {
          // Case insensitive search in the product name
          const productName = product.name.toLowerCase();
          const searchTerms = searchQuery.toLowerCase().split(" ");

          // Check if all search terms are in the product name
          return searchTerms.every((term) => productName.includes(term));
        }) as Product[];

      // Apply pagination to the filtered results
      const paginatedProducts = filteredProducts.slice(0, itemsPerPage);

      return {
        products: paginatedProducts,
        lastDoc:
          paginatedProducts.length === itemsPerPage
            ? allProducts.docs[itemsPerPage - 1]
            : null,
        hasMore:
          paginatedProducts.length === itemsPerPage &&
          paginatedProducts.length < filteredProducts.length,
      };
    }

    const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const hasMore = querySnapshot.docs.length === itemsPerPage;

    return {
      products,
      lastDoc: newLastDoc,
      hasMore,
    };
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
    const productWithTimestamp = {
      ...prepareProductData(productData),
      createdAt: Timestamp.now(),
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
