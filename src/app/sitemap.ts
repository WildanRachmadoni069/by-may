import { MetadataRoute } from "next";
import { Product } from "@/types/product";

// Get dynamic routes for products
async function getProductRoutes() {
  // Replace with your actual data fetching logic
  // This is a placeholder implementation
  try {
    // If you have a service to fetch products, use it here
    // const products = await fetchProducts();
    const products: Product[] = [];
    return products.map((product) => ({
      url: `https://bymayscarf.com/produk/${product.slug}`,
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
  // Replace with your actual data fetching logic
  // This is a placeholder implementation
  try {
    // If you have a service to fetch articles, use it here
    // const articles = await fetchArticles();
    const articles: {
      slug: string;
      updatedAt?: string;
      publishedAt?: string;
    }[] = [];
    return articles.map((article) => ({
      url: `https://bymayscarf.com/artikel/${article.slug}`,
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
const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: "https://bymayscarf.com",
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  },
  {
    url: "https://bymayscarf.com/tentang-kami",
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: "https://bymayscarf.com/produk",
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: "https://bymayscarf.com/artikel",
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    url: "https://bymayscarf.com/faq",
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
