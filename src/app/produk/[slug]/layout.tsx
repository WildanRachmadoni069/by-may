import React from "react";
import { Metadata } from "next";
import { ProductService } from "@/lib/services/product-service";
import { createExcerptFromHtml } from "@/lib/utils";

// Props untuk layout dengan Promise-based params sesuai Next.js 15
interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

// Define a proper type for the meta object to fix property access errors
interface ProductMeta {
  title?: string;
  description?: string;
  ogImage?: string;
}

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

    // Type assertion to ensure meta is of the correct type
    const meta = (product.meta as ProductMeta) || {};
    const description =
      meta.description || createExcerptFromHtml(product.description || "");
    const title = meta.title || product.name;
    const ogImage = meta.ogImage || product.featuredImage?.url;

    return {
      title: title,
      description: description,
      openGraph: {
        title: title,
        description: description,
        // Fix the OpenGraph type to match allowed values in Next.js Metadata
        type: "website", // Changed from "product" to "website" which is supported by Next.js
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
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error",
      description: "Terjadi kesalahan saat memuat produk.",
    };
  }
}

function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main>{children}</main>
    </>
  );
}

export default ProductDetailLayout;
