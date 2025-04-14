import { Metadata } from "next";
import { Navbar } from "@/components/landingpage/Navbar";
import React from "react";

export const metadata: Metadata = {
  title: "Artikel",
  description:
    "Koleksi artikel tentang Al-Qur'an, perlengkapan ibadah, dan kehidupan islami untuk memperkaya pemahaman dan meningkatkan kualitas ibadah Anda.",
  openGraph: {
    title: "Artikel",
    description:
      "Koleksi artikel islami untuk memperkaya pemahaman dan meningkatkan kualitas ibadah Anda.",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "By May Scarf Articles",
      },
    ],
  },
};

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
