/**
 * Komponen Card Artikel
 * @module ArticleCard
 * @description Menampilkan preview artikel dalam bentuk card dengan gambar, judul,
 * ringkasan, dan tanggal publikasi. Digunakan di halaman daftar artikel
 * dan bagian artikel terkait.
 */
import Link from "next/link";
import Image from "next/image";
import { CalendarIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";

/**
 * Props untuk komponen ArticleCard
 */
interface ArticleCardProps {
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: {
    // Changed from featured_image to featuredImage
    url: string;
    alt: string;
  } | null;
  createdAt: string; // Changed from created_at to createdAt
}

export function ArticleCard({
  title,
  slug,
  excerpt,
  featuredImage, // Changed from featured_image to featuredImage
  createdAt, // Changed from created_at to createdAt
}: ArticleCardProps) {
  // Cek apakah featuredImage valid dan memiliki URL yang tidak kosong
  const hasValidImage =
    featuredImage && featuredImage.url && featuredImage.url.trim() !== "";

  // Placeholder image yang akan digunakan jika tidak ada featured image
  const placeholderImageUrl = "/img/placeholder.png"; // Pastikan ini ada di folder public

  return (
    <Link
      href={`/artikel/${slug}`}
      className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      <div className="aspect-[16/9] overflow-hidden relative">
        {hasValidImage ? (
          <Image
            src={featuredImage.url}
            alt={featuredImage.alt || title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Image
            src={placeholderImageUrl}
            alt="Artikel gambar placeholder"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <CalendarIcon size={14} className="mr-1" />
          <span>{formatDate(createdAt)}</span>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-3">{excerpt}</p>
        <div className="mt-3 text-sm font-medium text-primary flex items-center">
          <span>Baca selengkapnya</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-1 group-hover:translate-x-1 transition-transform"
          >
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </div>
      </div>
    </Link>
  );
}
