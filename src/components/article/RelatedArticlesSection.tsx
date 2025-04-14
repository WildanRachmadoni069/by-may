import React from "react";
import Link from "next/link";
import { Article } from "@/lib/api/articles";
import { ArticleCard } from "@/components/general/ArticleCard";

interface RelatedArticlesSectionProps {
  articles: Article[];
}

export function RelatedArticlesSection({
  articles,
}: RelatedArticlesSectionProps) {
  if (!articles.length) return null;

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Artikel Terbaru</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            title={article.title}
            excerpt={article.excerpt || ""}
            slug={article.slug}
            featured_image={article.featured_image || null}
            created_at={
              article.publishedAt?.toString() || article.createdAt.toString()
            }
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/artikel"
          className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
        >
          Lihat Semua Artikel
        </Link>
      </div>
    </div>
  );
}
