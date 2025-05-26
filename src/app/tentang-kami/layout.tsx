/**
 * Layout Halaman Tentang Kami
 * @module AboutLayout
 * @description Layout untuk halaman tentang kami dengan:
 * - Metadata SEO yang dioptimalkan
 * - Schema.org Organization markup
 * - OpenGraph untuk sharing
 * - Navigasi utama
 */
import MainNav from "@/components/landingpage/MainNav";
import { getSeoData } from "@/lib/services/seo";
import { Metadata } from "next";
import React from "react";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop";
  const canonicalUrl = `${baseUrl}/tentang-kami`;

  try {
    const seoData = await getSeoData("about");

    // Organization structured data
    const organizationStructuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "CV Faza Mega Berlian",
      alternateName: "bymayscarf",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/img/Logo.webp`,
        width: "500",
        height: "500",
      },
      description:
        "Spesialis Al-Quran custom nama dan perlengkapan ibadah berkualitas premium dengan harga terjangkau di Surabaya",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Surabaya",
        addressRegion: "Jawa Timur",
        addressCountry: "ID",
        streetAddress: "Jl. Ketintang Madya III",
      },
      foundingDate: "2021",
      sameAs: [
        "https://instagram.com/by.mayofficial",
        "https://facebook.com/by.mayofficial",
      ],
    };

    // Create breadcrumb structured data
    const breadcrumbStructuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Beranda",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tentang Kami",
          item: canonicalUrl,
        },
      ],
    };

    // Article structured data untuk konten about page
    const articleStructuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Tentang CV Faza Mega Berlian (bymayscarf)",
      description:
        "Sejak 2021, CV Faza Mega Berlian telah menjadi pionir dalam menyediakan Al-Qur'an custom cover berkualitas premium dengan harga terjangkau. Kami hadir di berbagai marketplace seperti Shopee, Tokopedia, Lazada, dan TikTok Shop.",
      publisher: {
        "@type": "Organization",
        name: "bymayscarf",
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/img/Logo.webp`,
          width: "500",
          height: "500",
        },
      },
      author: {
        "@type": "Organization",
        name: "CV Faza Mega Berlian",
        url: baseUrl,
      },
      datePublished: "2021-01-01T00:00:00+07:00",
      dateModified: new Date().toISOString(),
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
      image: {
        "@type": "ImageObject",
        url: `${baseUrl}/img/Logo.webp`,
        width: "500",
        height: "500",
      },
    };

    // Combine all structured data
    const structuredData = [
      organizationStructuredData,
      breadcrumbStructuredData,
      articleStructuredData,
    ];

    const ogImage = seoData?.ogImage
      ? [
          {
            url: seoData.ogImage,
            width: 1200,
            height: 630,
            alt: "CV Faza Mega Berlian (bymayscarf)",
          },
        ]
      : undefined;
    return {
      metadataBase: new URL(baseUrl),
      title:
        seoData?.title ||
        "Tentang CV Faza Mega Berlian | Produsen Al-Quran Custom Cover Premium | bymayscarf",
      description:
        seoData?.description ||
        "CV Faza Mega Berlian (bymayscarf) adalah pionir dalam menyediakan Al-Quran custom cover berkualitas premium dengan harga terjangkau sejak 2021. Hadir di Shopee, Tokopedia, Lazada, dan TikTok Shop dengan 100+ varian produk Al-Quran custom, sajadah, dan perlengkapan ibadah.",
      keywords:
        seoData?.keywords ||
        "CV Faza Mega Berlian, bymayscarf, Al-Quran custom cover Surabaya, Al-Quran custom nama, sajadah custom, perlengkapan ibadah premium, hampers islami, custom Al-Quran murah berkualitas",
      alternates: {
        canonical: canonicalUrl,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
      openGraph: {
        title:
          seoData?.title ||
          "CV Faza Mega Berlian | Produsen Al-Quran Custom Cover Premium | bymayscarf",
        description:
          seoData?.description ||
          "Penyedia Al-Quran custom cover berkualitas premium dengan harga terjangkau. Tersedia di Shopee, Tokopedia, Lazada, dan TikTok Shop dengan 100+ varian produk.",
        type: "website",
        url: canonicalUrl,
        siteName: "bymayscarf",
        locale: "id_ID",
        images: ogImage || [
          {
            url: `${baseUrl}/img/Logo.webp`,
            width: 500,
            height: 500,
            alt: "CV Faza Mega Berlian Logo",
          },
        ],
      },
      other: {
        "script:ld+json": JSON.stringify(structuredData),
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Tentang Kami | bymayscarf",
      description:
        "bymayscarf adalah spesialis Al-Quran custom nama dan perlengkapan ibadah berkualitas di Surabaya. Ketahui lebih lanjut tentang kami.",
    };
  }
}

function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainNav />
      {children}
    </>
  );
}

export default AboutLayout;
