import MainNav from "@/components/landingpage/MainNav";
import { getSeoData } from "@/lib/services/seo";
import { Metadata } from "next";
import React from "react";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seoData = await getSeoData("faq");

    return {
      title: seoData?.title || "FAQ", // Will become "FAQ | By May Scarf" with the template
      description:
        seoData?.description ||
        "Frequently Asked Questions about By May Scarf products",
      keywords: seoData?.keywords || undefined,
      openGraph: {
        title: seoData?.title || "FAQ",
        description: seoData?.description,
        images: seoData?.ogImage ? [{ url: seoData.ogImage }] : undefined,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "FAQ",
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
