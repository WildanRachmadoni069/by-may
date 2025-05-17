import BannerLandingpage from "@/components/landingpage/BannerLandingpage";
import HeroLandingpage from "@/components/landingpage/HeroLandingpage";
import MainLayout from "@/components/layouts/MainLayout";
import SimpleStructuredData from "@/components/seo/SimpleStructuredData";
import { generateLightHomeStructuredData } from "@/lib/utils/lightSeo";
import type { Metadata } from "next";
import HomeCollections from "@/components/landingpage/HomeCollections";

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

// Increase revalidation period to reduce build frequency
export const revalidate = 86400; // 24 hours

export default async function Home() {
  // Use lightweight structured data that doesn't depend on fetched products
  const lightStructuredData = generateLightHomeStructuredData();

  // Halaman home dengan metadata dan structured data optimasi SEO
  return (
    <MainLayout>
      {/* Use lightweight structured data component */}
      <SimpleStructuredData data={lightStructuredData} />

      {/* Main hero section dengan properti semantik yang tepat */}
      <HeroLandingpage />
      <BannerLandingpage />

      {/* Use the client component wrapper for collections */}
      <HomeCollections
        featuredProductsTitle="Produk Unggulan"
        featuredProductsLink="/produk?specialLabel=best"
        newProductsTitle="Produk Terbaru"
        newProductsLink="/produk?specialLabel=new"
      />
    </MainLayout>
  );
}
