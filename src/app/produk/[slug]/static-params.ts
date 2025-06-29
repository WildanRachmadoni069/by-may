/**
 * Static parameters generator untuk halaman produk
 * @description File terpisah untuk generateStaticParams dengan optimasi connection pool
 */
import { db } from "@/lib/db";
import { logError } from "@/lib/debug";

/**
 * Generate static params untuk produk dengan strategi minimal untuk build
 */
export async function generateProductStaticParams() {
  try {
    // Untuk production build di Vercel, hanya generate 10 produk terpopuler
    // Sisanya akan menggunakan ISR (Incremental Static Regeneration)
    const limit = process.env.NODE_ENV === "production" ? 10 : 20;

    logError(
      "ProductStaticParams",
      `Starting static generation for max ${limit} products`
    );

    // Query langsung dengan minimal data untuk menghindari connection timeout
    const products = await db.product.findMany({
      select: {
        slug: true,
      },
      where: {
        slug: {
          not: "",
        },
      },
      take: limit,
      orderBy: {
        createdAt: "desc", // Ambil produk terbaru yang lebih sering diakses
      },
    });

    const validSlugs = products
      .filter((product) => product.slug)
      .map((product) => ({
        slug: product.slug as string,
      }));

    logError(
      "ProductStaticParams",
      `Generated ${validSlugs.length} product static params`
    );

    return validSlugs;
  } catch (error) {
    logError("ProductStaticParams.generateProductStaticParams", error);
    // Return minimal static params untuk fallback
    logError(
      "ProductStaticParams",
      "Error occurred, falling back to ISR-only generation"
    );
    return [];
  }
}
