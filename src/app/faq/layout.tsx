import MainNav from "@/components/landingpage/MainNav";
import { getSeoData } from "@/lib/firebase/seo";
import { Metadata } from "next";
import React from "react";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seoData = await getSeoData("faq");

    return {
      title: seoData?.title || "FAQ | By May Scarf",
      description:
        seoData?.description ||
        "Frequently Asked Questions about By May Scarf products",
      keywords: seoData?.keywords,
      openGraph: {
        title: seoData?.title || "FAQ | By May Scarf",
        description: seoData?.description,
        images: seoData?.og_image ? [{ url: seoData.og_image }] : undefined,
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
