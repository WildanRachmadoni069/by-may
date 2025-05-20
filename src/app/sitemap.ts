import { MetadataRoute } from "next";
import { Product } from "@/types/product";
import { ArticleData } from "@/types/article";
import { ProductService } from "@/lib/services/product-service";
import { ArticleService } from "@/lib/services/article-service";

// Get dynamic routes for products
async function getProductRoutes() {
  try {
    // Gunakan ProductService langsung alih-alih API layer
    const result = await ProductService.getProducts({
      limit: 100, // Ambil lebih banyak produk untuk sitemap
      includePriceVariants: false, // Tidak perlu data harga untuk sitemap
    });

    const products: Product[] = result.data;
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.com"; // Fallback

    return products.map((product) => ({
      url: `${siteUrl}/produk/${product.slug}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error fetching product routes for sitemap:", error);
    return [];
  }
}

// Get dynamic routes for articles
async function getArticleRoutes() {
  try {
    // Gunakan ArticleService langsung alih-alih API layer
    const result = await ArticleService.getArticles({
      limit: 100, // Ambil lebih banyak artikel untuk sitemap
      status: "published", // Hanya artikel yang dipublish yang perlu disertakan
    });

    const articles: ArticleData[] = result.data;
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.com"; // Fallback

    return articles.map((article) => ({
      url: `${siteUrl}/artikel/${article.slug}`,
      lastModified: article.updatedAt || article.publishedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching article routes for sitemap:", error);
    return [];
  }
}

// Define static routes
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.com"; // Fallback
const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: `${siteUrl}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  },
  {
    url: `${siteUrl}/tentang-kami`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: `${siteUrl}/produk`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${siteUrl}/artikel`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    url: `${siteUrl}/faq`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get dynamic routes
  const productRoutes = await getProductRoutes();
  const articleRoutes = await getArticleRoutes();

  // Combine all routes
  return [...staticRoutes, ...productRoutes, ...articleRoutes];
}
