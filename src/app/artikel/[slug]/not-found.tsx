import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ArticleNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Artikel Tidak Ditemukan
        </h2>
        <p className="text-gray-600 mb-6">
          Maaf, artikel yang Anda cari tidak dapat ditemukan. Mungkin artikel
          tersebut telah dihapus atau URL yang Anda masukkan salah.
        </p>
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/artikel">Lihat Semua Artikel</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
