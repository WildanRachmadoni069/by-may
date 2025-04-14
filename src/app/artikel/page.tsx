import { Metadata } from "next";
import { ArticleCard } from "@/components/general/ArticleCard";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Footer from "@/components/landingpage/Footer";
// Replace direct DB import with server-side data fetching
import { getArticles } from "@/lib/api/articles-server";

// Metadata remains the same
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
        url: "/og-image.jpg", // Add your OG image
        width: 1200,
        height: 630,
        alt: "By May Scarf Articles",
      },
    ],
  },
};

export default async function ArticlePage() {
  // Use server component data fetching instead of direct DB access
  const articlesResult = await getArticles({ status: "published" });
  const articles = articlesResult.data || [];

  return (
    <>
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Beranda</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Artikel</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            Artikel Islami
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Temukan inspirasi, pengetahuan, dan wawasan seputar Al-Qur'an,
            perlengkapan ibadah, dan kehidupan islami.
          </p>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                excerpt={article.excerpt || ""}
                slug={article.slug}
                featured_image={
                  (article.featured_image as any) || { url: "", alt: "" }
                }
                created_at={
                  article.publishedAt?.toString() ||
                  article.createdAt.toString()
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Belum ada artikel yang tersedia.
            </p>
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}
