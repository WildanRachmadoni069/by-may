/**
 * Generator static parameters untuk halaman produk
 * @description File terpisah untuk generateStaticParams dengan optimasi connection pool
 */
import { dbManager } from "@/lib/db-manager";
import { logError } from "@/lib/debug";

/**
 * Generate static params untuk produk dengan strategi minimal untuk build
 */
export async function generateProductStaticParams() {
  try {
    // SEMENTARA: Untuk production, generate minimal beberapa produk
    // untuk menghindari masalah redirect
    const limit = process.env.NODE_ENV === "production" ? 10 : 5;

    logError(
      "ProductStaticParams",
      `${process.env.NODE_ENV}: Generate maksimal ${limit} produk`
    );

    // Gunakan db manager dengan retry logic
    const products = await dbManager.executeWithRetry(async (client) => {
      return await client.product.findMany({
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
          createdAt: "desc",
        },
      });
    });

    const validSlugs = products
      .filter((product) => product.slug)
      .map((product) => ({
        slug: product.slug as string,
      }));

    logError(
      "ProductStaticParams",
      `Berhasil generate ${validSlugs.length} static params produk`
    );

    return validSlugs;
  } catch (error) {
    logError("ProductStaticParams.generateProductStaticParams", error);
    logError(
      "ProductStaticParams",
      "Error terjadi, fallback ke ISR-only generation"
    );
    return [];
  }
}
