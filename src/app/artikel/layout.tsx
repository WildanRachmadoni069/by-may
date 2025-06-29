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

export const revalidate = 3600;

/**
 * Metadata statis untuk halaman daftar artikel
 */
export const metadata: Metadata = {
  title: "Artikel Islami - bymayscarf",
  description:
    "Koleksi artikel tentang Al-Qur'an, perlengkapan ibadah, dan kehidupan islami untuk memperkaya pemahaman dan meningkatkan kualitas ibadah Anda.",
  keywords: [
    "artikel islami",
    "al-quran",
    "perlengkapan ibadah",
    "kehidupan islami",
    "bymayscarf",
    "artikel agama",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": "-1",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Artikel Islami | bymayscarf",
    description:
      "Koleksi artikel islami untuk memperkaya pemahaman dan meningkatkan kualitas ibadah Anda.",
    type: "website",
    url: `${
      process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop"
    }/artikel`,
    siteName: "bymayscarf",
    locale: "id_ID",
    images: [
      {
        url: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop"
        }/img/Landing-Page/header-image.webp`,
        width: 1200,
        height: 630,
        alt: "bymayscarf Articles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Artikel Islami - bymayscarf",
    description:
      "Koleksi artikel islami untuk memperkaya pemahaman dan meningkatkan kualitas ibadah Anda.",
    creator: "@by.mayofficial",
  },
  alternates: {
    canonical: `${
      process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop"
    }/artikel`,
  },
};

/**
 * Layout component untuk halaman artikel
 * @param props - Props komponen
 * @param props.children - Child components yang akan di-render
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
    "@id": `${
      process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop"
    }/artikel`,
    name: "Artikel Islami bymayscarf",
    description:
      "Koleksi artikel tentang Al-Qur'an, perlengkapan ibadah, dan kehidupan islami",
    publisher: {
      "@type": "Organization",
      name: "bymayscarf",
      logo: {
        "@type": "ImageObject",
        url: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop"
        }/img/Logo.webp`,
      },
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.data.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop"
        }/artikel/${article.slug}`,
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
