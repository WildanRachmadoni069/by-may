/**
 * Layout Halaman Detail Produk
 * @module ProductDetailLayout
 * @description Layout untuk halaman detail produk dengan:
 * - Dynamic metadata berdasarkan data produk
 * - Schema.org Product markup
 * - OpenGraph dan Twitter Cards
 * - Title, meta description dan canonical URL
 */
import React from "react";
import { Metadata } from "next";
import { ProductService } from "@/lib/services/product-service";
import { createExcerptFromHtml } from "@/lib/utils";
import { generateProductStructuredData } from "@/lib/utils/performance";
import { logError } from "@/lib/debug";

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

interface ProductMeta {
  title?: string;
  description?: string;
  ogImage?: string;
}

/**
 * Generate metadata dinamis berdasarkan produk
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await ProductService.getProductBySlug(slug);

    if (!product) {
      return {
        title: "Produk Tidak Ditemukan",
        description: "Produk yang Anda cari tidak dapat ditemukan.",
      };
    }

    const meta = (product.meta as ProductMeta) || {};
    const description =
      meta.description || createExcerptFromHtml(product.description || "");
    const title = meta.title || product.name;
    const ogImage = meta.ogImage || product.featuredImage?.url;
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop";
    const canonicalUrl = `${baseUrl}/produk/${slug}`;

    // Get min and max prices for price range
    const prices = product.priceVariants.map((v) => v.price);
    const minPrice = Math.min(
      ...(prices.length ? prices : [product.basePrice || 0])
    );
    const maxPrice = Math.max(
      ...(prices.length ? prices : [product.basePrice || 0])
    ); // Generate structured data using utility function
    const structuredData = generateProductStructuredData({
      ...product,
      description,
      basePrice: product.basePrice || 0,
      images: product.additionalImages || [],
      featuredImage: product.featuredImage,
    });
    const keywordList = [product.name, "bymayscarf", "Al-Quran Custom Cover"];

    if (product.category?.name) {
      keywordList.push(product.category.name);
    }

    return {
      title: `${title} | bymayscarf`,
      description: description,
      keywords: keywordList,
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
        title: title,
        description: description,
        type: "website",
        url: canonicalUrl,
        images: ogImage
          ? [
              {
                url: ogImage,
                width: 1200,
                height: 630,
                alt: product.name,
              },
            ]
          : [],
      },
      other: {
        "og:product:availability":
          product.baseStock || product.priceVariants.some((v) => v.stock > 0)
            ? "instock"
            : "out of stock",
        "og:product:price:amount": minPrice.toString(),
        "og:product:price:currency": "IDR",
        "script:ld+json": JSON.stringify(structuredData),
      },
    };
  } catch (error) {
    logError("ProductLayout.generateMetadata", error);
    return {
      title: "Error",
      description: "Terjadi kesalahan saat memuat produk.",
    };
  }
}

// Enable ISR fallback untuk halaman yang tidak di-generate saat build
export const dynamicParams = true;

export const revalidate = 3600;

/**
 * Layout component untuk halaman detail produk
 * @param props - Props komponen
 * @param props.children - Child components yang akan di-render
 */
function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default ProductDetailLayout;
