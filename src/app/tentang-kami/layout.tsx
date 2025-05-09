import MainNav from "@/components/landingpage/MainNav";
import { getSeoData } from "@/lib/services/seo";
import { Metadata } from "next";
import React from "react";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seoData = await getSeoData("about");

    return {
      title: seoData?.title || "Tentang Kami", // Will become "Tentang Kami | By May Scarf" with the template
      description:
        seoData?.description ||
        "By May Scarf adalah spesialis Al-Quran custom nama dan perlengkapan ibadah berkualitas di Surabaya. Ketahui lebih lanjut tentang kami.",
      keywords: seoData?.keywords,
      openGraph: {
        title: seoData?.title || "Tentang Kami",
        description: seoData?.description,
        images: seoData?.ogImage ? [{ url: seoData.ogImage }] : undefined,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Tentang Kami",
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
