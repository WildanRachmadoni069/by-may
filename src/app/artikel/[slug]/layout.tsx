/**
 * Layout Detail Artikel
 * @description Layout untuk halaman detail artikel yang menangani metadata dasar
 * dan struktur umum halaman detail artikel
 */
import { Metadata } from "next";

/**
 * Metadata dasar untuk template artikel
 */
export const metadata: Metadata = {
  title: {
    template: "%s | By May Scarf",
    default: "Artikel | By May Scarf",
  },
  description: "Artikel islami dan inspiratif dari By May Scarf",
  alternates: {
    canonical: "https://bymay.id/artikel",
  },
  openGraph: {
    type: "article",
    siteName: "By May Scarf",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    site: "@bymay_id",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

/**
 * Komponen layout untuk halaman detail artikel
 * @param {Object} props - Props komponen
 * @param {React.ReactNode} props.children - Konten halaman yang akan di-render
 * @returns {JSX.Element} Layout halaman detail artikel
 */
// Props untuk layout dengan Promise-based params sesuai Next.js 15
interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default function ArticleDetailLayout({ children, params }: Props) {
  return <>{children}</>;
}
