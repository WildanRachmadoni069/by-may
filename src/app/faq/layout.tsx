/**
 * Layout Halaman FAQ
 * @module FAQLayout
 * @description Layout untuk halaman FAQ dengan:
 * - Metadata SEO yang dioptimalkan
 * - Schema.org FAQ markup
 * - Navigasi utama
 * - Breadcrumb data terstruktur
 */
import MainNav from "@/components/landingpage/MainNav";
import { getSeoData } from "@/lib/services/seo";
import { Metadata } from "next";
import React from "react";
import { db } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seoData = await getSeoData("faq");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bymay.id";
    const canonicalUrl = `${baseUrl}/faq`;

    // Get FAQs for structured data
    const faqs = await db.fAQ.findMany({
      orderBy: {
        order: "asc",
      },
    });

    // Create FAQ structured data
    const faqStructuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
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
          name: "FAQ",
          item: canonicalUrl,
        },
      ],
    };

    // Combine structured data
    const structuredData = [faqStructuredData, breadcrumbStructuredData];

    return {
      title: seoData?.title || "FAQ | By May Scarf",
      description:
        seoData?.description ||
        "Temukan jawaban atas pertanyaan umum seputar produk Al-Qur'an custom cover, perlengkapan ibadah, dan layanan By May. Kami berkomitmen untuk memberikan informasi yang jelas.",
      keywords:
        seoData?.keywords ||
        "FAQ, pertanyaan umum, bantuan, Al-Quran custom cover, By May Scarf",
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
        title: seoData?.title || "FAQ | By May Scarf",
        description:
          seoData?.description ||
          "Temukan jawaban atas pertanyaan umum seputar produk By May",
        type: "website",
        url: canonicalUrl,
        siteName: "By May Scarf",
        locale: "id_ID",
        images: seoData?.ogImage
          ? [
              {
                url: seoData.ogImage,
                width: 1200,
                height: 630,
                alt: "By May Scarf FAQ",
              },
            ]
          : undefined,
      },
      other: {
        "script:ld+json": JSON.stringify(structuredData),
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "FAQ | By May Scarf",
      description: "Frequently Asked Questions about By May Scarf products",
    };
  }
}

function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainNav />
      {children}
    </>
  );
}

export default FAQLayout;
