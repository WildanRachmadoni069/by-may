"use client";

import { ArticleCard } from "@/components/general/ArticleCard";
import { ArticleEmptyState } from "@/components/general/EmptyState";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Article, getArticles } from "@/lib/api/articles";

export default function ArticleCollection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Use the standard getArticles function and handle errors manually
        const response = await getArticles({
          status: "published",
          limit: 3,
        });
        setArticles(response.data);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setError("Failed to load articles");
        // Set articles to empty array to avoid undefined errors
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Artikel Terbaru</h2>
            <p className="text-gray-600">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Artikel Terbaru</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // If there are no articles, show the empty state
  if (articles.length === 0) {
    return <ArticleEmptyState />;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Artikel Terbaru</h2>
          <p className="text-gray-600">
            Jelajahi artikel-artikel inspiratif seputar Al-Qur'an dan kehidupan
            islami
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              title={article.title}
              excerpt={article.excerpt || ""}
              slug={article.slug}
              featured_image={article.featured_image || { url: "", alt: "" }}
              created_at={
                article.publishedAt?.toString() || article.createdAt.toString()
              }
            />
          ))}
        </div>

        <div className="text-center">
          <Link href="/artikel">
            <Button variant="outline" size="lg">
              Lihat Semua Artikel
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
