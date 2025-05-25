/**
 * Komponen Halaman Detail Artikel
 * @module ArticleDetailPage
 * @description Menampilkan halaman detail artikel dengan optimasi SEO, data terstruktur,
 * dan HTML semantik. Fitur meliputi informasi penulis, waktu baca, berbagi sosial,
 * dan artikel terkait.
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
import StructuredData from "@/components/seo/StructuredData";

/**
 * Menghasilkan metadata dinamis untuk artikel
 * @param {Object} params - Parameter routing halaman
 * @param {ResolvingMetadata} parent - Metadata induk dari layout
 * @returns {Promise<Metadata>} Metadata yang dioptimasi untuk SEO
 */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const { slug } = await params;
    const article = await getArticleAction(slug);

    if (!article || article.status !== "published") {
      return {};
    }

    const previousImages = (await parent).openGraph?.images || [];
    const baseUrl = getBaseUrl();
    const fallbackImage = "/og-image.jpg";
    let metaImage =
      article.featuredImage?.url || article.meta?.ogImage || fallbackImage;
    const imageUrl = metaImage.startsWith("http")
      ? metaImage
      : `${baseUrl}${metaImage}`;

    // Format dates
    const publishDate = article.publishedAt || article.createdAt;
    const modifyDate = article.updatedAt || publishDate;

    return {
      title: article.meta?.title || article.title,
      description:
        article.meta?.description ||
        article.excerpt ||
        `Baca artikel ${article.title} di By May Scarf`,
      keywords: ["artikel islami", "bymayscarf", article.title],
      authors: article.author
        ? [{ name: article.author.name }]
        : [{ name: "bymayscarf" }],
      openGraph: {
        title: article.meta?.title || article.title,
        description:
          article.meta?.description ||
          article.excerpt ||
          `Baca artikel ${article.title} di bymayscarf`,
        type: "article",
        publishedTime: publishDate?.toString(),
        modifiedTime: modifyDate?.toString(),
        authors: article.author?.name ? [article.author.name] : ["bymayscarf"],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: article.meta?.title || article.title,
        description:
          article.meta?.description ||
          article.excerpt ||
          `Baca artikel ${article.title} di By May Scarf`,
        images: [imageUrl],
        creator: "@by.mayofficial",
      },
      alternates: {
        canonical: `${baseUrl}/artikel/${article.slug}`,
      },
      robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-video-preview": "-1",
          "max-snippet": -1,
        },
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {};
  }
}

/**
 * Parameter untuk halaman detail artikel
 * @interface ArticleDetailParams
 */
interface ArticleDetailParams {
  params: Promise<{ slug: string }>;
}

/**
 * Komponen utama halaman detail artikel
 * @param {ArticleDetailParams} props - Parameter halaman
 * @returns {Promise<JSX.Element>} Komponen halaman detail artikel
 */
export default async function ArticleDetailPage({
  params,
}: ArticleDetailParams) {
  const { slug } = await params;
  const article = await getArticleAction(slug);
  if (!article || article.status !== "published") {
    notFound();
  }
  const relatedArticlesResult = await getArticlesAction({
    status: "published",
    limit: 3,
  });
  const relatedArticles = relatedArticlesResult.data
    .filter((a) => a.slug !== slug)
    .slice(0, 3);
  const publishedDate = article.publishedAt || article.createdAt;
  const formattedDate = formatDate(publishedDate);
  const wordCount = article.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  const readingMinutes = Math.ceil(wordCount / 250);
  const hasValidImage =
    article.featuredImage?.url && article.featuredImage.url.trim() !== "";
  const placeholderImage = "/img/placeholder.png";

  return (
    <main className="min-h-screen">
      <StructuredData data={generateArticleStructuredData(article)} />
      <article
        itemScope
        itemType="https://schema.org/Article"
        className="container mx-auto px-4 py-8 max-w-4xl"
      >
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
                <BreadcrumbPage className="max-w-[10rem] md:max-w-full line-clamp-1">
                  {article.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <figure className="relative w-full aspect-[16/9]">
            <Image
              src={
                hasValidImage ? article.featuredImage!.url : placeholderImage
              }
              alt={
                hasValidImage
                  ? article.featuredImage!.alt || article.title
                  : article.title
              }
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1200px"
              priority
              className="object-cover"
              itemProp="image"
            />
          </figure>

          <div className="p-6 md:p-8">
            <header className="mb-6">
              <h1
                itemProp="headline"
                className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900"
              >
                {article.title}
              </h1>

              <div className="flex flex-wrap justify-between items-center text-sm text-gray-500 gap-4">
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
                        {article.author?.name?.[0] || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <span itemProp="name">
                      {article.author?.name || "Admin"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <CalendarIcon className="mr-1 h-4 w-4" />
                    <time
                      itemProp="datePublished"
                      dateTime={new Date(
                        publishedDate || new Date()
                      ).toISOString()}
                    >
                      {formattedDate}
                    </time>
                  </div>

                  <div className="flex items-center">
                    <span>{readingMinutes} menit membaca</span>
                  </div>
                </div>

                <ArticleShare title={article.title} slug={article.slug} />
              </div>

              <Separator className="my-6" />
            </header>

            <div itemProp="articleBody">
              <ArticleContent content={article.content} />
            </div>

            <footer className="mt-10">
              <ArticleAuthorCard
                name={article.author?.name || "Admin"}
                role="Penulis"
                bio="Bekerja di By May Scarf, gemar menulis artikel seputar tips, inspirasi, dan pengetahuan tentang alquran dan fashion islami."
              />
            </footer>
          </div>
        </div>

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
