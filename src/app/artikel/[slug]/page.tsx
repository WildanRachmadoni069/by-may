import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Facebook,
  Twitter,
  Share2,
  MessageCircle,
  CalendarIcon,
  ClockIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import Footer from "@/components/landingpage/Footer";
import { getArticleAction } from "@/app/actions/article-actions";

interface Props {
  params: {
    slug: string;
  };
}

const ShareButton = ({ url, title }: { url: string; title: string }) => {
  const shareButtons = [
    {
      icon: <Facebook size={18} />,
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
    },
    {
      icon: <Twitter size={18} />,
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title)}`,
    },
    {
      icon: <MessageCircle size={18} />,
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    },
  ];

  return (
    <div className="flex items-center gap-3">
      <Share2 size={16} className="text-gray-400" />
      <div className="flex gap-1">
        {shareButtons.map((btn) => (
          <Button
            key={btn.label}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:text-blue-600"
            asChild
          >
            <Link
              href={btn.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${btn.label}`}
            >
              {btn.icon}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
};

const ReadingTime = ({ content }: { content: string }) => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);

  return `${minutes} menit membaca`;
};

export default async function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  // Use the server action instead of the direct Prisma function
  const article = await getArticleAction(params.slug);

  // If article doesn't exist, show 404 page
  if (!article) {
    notFound();
  }

  // Format the date for display (publishedAt or createdAt)
  // Ensure date objects are properly handled
  const displayDate = article.publishedAt
    ? new Date(article.publishedAt)
    : new Date(article.createdAt);

  return (
    <>
      <article className="min-h-screen">
        {/* Hero Section */}
        <div className="relative h-[70vh] bg-gray-900">
          {/* Featured Image as Background */}
          <Image
            src={(article.featured_image as any)?.url || "/placeholder.jpg"}
            alt={(article.featured_image as any)?.alt || article.title}
            fill
            className="object-cover opacity-40"
            priority
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40" />

          {/* Content Container */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="pt-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/" className="text-gray-300 hover:text-white">
                        Beranda
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-gray-400" />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link
                        href="/artikel"
                        className="text-gray-300 hover:text-white"
                      >
                        Artikel
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-gray-400" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white">
                      {article.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Article Header */}
            <div className="absolute bottom-0 max-w-3xl mb-12">
              <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
                <Link
                  href="/artikel"
                  className="bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full border border-blue-400/20 hover:bg-blue-600/20 transition-colors"
                >
                  Artikel
                </Link>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <ClockIcon size={14} />
                  <span>{ReadingTime({ content: article.content })}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Author & Date */}
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-white/10">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${
                      (article.author as any)?.name || "Admin"
                    }`}
                    alt={(article.author as any)?.name || "Admin"}
                  />
                  <AvatarFallback>
                    {((article.author as any)?.name || "Admin")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-white">
                    {(article.author as any)?.name || "Admin"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CalendarIcon size={14} />
                    <time dateTime={displayDate.toISOString()}>
                      {displayDate.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500/50
              prose-blockquote:bg-blue-50 prose-blockquote:p-6 prose-blockquote:rounded-lg
              prose-strong:text-gray-900
              prose-img:rounded-lg prose-img:shadow-lg
              prose-ul:list-disc prose-ol:list-decimal
              prose-li:text-gray-600 prose-li:mb-2"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Share Section */}
          <div className="mt-12">
            <Separator className="mb-8" />
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Bagikan artikel ini
              </h3>
              <ShareButton
                url={`${
                  process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.com"
                }/artikel/${article.slug}`}
                title={article.title}
              />
            </div>
          </div>
        </div>
      </article>
      <Footer />
    </>
  );
}
