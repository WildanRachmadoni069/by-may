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
    // SEMENTARA: Nonaktifkan static generation untuk menghindari masalah connection pool
    // Semua halaman akan menggunakan ISR on-demand
    if (process.env.NODE_ENV === "production") {
      logError(
        "ProductStaticParams",
        "Production build: Menggunakan strategi ISR-only"
      );
      return [];
    }

    // Untuk development, generate beberapa halaman
    const limit = 5;

    logError(
      "ProductStaticParams",
      `Development: Generate maksimal ${limit} produk`
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
