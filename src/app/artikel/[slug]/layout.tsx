/**
 * Layout Detail Artikel
 * @description Layout untuk halaman detail artikel yang menangani metadata dasar
 * dan struktur umum halaman detail artikel
 */
import { Metadata } from "next";
import { logError } from "@/lib/debug";

// Enable ISR fallback untuk halaman yang tidak di-generate saat build
export const dynamicParams = true;

export const revalidate = 3600;

/**
 * Metadata dasar untuk template artikel
 */
export const metadata: Metadata = {
  title: {
    template: "%s | By May Scarf",
    default: "Artikel | By May Scarf",
  },
  description: "Artikel islami dan inspiratif dari By May Scarf",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": "-1",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: `${
      process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop"
    }/artikel`,
  },
  openGraph: {
    type: "article",
    siteName: "By May Scarf",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    site: "@by.mayofficial",
  },
};

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

/**
 * Layout component untuk halaman detail artikel
 * @param props - Props komponen
 * @param props.children - Child components yang akan di-render
 */
export default function ArticleDetailLayout({ children, params }: Props) {
  return <>{children}</>;
}
