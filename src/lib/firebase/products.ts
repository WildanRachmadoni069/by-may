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

// Define the products collection reference
const productsRef = collection(db, "products");

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

// Get products with filtering and pagination
export const getFilteredProducts = async ({
  category = "all",
  collection = "all",
  sortBy = "newest",
  itemsPerPage = 12,
  lastDoc = null,
  searchQuery = "",
}: GetProductsOptions): Promise<{
  products: Product[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> => {
  try {
    // Start building query from products collection
    let q = query(productsRef);

    // Apply category filter if specified
    if (category !== "all") {
      q = query(q, where("category", "==", category));
    }

    // Apply collection filter if specified
    if (collection === "none") {
      q = query(q, where("collection", "==", null));
    } else if (collection !== "all") {
      q = query(q, where("collection", "==", collection));
    }

    // Apply sort
    if (sortBy === "newest") {
      q = query(q, orderBy("createdAt", "desc"));
    } else if (sortBy === "price-asc") {
      q = query(q, orderBy("basePrice", "asc"));
    } else if (sortBy === "price-desc") {
      q = query(q, orderBy("basePrice", "desc"));
    }

    // Apply pagination if lastDoc is provided
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    // Apply limit - always add 1 extra to check if there are more
    q = query(q, limit(itemsPerPage + 1));

    // Execute query
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    let hasMore = false;

    // Process results
    if (!querySnapshot.empty) {
      // Check if we got more items than requested limit
      if (querySnapshot.docs.length > itemsPerPage) {
        hasMore = true;
        // Remove the extra product used to check if there are more
        querySnapshot.docs.pop();
      }

      // Convert documents to product objects
      for (const docSnapshot of querySnapshot.docs) {
        const productData = docSnapshot.data() as Product;
        const product = {
          ...productData,
          id: docSnapshot.id,
        };

        // Apply search filter client-side if needed
        if (searchQuery && searchQuery.trim() !== "") {
          const normalizedQuery = searchQuery.toLowerCase();
          const matchesName = product.name
            .toLowerCase()
            .includes(normalizedQuery);
          const matchesDescription = product.description
            ?.toLowerCase()
            .includes(normalizedQuery);

          if (matchesName || matchesDescription) {
            products.push(product);
          }
        } else {
          products.push(product);
        }
      }

      // Get the last document for pagination
      const lastVisible =
        querySnapshot.docs.length > 0
          ? querySnapshot.docs[querySnapshot.docs.length - 1]
          : null;

      return {
        products,
        lastDoc: lastVisible,
        hasMore,
      };
    } else {
      return {
        products: [],
        lastDoc: null,
        hasMore: false,
      };
    }
  } catch (error) {
    console.error("Error getting filtered products:", error);
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

/**
 * Delete all images associated with a product from Cloudinary
 * @param product - Product with images to delete
 */
export async function deleteProductImages(product: Product): Promise<void> {
  try {
    // Collect all images to delete
    const imagesToDelete: string[] = [];

    // Main image
    if (product.mainImage) {
      imagesToDelete.push(product.mainImage);
    }

    // Additional images
    if (product.additionalImages && Array.isArray(product.additionalImages)) {
      product.additionalImages.forEach((img) => {
        if (img) imagesToDelete.push(img);
      });
    }

    // Variation images (if available)
    if (product.variations && Array.isArray(product.variations)) {
      product.variations.forEach((variation) => {
        if (variation.options && Array.isArray(variation.options)) {
          variation.options.forEach((option) => {
            if (option.imageUrl) imagesToDelete.push(option.imageUrl);
          });
        }
      });
    }

    // Delete images from Cloudinary
    await Promise.all(
      imagesToDelete.map(async (imageUrl) => {
        try {
          await fetch("/api/product/delete-image", {
            // <-- Update this line
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: imageUrl }),
          });
        } catch (error) {
          console.error("Failed to delete image:", imageUrl, error);
        }
      })
    );

    console.log(
      `Deleted ${imagesToDelete.length} images for product: ${product.id}`
    );
  } catch (error) {
    console.error("Error deleting product images:", error);
    throw error;
  }
}
