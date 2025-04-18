import React from "react";
import Link from "next/link";
import { ArticleData } from "@/types/article";
import { ArticleCard } from "@/components/general/ArticleCard";

interface RelatedArticlesSectionProps {
  articles: ArticleData[];
}

export function RelatedArticlesSection({
  articles,
}: RelatedArticlesSectionProps) {
  if (!articles.length) return null;

  return (
    <div className="py-8">
      {/* Menghapus heading disini karena sudah ada heading di parent component */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            title={article.title}
            excerpt={article.excerpt || ""}
            slug={article.slug}
            featuredImage={article.featuredImage || null}
            createdAt={
              article.publishedAt?.toString() ||
              article.createdAt?.toString() ||
              ""
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
