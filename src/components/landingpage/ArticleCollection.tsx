"use client";

import { ArticleCard } from "@/components/general/ArticleCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";
import type { ArticleData } from "@/types/article";

function formatFirebaseTimestamp(timestamp: any) {
  if (!timestamp) return null;
  if (typeof timestamp === "string") return timestamp;
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toISOString();
  }
  return null;
}

export default function ArticleCollection() {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const articlesRef = collection(db, "articles");
        const q = query(
          articlesRef,
          where("status", "==", "published"),
          orderBy("created_at", "desc"),
          limit(3)
        );

        const snapshot = await getDocs(q);
        const articlesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          created_at: formatFirebaseTimestamp(doc.data().created_at),
          updated_at: formatFirebaseTimestamp(doc.data().updated_at),
        })) as ArticleData[];

        setArticles(articlesData);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (articles.length === 0) {
    return null;
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
              excerpt={article.excerpt}
              slug={article.slug}
              featured_image={article.featured_image}
              created_at={article.created_at || undefined}
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
