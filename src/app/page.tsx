import ProductCollections from "@/components/general/ProductCollections";
import ArticleCollection from "@/components/landingpage/ArticleCollection";
import BannerLandingpage from "@/components/landingpage/BannerLandingpage";
import HeroLandingpage from "@/components/landingpage/HeroLandingpage";
import MainLayout from "@/components/layouts/MainLayout";
import StructuredData from "@/components/seo/StructuredData";
import { generateHomeStructuredData } from "@/lib/utils/performance";
import { getProducts } from "@/lib/api/products";
import type { Metadata } from "next";

/**
 * Metadata spesifik untuk halaman beranda
 * Metadata ini akan menggantikan metadata default dari layout.tsx
 */
export const metadata: Metadata = {
  title: "Al-Quran Custom Nama di Cover | By May Scarf",
  description:
    "Jual Al-Quran custom cover dengan nama, pilihan desain cantik dan harga terjangkau. Spesialis Al-Quran custom berkualitas tinggi di Indonesia.",
  keywords: [
    "al-quran custom cover",
    "al-quran custom nama",
    "jual al-quran custom",
    "al-quran custom murah",
  ],
};

export default async function Home() {
  // Fetch products for structured data
  const featuredProducts = await getProducts({
    specialLabel: "best",
    limit: 10,
    includePriceVariants: true,
  }).catch(() => ({ data: [] }));

  const newProducts = await getProducts({
    specialLabel: "new",
    limit: 10,
    includePriceVariants: true,
  }).catch(() => ({ data: [] }));
  // Halaman home dengan metadata dan structured data optimasi SEO
  return (
    <MainLayout>
      {/* Client component untuk JSON-LD structured data */}
      <StructuredData
        data={generateHomeStructuredData(
          featuredProducts?.data || [],
          newProducts?.data || []
        )}
      />

      {/* Main hero section dengan properti semantik yang tepat */}
      <HeroLandingpage />
      <BannerLandingpage />

      {/* Section produk unggulan dengan atribut HTML semantik */}
      <section
        aria-labelledby="featured-products"
        className="py-12"
        itemScope
        itemType="https://schema.org/CollectionPage"
      >
        <ProductCollections
          title="Produk Unggulan"
          specialLabel="best"
          viewAllLink="/produk?specialLabel=best"
        />
      </section>

      {/* Section produk terbaru dengan atribut HTML semantik */}
      <section
        aria-labelledby="new-products"
        className="py-12"
        itemScope
        itemType="https://schema.org/CollectionPage"
      >
        <ProductCollections
          title="Produk Terbaru"
          specialLabel="new"
          viewAllLink="/produk?specialLabel=new"
        />
      </section>

      {/* Section artikel terbaru */}
      <section aria-labelledby="latest-articles" className="py-12">
        <ArticleCollection />
      </section>
    </MainLayout>
  );
}
