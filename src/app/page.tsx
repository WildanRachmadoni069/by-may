import BannerLandingpage from "@/components/landingpage/BannerLandingpage";
import HeroLandingpage from "@/components/landingpage/HeroLandingpage";
import MainLayout from "@/components/layouts/MainLayout";
import SimpleStructuredData from "@/components/seo/SimpleStructuredData";
import { generateLightHomeStructuredData } from "@/lib/utils/lightSeo";
import type { Metadata } from "next";
import HomeCollections from "@/components/landingpage/HomeCollections";
import { getSeoData } from "@/lib/services/seo";

/**
 * Menghasilkan metadata dinamis untuk halaman beranda
 * Data diambil dari database melalui getSeoData
 * @returns {Promise<Metadata>} Metadata untuk SEO dan OpenGraph
 */
export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData("homepage");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop";

  return {
    metadataBase: new URL(baseUrl),
    title:
      seoData?.title || "Al-Quran Custom Nama Murah di Surabaya | By May Scarf",
    description:
      seoData?.description ||
      "Jual Al-Quran custom cover dengan nama berlokasi di Surabaya, pilihan desain cantik dan harga terjangkau. Spesialis Al-Quran custom berkualitas tinggi di Indonesia.",
    keywords: seoData?.keywords?.split(",") || [
      "al-quran custom cover",
      "al-quran custom nama",
      "jual al-quran custom",
      "al-quran custom murah",
      "al-quran custom nama murah di Surabaya",
      "bymayscarf alquran custom nama murah di surabaya",
    ],
    openGraph: {
      title: seoData?.title || "Al-Quran Custom Nama di Cover | By May Scarf",
      description:
        seoData?.description ||
        "Jual Al-Quran custom cover dengan nama, pilihan desain cantik dan harga terjangkau. Spesialis Al-Quran custom berkualitas tinggi di Indonesia.",
      type: "website",
      url: baseUrl,
      siteName: "bymayscarf",
      locale: "id_ID",
      images: seoData?.ogImage
        ? [
            {
              url: seoData.ogImage,
              width: 1200,
              height: 630,
              alt: "By May Scarf - Al-Quran Custom Cover",
            },
          ]
        : [
            {
              url: `${baseUrl}/img/Landing-Page/header-image.webp`,
              width: 1200,
              height: 630,
              alt: "By May Scarf - Al-Quran Custom Cover",
            },
          ],
    },
  };
}

export const revalidate = 86400;

export default async function Home() {
  const lightStructuredData = generateLightHomeStructuredData();

  return (
    <MainLayout>
      <SimpleStructuredData data={lightStructuredData} />
      <div>
        <HeroLandingpage />
        <BannerLandingpage />
      </div>
      <div className="mt-0">
        <HomeCollections
          featuredProductsTitle="Produk Unggulan"
          featuredProductsLink="/produk?specialLabel=best"
          newProductsTitle="Produk Terbaru"
          newProductsLink="/produk?specialLabel=new"
        />
      </div>
    </MainLayout>
  );
}
