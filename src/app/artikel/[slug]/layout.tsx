/**
 * Layout Detail Artikel
 * @description Layout untuk halaman detail artikel yang menangani metadata dasar
 * dan struktur umum halaman detail artikel
 */
import { Metadata } from "next";
import { getArticlesAction } from "@/app/actions/article-actions";
import { logError } from "@/lib/debug";

/**
 * Generate static params untuk artikel yang sudah dipublish
 * Ini akan membuat halaman artikel di-prerender saat build time
 * sehingga dapat terindeks dengan baik oleh Google
 */
export async function generateStaticParams() {
  try {
    const articlesResult = await getArticlesAction({
      status: "published",
      page: 1,
      limit: 1000,
    });

    const articles = articlesResult.data || [];
    const validArticles = articles.filter((article) => article.slug);

    return validArticles.map((article) => ({
      slug: article.slug,
    }));
  } catch (error) {
    logError("ArticleLayout.generateStaticParams", error);
    return [];
  }
}

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
