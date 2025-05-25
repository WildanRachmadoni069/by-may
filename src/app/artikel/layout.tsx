/**
 * Layout Halaman Artikel
 * @description Layout untuk halaman daftar artikel dengan metadata SEO dan data terstruktur
 */
/**
 * Layout Halaman Artikel
 * @description Layout untuk halaman daftar artikel dengan metadata SEO dan data terstruktur.
 * Menangani metadata statis dan data terstruktur untuk koleksi artikel.
 */
import { Metadata } from "next";
import MainNav from "@/components/landingpage/MainNav";
import React from "react";
import { getArticlesAction } from "@/app/actions/article-actions";
import Script from "next/script";

/**
 * Metadata statis untuk halaman daftar artikel
 */
export const metadata: Metadata = {
  title: "Artikel Islami - By May Scarf",
  description:
    "Koleksi artikel tentang Al-Qur'an, perlengkapan ibadah, dan kehidupan islami untuk memperkaya pemahaman dan meningkatkan kualitas ibadah Anda.",
  openGraph: {
    title: "Artikel Islami - By May Scarf",
    description:
      "Koleksi artikel islami untuk memperkaya pemahaman dan meningkatkan kualitas ibadah Anda.",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "By May Scarf Articles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Artikel Islami - By May Scarf",
    description:
      "Koleksi artikel islami untuk memperkaya pemahaman dan meningkatkan kualitas ibadah Anda.",
  },
  alternates: {
    canonical: "https://bymay.com/artikel",
  },
};

/**
 * Komponen Layout Artikel
 * @param {Object} props - Props komponen
 * @param {React.ReactNode} props.children - Komponen child yang akan di-render
 */
export default async function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const articles = await getArticlesAction({
    status: "published",
    limit: 10,
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://bymay.com/artikel",
    name: "Artikel Islami By May Scarf",
    description:
      "Koleksi artikel tentang Al-Qur'an, perlengkapan ibadah, dan kehidupan islami",
    publisher: {
      "@type": "Organization",
      name: "By May Scarf",
      logo: {
        "@type": "ImageObject",
        url: "https://bymay.com/img/Logo.jpg",
      },
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.data.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://bymay.com/artikel/${article.slug}`,
      })),
    },
  };

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MainNav />
      {children}
    </>
  );
}
