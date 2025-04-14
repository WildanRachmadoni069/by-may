/**
 * Halaman Daftar Artikel (Public)
 *
 * Halaman ini menampilkan daftar artikel yang telah dipublikasikan untuk pengunjung website.
 * Termasuk fitur pencarian dan paginasi server-side untuk performa optimal.
 */
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

// Metadata untuk SEO halaman
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

interface ArticlePageProps {
  searchParams: {
    page?: string;
    search?: string;
  };
}

export default async function ArticlePage({ searchParams }: ArticlePageProps) {
  // Await searchParams untuk menghindari error "searchParams should be awaited"
  const params = await Promise.resolve(searchParams);

  // Parse parameter pencarian dengan nilai default
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const ITEMS_PER_PAGE = 9; // 9 artikel per halaman (grid 3x3)

  // Fetch artikel dengan paginasi dan pencarian server-side
  const articlesResult = await getArticlesAction({
    status: "published", // Hanya tampilkan artikel yang sudah dipublikasikan
    page,
    limit: ITEMS_PER_PAGE,
    search,
  });

  const articles: Article[] = articlesResult.data || [];
  const { total, totalPages } = articlesResult.pagination;
  const hasArticles = articles.length > 0;

  // Judul halaman yang SEO-friendly dan sesuai dengan pencarian
  const pageTitle = search
    ? `Hasil Pencarian "${search}" - Artikel Islami`
    : "Artikel Islami";

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb - Penting untuk SEO dan aksesibilitas */}
        <nav aria-label="breadcrumb" className="mb-6">
          <Breadcrumb>
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
        </nav>

        <header className="max-w-3xl mx-auto text-center mb-8">
          {/* H1 untuk judul utama halaman - penting untuk SEO */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            {pageTitle}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6">
            Temukan inspirasi, pengetahuan, dan wawasan seputar Al-Qur'an,
            perlengkapan ibadah, dan kehidupan islami.
          </p>

          {/* Fitur Pencarian Artikel */}
          <SearchArticles currentSearch={search} />
        </header>

        {/* Feedback hasil pencarian untuk UX yang lebih baik */}
        {search && (
          <div className="mb-6 text-center" aria-live="polite">
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

        {/* Konten artikel dengan Suspense untuk loading state */}
        <Suspense fallback={<ArticleSkeletons count={ITEMS_PER_PAGE} />}>
          {/* Grid artikel dengan tag semantik untuk SEO */}
          {hasArticles ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8"
              role="feed"
              aria-busy="false"
            >
              {articles.map((article) => (
                <article key={article.id} className="h-full">
                  <ArticleCard
                    title={article.title}
                    excerpt={article.excerpt || ""}
                    slug={article.slug}
                    featured_image={article.featured_image || null}
                    created_at={
                      article.publishedAt?.toString() ||
                      article.createdAt.toString()
                    }
                  />
                </article>
              ))}
            </div>
          ) : (
            <ArticleEmptyState search={search} />
          )}
        </Suspense>

        {/* Kontrol paginasi dengan label ARIA yang tepat */}
        {totalPages > 1 && (
          <nav
            aria-label="Navigasi halaman artikel"
            className="flex justify-center mt-12"
          >
            <ArticlePagination
              currentPage={page}
              totalPages={totalPages}
              search={search}
            />
          </nav>
        )}
      </section>
      <Footer />
    </main>
  );
}
