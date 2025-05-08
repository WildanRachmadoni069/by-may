import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * API endpoint for fetching related products with smart prioritization
 *
 * Priority order:
 * 1. Products from the same category and collection
 * 2. Products from the same category
 * 3. Products from the same collection
 * 4. Random products as fallback
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const categoryId = searchParams.get("categoryId");
    const collectionId = searchParams.get("collectionId");
    const limit = parseInt(searchParams.get("limit") || "4", 10);

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Include configuration to get price variant data
    const include = {
      category: true,
      collection: true,
      // Include price variants and their options for proper price display
      priceVariants: {
        include: {
          options: {
            include: {
              option: true,
            },
          },
        },
      },
    };

    // Attempt different strategies in priority order
    let relatedProducts: any[] = [];

    // 1. Try to find products with same category AND collection
    if (categoryId && collectionId) {
      relatedProducts = await db.product.findMany({
        where: {
          id: { not: productId },
          categoryId,
          collectionId,
        },
        include,
        take: limit,
      });
    }

    // 2. If not enough products, try same category only
    if (relatedProducts.length < limit && categoryId) {
      const remainingNeeded = limit - relatedProducts.length;
      const categoryProducts = await db.product.findMany({
        where: {
          id: {
            not: productId,
            notIn: relatedProducts.map((p) => p.id),
          },
          categoryId,
        },
        include,
        take: remainingNeeded,
      });

      relatedProducts = [...relatedProducts, ...categoryProducts];
    }

    // 3. If still not enough products, try same collection only
    if (relatedProducts.length < limit && collectionId) {
      const remainingNeeded = limit - relatedProducts.length;
      const collectionProducts = await db.product.findMany({
        where: {
          id: {
            not: productId,
            notIn: relatedProducts.map((p) => p.id),
          },
          collectionId,
        },
        include,
        take: remainingNeeded,
      });

      relatedProducts = [...relatedProducts, ...collectionProducts];
    }

    // 4. If still not enough products, get random products
    if (relatedProducts.length < limit) {
      const remainingNeeded = limit - relatedProducts.length;
      const randomProducts = await db.product.findMany({
        where: {
          id: {
            not: productId,
            notIn: relatedProducts.map((p) => p.id),
          },
        },
        include,
        orderBy: {
          createdAt: "desc", // Get newest products
        },
        take: remainingNeeded,
      });

      relatedProducts = [...relatedProducts, ...randomProducts];
    }

    return NextResponse.json({ data: relatedProducts });
  } catch (error) {
    console.error("Error fetching related products:", error);
    return NextResponse.json(
      { error: "Failed to fetch related products" },
      { status: 500 }
    );
  }
}
