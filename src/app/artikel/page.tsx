import { Metadata } from "next";
import { ArticleCard } from "@/components/general/ArticleCard";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";
import type { ArticleData } from "@/types/article";
import React from "react";

export const metadata: Metadata = {
  title: "Artikel",
  description:
    "Koleksi artikel tentang Al-Qur'an, perlengkapan ibadah, dan kehidupan islami untuk memperkaya pemahaman dan meningkatkan kualitas ibadah Anda.",
  openGraph: {
    title: "Artikel",
    description:
      "Koleksi artikel islami untuk memperkaya pemahaman dan meningkatkan kualitas ibadah Anda.",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", // Add your OG image
        width: 1200,
        height: 630,
        alt: "By May Scarf Articles",
      },
    ],
  },
};

function formatFirebaseTimestamp(timestamp: any) {
  if (!timestamp) return null;
  if (typeof timestamp === "string") return timestamp;
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toISOString();
  }
  return null;
}

async function getPublishedArticles() {
  try {
    const articlesRef = collection(db, "articles");
    // This query requires a composite index
    const q = query(
      articlesRef,
      where("status", "==", "published"),
      orderBy("created_at", "desc")
    );

    const snapshot = await getDocs(q);
    const articles = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: formatFirebaseTimestamp(data.created_at),
        updated_at: formatFirebaseTimestamp(data.updated_at),
      };
    }) as ArticleData[];

    return articles;
  } catch (error: any) {
    if (error.code === "failed-precondition") {
      console.error(
        "This query requires an index. Please create it in Firebase Console:",
        error.details
      );
    }
    return [];
  }
}

export default async function ArticlePage() {
  const articles = await getPublishedArticles();

  return (
    <>
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            Artikel Islami
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Temukan inspirasi, pengetahuan, dan wawasan seputar Al-Qur'an,
            perlengkapan ibadah, dan kehidupan islami.
          </p>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                excerpt={article.excerpt}
                slug={article.slug}
                featured_image={article.featured_image}
                created_at={article.created_at ?? undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Belum ada artikel yang tersedia.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
