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
import { formatDate } from "@/lib/utils";
import { getBaseUrl } from "@/lib/utils/url";
import { ArticleContent } from "@/components/article/ArticleContent";
import { ArticleShare } from "@/components/article/ArticleShare";
import { ArticleAuthorCard } from "@/components/article/ArticleAuthorCard";
import { RelatedArticlesSection } from "@/components/article/RelatedArticlesSection";

// Generate dynamic metadata for each article
export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Await params to resolve the TypeScript error
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  // Fetch article data
  const article = await getArticleAction(slug);

  if (!article) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }

  // Use metadata from article or fallback to defaults
  const baseUrl = getBaseUrl();

  return {
    title: article.meta?.title || article.title,
    description: article.meta?.description || article.excerpt || undefined,
    openGraph: {
      url: `${baseUrl}/artikel/${slug}`,
      title: article.meta?.title || article.title,
      description: article.meta?.description || article.excerpt || undefined,
      images: article.featured_image?.url
        ? [
            {
              url: article.featured_image.url,
              width: 1200,
              height: 630,
              alt: article.featured_image.alt || article.title,
            },
          ]
        : undefined,
      publishedTime: article.publishedAt?.toString(),
      modifiedTime: article.updatedAt?.toString(),
      authors: article.author?.name ? [`${article.author.name}`] : undefined,
    },
  };
}

// Also update the main component function to await params
export default async function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  // Await params to resolve the TypeScript error
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  // Fetch article data
  const article = await getArticleAction(slug);

  // If article is not found or not published, return 404
  if (!article || article.status !== "published") {
    notFound();
  }

  // Fetch related articles (latest articles excluding current)
  const relatedArticlesResult = await getArticlesAction({
    status: "published",
    limit: 3, // Get 3 latest articles
  });

  // Filter out the current article
  const relatedArticles = relatedArticlesResult.data
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3); // Ensure we only have at most 3

  // Format date
  const publishedDate = article.publishedAt || article.createdAt;
  const formattedDate = formatDate(publishedDate);

  // Estimated reading time
  const wordCount = article.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  const readingMinutes = Math.ceil(wordCount / 250); // Assuming average reading speed of 250 words per minute

  // Featured image
  const hasValidImage =
    article.featured_image?.url && article.featured_image.url.trim() !== "";
  const placeholderImage = "/img/placeholder.png"; // Fallback image

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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

        <article className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Featured Image */}
          <div className="relative w-full aspect-[16/9]">
            {hasValidImage ? (
              <Image
                src={article.featured_image!.url}
                alt={article.featured_image!.alt || article.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1200px"
                priority
                className="object-cover"
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
          </div>

          <div className="p-6 md:p-8">
            {/* Article Header */}
            <header className="mb-6">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
                {article.title}
              </h1>

              <div className="flex flex-wrap justify-between items-center text-sm text-gray-500 gap-4">
                {/* Author and Date */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage
                        src="/img/avatar-placeholder.png"
                        alt="Admin"
                      />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <span>{article.author?.name || "Admin"}</span>
                  </div>

                  <div className="flex items-center">
                    <CalendarIcon className="mr-1 h-4 w-4" />
                    <span>{formattedDate}</span>
                  </div>

                  <div className="flex items-center">
                    <span>{readingMinutes} menit membaca</span>
                  </div>
                </div>

                {/* Share buttons */}
                <ArticleShare title={article.title} slug={article.slug} />
              </div>

              <Separator className="my-6" />
            </header>

            {/* Article Content */}
            <ArticleContent content={article.content} />

            {/* Author Card */}
            <div className="mt-10">
              <ArticleAuthorCard
                name={article.author?.name || "Admin"}
                role="Penulis"
                bio="Bekerja di By May Scarf, gemar menulis artikel seputar tips, inspirasi, dan pengetahuan tentang islami."
              />
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12">
            <RelatedArticlesSection articles={relatedArticles} />
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}
