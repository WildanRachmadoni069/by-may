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
import { getArticlesAction } from "@/app/actions/article-actions";
import { SearchArticles } from "@/components/article/SearchArticles";
import { Article } from "@/lib/api/articles";
import { ArticlePagination } from "@/components/article/ArticlePagination";
import { ArticleEmptyState } from "@/components/article/ArticleEmptyState";
import { Suspense } from "react";
import { ArticleSkeletons } from "@/components/article/ArticleSkeletons";

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

export default async function ArticlePage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  // Parse search parameters with defaults
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const ITEMS_PER_PAGE = 9; // Show 9 articles per page (3x3 grid)

  // Fetch articles with server-side pagination and search
  const articlesResult = await getArticlesAction({
    status: "published",
    page,
    limit: ITEMS_PER_PAGE,
    search,
  });

  const articles: Article[] = articlesResult.data || [];
  const { total, totalPages } = articlesResult.pagination;
  const hasArticles = articles.length > 0;

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

        <div className="max-w-3xl mx-auto text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            Artikel Islami
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6">
            Temukan inspirasi, pengetahuan, dan wawasan seputar Al-Qur'an,
            perlengkapan ibadah, dan kehidupan islami.
          </p>

          {/* Search Bar */}
          <SearchArticles currentSearch={search} />
        </div>

        {/* Search Feedback */}
        {search && (
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              {hasArticles ? (
                <>
                  Menampilkan {total} hasil untuk pencarian{" "}
                  <span className="font-medium">"{search}"</span>
                </>
              ) : (
                <>
                  Tidak ditemukan artikel untuk pencarian{" "}
                  <span className="font-medium">"{search}"</span>
                </>
              )}
            </p>
          </div>
        )}

        <Suspense fallback={<ArticleSkeletons count={ITEMS_PER_PAGE} />}>
          {/* Articles Grid */}
          {hasArticles ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  excerpt={article.excerpt || ""}
                  slug={article.slug}
                  featured_image={
                    article.featured_image || { url: "", alt: "" }
                  }
                  created_at={
                    article.publishedAt?.toString() ||
                    article.createdAt.toString()
                  }
                />
              ))}
            </div>
          ) : (
            <ArticleEmptyState search={search} />
          )}
        </Suspense>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <ArticlePagination
              currentPage={page}
              totalPages={totalPages}
              search={search}
            />
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}
