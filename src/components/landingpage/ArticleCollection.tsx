"use client";

import { ArticleCard } from "@/components/general/ArticleCard";
import { ArticleEmptyState } from "@/components/article/ArticleEmptyState";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getArticles } from "@/lib/api/articles";
import { ArticleData } from "@/types/article";

export default function ArticleCollection() {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Memulai pengambilan data setelah komponen dimount
    let isMounted = true;
    const controller = new AbortController();

    const fetchArticles = async () => {
      try {
        // Gunakan AbortController untuk membatalkan request jika komponen di-unmount
        const response = await getArticles(
          {
            status: "published",
            limit: 3,
          },
          controller.signal
        );

        // Hanya update state jika komponen masih mounted
        if (isMounted) {
          setArticles(response.data);
        }
      } catch (error: any) {
        // Ignore abort errors which happen when the component is unmounted
        if (error.name !== "AbortError" && isMounted) {
          console.error("Error fetching articles:", error);
          setError("Failed to load articles");
          setArticles([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchArticles();

    // Cleanup function untuk mencegah memory leak
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);
  // Show loading state
  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Artikel Terbaru</h2>
            <p className="text-gray-600">Memuat artikel...</p>
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
            <p className="text-red-500">Gagal memuat artikel</p>
          </div>
        </div>
      </div>
    );
  }
  // If there are no articles, show the empty state
  if (articles.length === 0) {
    return <ArticleEmptyState showHomeButton={false} />;
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
              featuredImage={article.featuredImage || { url: "", alt: "" }}
              createdAt={
                article.publishedAt?.toString() ||
                article.createdAt?.toString() ||
                ""
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
