import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shuffleArray } from "@/lib/utils";

/**
 * API route for fetching related products
 * Supports prioritized fetching:
 * 1. Same collection (if collectionId provided)
 * 2. Same category (if categoryId provided)
 * 3. Recent products (fallback)
 */
export async function GET(req: NextRequest) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const exclude = searchParams.get("exclude");
    const collectionId = searchParams.get("collectionId");
    const categoryId = searchParams.get("categoryId");
    const limit = parseInt(searchParams.get("limit") || "8", 10);

    // Validate required parameters
    if (!exclude) {
      return NextResponse.json(
        { error: "Missing required parameter: exclude" },
        { status: 400 }
      );
    }

    let relatedProducts: any[] = [];

    // PRIORITY 1: Try collection first (if valid)
    if (collectionId && collectionId !== "all" && collectionId !== "none") {
      const collectionProducts = await db.product.findMany({
        where: {
          id: { not: exclude },
          collectionId: collectionId,
        },
        include: {
          category: true,
          collection: true,
          priceVariants: true,
        },
        take: limit,
      });

      if (collectionProducts.length > 0) {
        console.log(
          `Found ${collectionProducts.length} products in same collection`
        );
        relatedProducts = [...collectionProducts];
      }
    }

    // PRIORITY 2: If not enough products, try category
    if (
      relatedProducts.length < limit &&
      categoryId &&
      categoryId !== "all" &&
      categoryId !== "none"
    ) {
      const categoryProducts = await db.product.findMany({
        where: {
          AND: [
            { id: { not: exclude } },
            { categoryId: categoryId },
            { id: { notIn: relatedProducts.map((p) => p.id) } },
          ],
        },
        include: {
          category: true,
          collection: true,
          priceVariants: true,
        },
        take: limit - relatedProducts.length,
      });

      if (categoryProducts.length > 0) {
        console.log(
          `Found ${categoryProducts.length} products in same category`
        );
        relatedProducts = [...relatedProducts, ...categoryProducts];
      }
    }

    // PRIORITY 3: If still not enough, get recent products
    if (relatedProducts.length < limit) {
      const remainingLimit = limit - relatedProducts.length;
      const existingIds = new Set(relatedProducts.map((p) => p.id));
      existingIds.add(exclude); // Also exclude the current product

      const recentProducts = await db.product.findMany({
        where: {
          id: { notIn: Array.from(existingIds) },
        },
        include: {
          category: true,
          collection: true,
          priceVariants: true,
        },
        orderBy: { createdAt: "desc" },
        take: remainingLimit,
      });

      if (recentProducts.length > 0) {
        console.log(`Found ${recentProducts.length} recent products`);
        relatedProducts = [...relatedProducts, ...recentProducts];
      }
    }

    // Shuffle the products for better presentation
    const shuffled = shuffleArray(relatedProducts);

    return NextResponse.json(shuffled);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return NextResponse.json(
      { error: "Failed to fetch related products" },
      { status: 500 }
    );
  }
}
