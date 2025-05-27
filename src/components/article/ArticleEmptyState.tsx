/**
 * Komponen State Kosong untuk Artikel
 * @module ArticleEmptyState
 * @description Menampilkan pesan saat tidak ada artikel yang dapat ditampilkan,
 * baik karena belum ada artikel atau hasil pencarian tidak ditemukan.
 * Menyediakan tombol navigasi untuk kemudahan pengguna.
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Search, Home } from "lucide-react";

/**
 * Props untuk komponen ArticleEmptyState
 */
interface ArticleEmptyStateProps {
  search?: string;
  showHomeButton?: boolean;
}

export function ArticleEmptyState({
  search,
  showHomeButton = false,
}: ArticleEmptyStateProps) {
  // If the empty state is due to a search query
  if (search) {
    return (
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <Search className="h-8 w-8 text-gray-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Tidak ada hasil pencarian
        </h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Kami tidak dapat menemukan artikel yang sesuai dengan "{search}". Coba
          kata kunci lain atau lihat semua artikel.
        </p>{" "}
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/artikel">
            <Button variant="outline">Lihat Semua Artikel</Button>
          </Link>
          {showHomeButton && (
            <Link href="/">
              <Button variant="ghost">
                <Home className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Default empty state (no articles yet)
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <FileText className="h-8 w-8 text-gray-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Belum ada artikel
      </h2>{" "}
      <p
        className={`text-gray-500 max-w-md mx-auto ${
          showHomeButton ? "mb-6" : "mb-2"
        }`}
      >
        Kami sedang menyiapkan artikel-artikel menarik untuk Anda. Silahkan
        kunjungi halaman ini lagi nanti.
      </p>
      {showHomeButton && (
        <Link href="/">
          <Button>
            <Home className="mr-2 h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </Link>
      )}
    </div>
  );
}
