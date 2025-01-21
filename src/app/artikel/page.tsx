import { ArticleCard } from "@/components/general/ArticleCard";
import articles from "@/lib/data/articles";
import React from "react";

function ArticlePage() {
  return (
    <main className="container px-4 py-8">
      <h1 className="text-4xl font-bold mb-4 text-center">Artikel</h1>
      <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
        Temukan inspirasi, pengetahuan, dan wawasan seputar Al-Qur'an,
        perlengkapan ibadah, dan kehidupan islami. Artikel-artikel kami
        dirancang untuk memperkaya pemahaman dan meningkatkan kualitas ibadah
        Anda.
      </p>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article, index) => (
          <ArticleCard key={index} {...article} />
        ))}
      </section>
    </main>
  );
}

export default ArticlePage;
