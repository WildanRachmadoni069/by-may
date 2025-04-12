"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";
import { ProductFormValues } from "@/types/product";
import ProductCard from "@/components/general/ProductCard";
import { shuffleArray } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

interface RelatedProductsProps {
  currentProductId: string;
  categoryId?: string;
  collectionId?: string;
  limit?: number;
}

export default function RelatedProducts({
  currentProductId,
  categoryId,
  collectionId,
  limit: numberOfItems = 4,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<ProductFormValues[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        console.log("Fetching related products with:", { currentProductId, categoryId, collectionId });
        
        // Validate inputs
        if (!currentProductId) {
          console.error("Missing currentProductId");
          setLoading(false);
          return;
        }
        
        // Start with collection reference
        const productsRef = collection(db, "products");
        let fetchedProducts: ProductFormValues[] = [];
        
        // UPDATED PRIORITY: Try collection first (if valid)
        if (collectionId && collectionId !== 'all' && collectionId !== 'none') {
          try {
            const collectionQuery = query(
              productsRef,
              where("collection", "==", collectionId),
              limit(numberOfItems * 2)
            );
            
            const collectionSnapshot = await getDocs(collectionQuery);
            console.log(`Found ${collectionSnapshot.size} products in same collection`);
            
            // Filter out current product client-side
            fetchedProducts = collectionSnapshot.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data(),
              }))
              .filter(product => product.id !== currentProductId) as ProductFormValues[];
          } catch (err) {
            console.error("Error in collection query:", err);
          }
        }
        
        // If not enough products, try category
        if (fetchedProducts.length < numberOfItems && categoryId && 
            categoryId !== 'all' && categoryId !== 'none') {
          try {
            const categoryQuery = query(
              productsRef,
              where("category", "==", categoryId),
              limit(numberOfItems * 2)
            );
            
            const categorySnapshot = await getDocs(categoryQuery);
            console.log(`Found ${categorySnapshot.size} products in same category`);
            
            // Filter client-side and combine with existing results
            const categoryProducts = categorySnapshot.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data(),
              }))
              .filter(product => product.id !== currentProductId) as ProductFormValues[];
            
            // Add unique products from category
            const existingIds = new Set(fetchedProducts.map(p => p.id));
            const uniqueCategoryProducts = categoryProducts.filter(p => !existingIds.has(p.id));
            
            fetchedProducts = [...fetchedProducts, ...uniqueCategoryProducts];
          } catch (err) {
            console.error("Error in category query:", err);
          }
        }
        
        // If still not enough, get recent products
        if (fetchedProducts.length < numberOfItems) {
          try {
            const recentQuery = query(
              productsRef,
              orderBy("createdAt", "desc"),
              limit(numberOfItems * 2)
            );
            
            const recentSnapshot = await getDocs(recentQuery);
            console.log(`Found ${recentSnapshot.size} recent products`);
            
            const recentProducts = recentSnapshot.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data(),
              }))
              .filter(product => product.id !== currentProductId) as ProductFormValues[];
            
            // Add unique products from recent
            const existingIds = new Set(fetchedProducts.map(p => p.id));
            const uniqueRecentProducts = recentProducts.filter(p => !existingIds.has(p.id));
            
            fetchedProducts = [...fetchedProducts, ...uniqueRecentProducts];
          } catch (err) {
            console.error("Error in recent products query:", err);
          }
        }
        
        console.log(`Total fetched products before shuffle: ${fetchedProducts.length}`);
        if (fetchedProducts.length > 0) {
          const shuffled = shuffleArray(fetchedProducts);
          const limitedProducts = shuffled.slice(0, numberOfItems);
          console.log(`Final related products: ${limitedProducts.length}`);
          setProducts(limitedProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentProductId) {
      fetchRelatedProducts();
    }
  }, [currentProductId, categoryId, collectionId, numberOfItems]);

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Produk Terkait</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array(4).fill(0).map((_, idx) => (
            <Skeleton key={idx} className="h-[220px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Hide section if no related products
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Produk Terkait</h2>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
