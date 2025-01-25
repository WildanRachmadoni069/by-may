import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { memo } from "react";

interface ArticleCardProps {
  title: string;
  excerpt: string;
  slug: string;
  featured_image: {
    url: string;
    alt: string;
  };
  created_at?: string;
}

const ArticleCard = memo(function ArticleCard({
  title,
  excerpt,
  slug,
  featured_image,
  created_at,
}: ArticleCardProps) {
  const articleUrl = `/artikel/${slug}`;
  const formattedDate = created_at
    ? format(new Date(created_at), "d MMMM yyyy", { locale: id })
    : null;

  return (
    <article
      className="group flex flex-col bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 h-full"
      itemScope
      itemType="https://schema.org/Article"
    >
      <Link
        href={articleUrl}
        className="relative aspect-[16/9] overflow-hidden bg-gray-100"
        tabIndex={-1}
      >
        <Image
          src={featured_image.url}
          alt={featured_image.alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          quality={75}
          itemProp="image"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/bAIQABgQEBAUEBgUFBgkGBQYJCwgGBggLDAoKCwoKDBAMDAwMDAwQDA4PEA8ODBMTFBQTExwbGxscHx8fHx8fHx8fHwEHBwcNDA0YEBAYGhURFRofHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8f/8AAEQgAIAAgAwERAAIRAQMRAf/EAHsAAQEBAQAAAAAAAAAAAAAAAAYFBwgBAQAAAAAAAAAAAAAAAAAAAAAQAAEEAgEDAwUAAAAAAAAAAAECAwQFEQYSIRMUBzFBUXGBIiMRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AOqYBYLSoE0Usko0LA9zY3uTCqiJ2VDm/kthtLTaTJa1Ej56t35C3e1zkyuM9sL6AXn1A891tNhrbNzXytWOaw3MTlRMtcq4RC9fuz9AOc+InWk3Pz3s0PkeZFBBE2XLsJ1OXK+mengCoewC8AAAAAAAAAAAf//Z"
        />
      </Link>

      <div className="flex flex-col flex-grow p-5 sm:p-6">
        {formattedDate && (
          <time
            dateTime={created_at}
            className="text-sm text-gray-500 mb-2"
            itemProp="datePublished"
          >
            {formattedDate}
          </time>
        )}

        <Link
          href={articleUrl}
          className="group no-underline"
          itemProp="headline"
        >
          <h2 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-primary transition-colors">
            {title}
          </h2>
        </Link>

        <p
          className="text-gray-600 mb-4 line-clamp-2 flex-grow"
          itemProp="description"
        >
          {excerpt}
        </p>

        <Link
          href={articleUrl}
          className="inline-flex items-center text-primary hover:text-primary/80 font-medium mt-auto group/link focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
          aria-label={`Baca artikel ${title}`}
        >
          <span className="relative">
            Baca selengkapnya
            <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-current origin-left scale-x-0 transition-transform group-hover/link:scale-x-100" />
          </span>
          <svg
            aria-hidden="true"
            className="ml-2 w-4 h-4 transition-transform group-hover/link:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
});

ArticleCard.displayName = "ArticleCard";

export { ArticleCard };
