/**
 * Generator static parameters untuk halaman artikel
 * @description File terpisah untuk generateStaticParams dengan optimasi connection pool
 */
import { dbManager } from "@/lib/db-manager";
import { logError } from "@/lib/debug";

/**
 * Generate static params untuk artikel dengan strategi minimal untuk build
 */
export async function generateArticleStaticParams() {
  try {
    // SEMENTARA: Nonaktifkan static generation untuk menghindari masalah connection pool
    // Semua halaman akan menggunakan ISR on-demand
    if (process.env.NODE_ENV === "production") {
      logError(
        "ArticleStaticParams",
        "Production build: Menggunakan strategi ISR-only"
      );
      return [];
    }

    // Untuk development, generate beberapa halaman
    const limit = 5;

    logError(
      "ArticleStaticParams",
      `Development: Generate maksimal ${limit} artikel`
    );

    // Gunakan db manager dengan retry logic
    const articles = await dbManager.executeWithRetry(async (client) => {
      return await client.article.findMany({
        select: {
          slug: true,
        },
        where: {
          status: "published",
          slug: {
            not: "",
          },
        },
        take: limit,
        orderBy: {
          publishedAt: "desc",
        },
      });
    });

    const validSlugs = articles
      .filter((article: any) => article.slug)
      .map((article: any) => ({
        slug: article.slug as string,
      }));

    logError(
      "ArticleStaticParams",
      `Berhasil generate ${validSlugs.length} static params artikel`
    );

    return validSlugs;
  } catch (error) {
    logError("ArticleStaticParams.generateArticleStaticParams", error);
    logError(
      "ArticleStaticParams",
      "Error terjadi, fallback ke ISR-only generation"
    );
    return [];
  }
}
