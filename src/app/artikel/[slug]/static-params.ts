/**
 * Static parameters generator untuk halaman artikel
 * @description File terpisah untuk generateStaticParams dengan optimasi connection pool
 */
import { db } from "@/lib/db";
import { logError } from "@/lib/debug";

/**
 * Generate static params untuk artikel dengan strategi minimal untuk build
 */
export async function generateArticleStaticParams() {
  try {
    // Untuk production build di Vercel, hanya generate 10 artikel terpopuler
    // Sisanya akan menggunakan ISR (Incremental Static Regeneration)
    const limit = process.env.NODE_ENV === "production" ? 10 : 20;

    logError(
      "ArticleStaticParams",
      `Starting static generation for max ${limit} articles`
    );

    // Query langsung dengan minimal data untuk menghindari connection timeout
    const articles = await db.article.findMany({
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
        publishedAt: "desc", // Ambil artikel terbaru yang lebih sering diakses
      },
    });

    const validSlugs = articles
      .filter((article) => article.slug)
      .map((article) => ({
        slug: article.slug as string,
      }));

    logError(
      "ArticleStaticParams",
      `Generated ${validSlugs.length} article static params`
    );

    return validSlugs;
  } catch (error) {
    logError("ArticleStaticParams.generateArticleStaticParams", error);
    // Return minimal static params untuk fallback
    logError(
      "ArticleStaticParams",
      "Error occurred, falling back to ISR-only generation"
    );
    return [];
  }
}
