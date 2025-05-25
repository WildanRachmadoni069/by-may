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
  try {
    const seoData = await getSeoData("about");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bymay.id";
    const canonicalUrl = `${baseUrl}/tentang-kami`;

    // Organization structured data
    const organizationStructuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "CV Faza Mega Berlian",
      alternateName: "By May Scarf",
      url: baseUrl,
      logo: `${baseUrl}/img/Logo.jpg`,
      description:
        "Spesialis Al-Quran custom nama dan perlengkapan ibadah berkualitas di Surabaya",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Surabaya",
        addressRegion: "Jawa Timur",
        addressCountry: "ID",
      },
      foundingDate: "2019",
      sameAs: [
        "https://instagram.com/bymay.id",
        "https://facebook.com/bymay.id",
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
      headline: "Tentang CV Faza Mega Berlian (By May Scarf)",
      description:
        "Sejak 2019, CV Faza Mega Berlian telah menjadi pionir dalam menyediakan Al-Qur'an custom cover dan perlengkapan ibadah berkualitas dengan harga terjangkau di Surabaya.",
      publisher: {
        "@type": "Organization",
        name: "By May Scarf",
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/img/Logo.jpg`,
        },
      },
      datePublished: "2019-01-01T00:00:00+07:00",
      dateModified: new Date().toISOString(),
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
            alt: "CV Faza Mega Berlian (By May Scarf)",
          },
        ]
      : undefined;

    return {
      title: seoData?.title || "Tentang Kami | By May Scarf",
      description:
        seoData?.description ||
        "CV Faza Mega Berlian (By May Scarf) adalah pionir dalam menyediakan Al-Quran custom cover dan perlengkapan ibadah berkualitas di Surabaya sejak 2019. Ketahui lebih lanjut tentang visi, misi, dan komitmen kami.",
      keywords:
        seoData?.keywords ||
        "CV Faza Mega Berlian, By May Scarf, tentang kami, Al-Quran custom cover Surabaya, perlengkapan ibadah, visi misi perusahaan",
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
        title: seoData?.title || "Tentang CV Faza Mega Berlian | By May Scarf",
        description:
          seoData?.description ||
          "Pionir Al-Quran custom cover dan perlengkapan ibadah berkualitas di Surabaya sejak 2019",
        type: "website",
        url: canonicalUrl,
        siteName: "By May Scarf",
        locale: "id_ID",
        images: ogImage,
      },
      other: {
        "script:ld+json": JSON.stringify(structuredData),
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Tentang Kami | By May Scarf",
      description:
        "By May Scarf adalah spesialis Al-Quran custom nama dan perlengkapan ibadah berkualitas di Surabaya. Ketahui lebih lanjut tentang kami.",
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
