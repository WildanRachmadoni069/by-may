import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract parameters
    const excludeId = searchParams.get("exclude"); // product ID to exclude
    const categoryId = searchParams.get("categoryId");
    const collectionId = searchParams.get("collectionId");
    const limitParam = parseInt(searchParams.get("limit") || "4");

    // Base where condition always excludes the current product
    const where: Prisma.ProductWhereInput = {};

    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    // Apply filters based on parameters
    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (collectionId) {
      where.collectionId = collectionId;
    }

    // Find related products
    const products = await db.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        hasVariations: true,
        featuredImage: true,
        specialLabel: true,
        priceVariants: {
          select: {
            price: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limitParam,
    });

    // Process the products to include minimum price when they have variations
    const processedProducts = products.map((product) => {
      if (product.hasVariations && product.priceVariants.length > 0) {
        // Calculate minimum price from all price variants
        const prices = product.priceVariants.map((variant) => variant.price);
        const minPrice = Math.min(...prices);

        return {
          ...product,
          basePrice: minPrice, // Use the minimum price for display
        };
      }
      return product;
    });

    return NextResponse.json(processedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return NextResponse.json(
      { error: "Failed to fetch related products" },
      { status: 500 }
    );
  }
}
