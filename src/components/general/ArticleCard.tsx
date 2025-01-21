import Image from "next/image";
import Link from "next/link";

interface ArticleCardProps {
  title: string;
  excerpt: string;
  image: string;
  slug: string;
  date: string;
}

export function ArticleCard({
  title,
  excerpt,
  image,
  slug,
  date,
}: ArticleCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <Image src={image} alt={title} layout="fill" objectFit="cover" />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{date}</p>
        <p className="text-gray-700 mb-4">{excerpt}</p>
        <Link
          href={`/artikel/${slug}`}
          className="text-blue-600 hover:underline"
        >
          Baca selengkapnya
        </Link>
      </div>
    </article>
  );
}
