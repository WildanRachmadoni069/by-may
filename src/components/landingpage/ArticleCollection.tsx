"use client";

import { ArticleCard } from "@/components/general/ArticleCard";
import { ArticleEmptyState } from "@/components/article/ArticleEmptyState";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useArticles } from "@/hooks/useArticles";

export default function ArticleCollection() {
  // Use SWR hook to fetch articles
  const {
    data: articles,
    isLoading,
    error,
  } = useArticles(
    {
      status: "published",
      limit: 3,
      sort: "desc", // Show newest first
    },
    {
      // Disable automatic revalidation for better performance
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

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
    <section
      className="py-16 bg-gray-50"
      aria-labelledby="latest-articles"
      itemScope
      itemType="https://schema.org/Collection"
    >
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2
            id="latest-articles"
            className="text-3xl font-bold mb-4"
            itemProp="name"
          >
            Artikel Terbaru
          </h2>
          <p className="text-gray-600" itemProp="description">
            Jelajahi artikel-artikel inspiratif seputar Al-Qur'an dan kehidupan
            islami
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8"
          itemProp="hasPart"
          itemScope
          itemType="https://schema.org/ItemList"
        >
          {articles.map((article, index) => (
            <div
              key={article.id}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <meta itemProp="position" content={`${index + 1}`} />
              <ArticleCard
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
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/artikel" aria-label="Lihat semua artikel blog">
            <Button variant="outline" size="lg">
              Lihat Semua Artikel
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
