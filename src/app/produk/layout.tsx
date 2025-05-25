/**
 * Layout Halaman Produk
 * @module ProductLayout
 * @description Layout untuk halaman daftar dan detail produk dengan:
 * - Metadata SEO dan OpenGraph
 * - Navigasi utama
 * - Structured data untuk daftar produk
 * - Breadcrumb data terstruktur
 */
import MainNav from "@/components/landingpage/MainNav";
import React from "react";
import { Metadata } from "next";
import { ProductService } from "@/lib/services/product-service";
import SimpleStructuredData from "@/components/seo/SimpleStructuredData";

// SEO metadata untuk halaman produk
export const metadata: Metadata = {
  title: "Produk Al-Quran Custom Cover | bymayscarf",
  description:
    "Temukan koleksi lengkap produk bymayscarf, dari Al-Qur'an custom cover hingga perlengkapan ibadah berkualitas di Surabaya.",
  keywords: [
    "al-quran custom",
    "produk islami",
    "al-quran custom cover",
    "perlengkapan ibadah",
    "mushaf custom",
    "quran custom nama",
  ],
  openGraph: {
    title: "Produk Al-Quran Custom Cover | bymayscarf",
    description:
      "Temukan koleksi lengkap produk bymayscarf, dari Al-Qur'an custom cover hingga perlengkapan ibadah berkualitas di Surabaya.",
    type: "website",
    url: `${
      process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop"
    }/produk`,
    siteName: "bymayscarf",
    locale: "id_ID",
    images: [
      {
        url: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop"
        }/img/Landing-Page/header-image.webp`,
        width: 1200,
        height: 630,
        alt: "Koleksi Produk bymayscarf",
      },
    ],
  },
  alternates: {
    canonical: `${
      process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop"
    }/produk`,
  },
};

// Mengatur revalidasi setiap 1 jam
export const revalidate = 3600;

async function ProductPageLayout({ children }: { children: React.ReactNode }) {
  // Fetch featured products untuk structured data
  const featuredProducts = await ProductService.getProducts({
    page: 1,
    limit: 8,
    specialLabel: "best",
    includePriceVariants: true,
  });
  // Generate structured data untuk produk listing
  const productListStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: featuredProducts.data.length,
    itemListElement: featuredProducts.data.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        "@id": `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop"
        }/produk/${product.slug}#product`,
        name: product.name,
        description: product.description || product.name,
        image: [
          product.featuredImage?.url || "",
          ...(product.additionalImages?.map((img) => img.url) || []),
        ],
        url: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop"
        }/produk/${product.slug}`,
        sku: product.priceVariants?.[0]?.sku || `BYMAY-${product.id}`,
        brand: {
          "@type": "Brand",
          name: "By May Scarf",
        },
        category: product.category?.name,
        weight: product.weight
          ? {
              "@type": "QuantitativeValue",
              value: product.weight,
              unitText: "gram",
            }
          : undefined,
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "IDR",
          availability:
            (product.baseStock ?? 0) > 0 ||
            (product.priceVariants ?? []).some((v) => (v.stock ?? 0) > 0)
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          lowPrice:
            product.basePrice ??
            Math.min(
              ...(product.priceVariants?.map((v) => v.price ?? 0) ?? [0])
            ),
          highPrice:
            product.basePrice ??
            Math.max(
              ...(product.priceVariants?.map((v) => v.price ?? 0) ?? [0])
            ),
          offerCount:
            (product.priceVariants?.length ?? 0) + (product.basePrice ? 1 : 0),
          url: `${
            process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop"
          }/produk/${product.slug}`,
          seller: {
            "@type": "Organization",
            name: "By May Scarf",
          },
        },
      },
    })),
  };

  // Generate structured data untuk breadcrumb
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Produk",
        item: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop"
        }/produk`,
      },
    ],
  };

  return (
    <>
      <MainNav />
      <main>
        {/* SEO-friendly heading (tersembunyi tapi tetap dapat dibaca screen reader) */}
        <h1 className="sr-only">Produk Al-Quran Custom Cover By May Scarf</h1>

        {/* Structured Data */}
        <SimpleStructuredData data={productListStructuredData} />
        <SimpleStructuredData data={breadcrumbStructuredData} />

        {children}
      </main>
    </>
  );
}

export default ProductPageLayout;
