/**
 * Halaman Detail Artikel
 *
 * Menampilkan konten lengkap dari sebuah artikel beserta metadata, gambar featured,
 * informasi penulis, dan artikel terkait. Halaman ini mengoptimalkan SEO dengan
 * struktur HTML semantik dan metadata yang lengkap.
 */
import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import Footer from "@/components/landingpage/Footer";
import { Metadata, ResolvingMetadata } from "next";
import {
  getArticleAction,
  getArticlesAction,
} from "@/app/actions/article-actions";
import { generateArticleStructuredData } from "@/lib/utils/performance";
import { formatDate } from "@/lib/utils";
import { getBaseUrl } from "@/lib/utils/url";
import { ArticleContent } from "@/components/article/ArticleContent";
import { ArticleShare } from "@/components/article/ArticleShare";
import { ArticleAuthorCard } from "@/components/article/ArticleAuthorCard";
import { RelatedArticlesSection } from "@/components/article/RelatedArticlesSection";
// Structured data component
import StructuredData from "@/components/seo/StructuredData";

// Menghasilkan metadata dinamis untuk setiap artikel
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Awaiting params untuk Next.js 15
  const { slug } = await params;

  // Fetch data artikel
  const article = await getArticleAction(slug);

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan",
      description: "Artikel yang diminta tidak dapat ditemukan.",
    };
  }

  // Gunakan metadata dari artikel atau fallback ke default
  const baseUrl = getBaseUrl();

  return {
    title: article.meta?.title || article.title,
    description: article.meta?.description || article.excerpt || undefined,
    openGraph: {
      type: "article",
      url: `${baseUrl}/artikel/${slug}`,
      title: article.meta?.title || article.title,
      description: article.meta?.description || article.excerpt || undefined,
      images: article.featuredImage?.url
        ? [
            {
              url: article.featuredImage.url,
              width: 1200,
              height: 630,
              alt: article.featuredImage.alt || article.title,
            },
          ]
        : undefined,
      publishedTime: article.publishedAt?.toString(),
      modifiedTime: article.updatedAt?.toString(),
      authors: article.author?.name ? [`${article.author.name}`] : undefined,
    },
    alternates: {
      canonical: `${baseUrl}/artikel/${slug}`,
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Awaiting params untuk Next.js 15
  const { slug } = await params;

  // Fetch data artikel
  const article = await getArticleAction(slug);

  // Jika artikel tidak ditemukan atau tidak dipublikasikan, tampilkan 404
  if (!article || article.status !== "published") {
    notFound();
  }

  // Fetch artikel terkait (artikel terbaru kecuali artikel saat ini)
  const relatedArticlesResult = await getArticlesAction({
    status: "published",
    limit: 3,
  });

  // Filter artikel saat ini
  const relatedArticles = relatedArticlesResult.data
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  // Format tanggal publikasi
  const publishedDate = article.publishedAt || article.createdAt;
  const formattedDate = formatDate(publishedDate);

  // Estimasi waktu baca
  const wordCount = article.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  const readingMinutes = Math.ceil(wordCount / 250); // Asumsi kecepatan baca rata-rata 250 kata per menit

  // Penanganan gambar featured
  const hasValidImage =
    article.featuredImage?.url && article.featuredImage.url.trim() !== "";
  const placeholderImage = "/img/placeholder.png";

  return (
    <main className="min-h-screen">
      {" "}
      {/* Client component for JSON-LD structured data */}
      <StructuredData data={generateArticleStructuredData(article)} />
      <article
        itemScope
        itemType="https://schema.org/Article"
        className="container mx-auto px-4 py-8 max-w-4xl"
      >
        {/* Breadcrumb - penting untuk SEO */}
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
                <BreadcrumbLink asChild>
                  <Link href="/artikel">Artikel</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{article.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Gambar featured dengan atribut meta yang tepat */}
          <figure className="relative w-full aspect-[16/9]">
            {hasValidImage ? (
              <Image
                src={article.featuredImage!.url}
                alt={article.featuredImage!.alt || article.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1200px"
                priority
                className="object-cover"
                itemProp="image"
              />
            ) : (
              <Image
                src={placeholderImage}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1200px"
                priority
                className="object-cover"
              />
            )}
          </figure>

          <div className="p-6 md:p-8">
            {/* Header artikel dengan hierarki header yang tepat */}
            <header className="mb-6">
              <h1
                itemProp="headline"
                className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900"
              >
                {article.title}
              </h1>

              <div className="flex flex-wrap justify-between items-center text-sm text-gray-500 gap-4">
                {/* Info penulis dan tanggal dengan atribut structured data */}
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center"
                    itemProp="author"
                    itemScope
                    itemType="https://schema.org/Person"
                  >
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage
                        src="/img/avatar-placeholder.png"
                        alt={article.author?.name || "Admin"}
                      />
                      <AvatarFallback>
                        {article.author?.name?.charAt(0) || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <span itemProp="name">
                      {article.author?.name || "Admin"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <CalendarIcon className="mr-1 h-4 w-4" />{" "}
                    <time
                      itemProp="datePublished"
                      dateTime={
                        typeof publishedDate === "object" &&
                        publishedDate !== null
                          ? (publishedDate as Date).toISOString()
                          : new Date(String(publishedDate || "")).toISOString()
                      }
                    >
                      {formattedDate}
                    </time>
                  </div>

                  <div className="flex items-center">
                    <span>{readingMinutes} menit membaca</span>
                  </div>
                </div>

                {/* Tombol berbagi */}
                <ArticleShare title={article.title} slug={article.slug} />
              </div>

              <Separator className="my-6" />
            </header>

            {/* Konten artikel dengan HTML semantik */}
            <div itemProp="articleBody">
              <ArticleContent content={article.content} />
            </div>

            {/* Kartu penulis */}
            <footer className="mt-10">
              <ArticleAuthorCard
                name={article.author?.name || "Admin"}
                role="Penulis"
                bio="Bekerja di By May Scarf, gemar menulis artikel seputar tips, inspirasi, dan pengetahuan tentang hijab dan fashion islami."
              />
            </footer>
          </div>
        </div>

        {/* Artikel terkait dengan pengelompokan semantik */}
        {relatedArticles.length > 0 && (
          <section aria-labelledby="related-articles-heading" className="mt-12">
            <h2
              id="related-articles-heading"
              className="text-2xl font-bold mb-6 text-center"
            >
              Artikel Terbaru Lainnya
            </h2>
            <RelatedArticlesSection articles={relatedArticles} />
          </section>
        )}
      </article>
      <Footer />
    </main>
  );
}
