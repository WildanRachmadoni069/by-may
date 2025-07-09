import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Produk Tidak Ditemukan
        </h2>
        <p className="text-gray-600 mb-6">
          Maaf, produk yang Anda cari tidak dapat ditemukan. Mungkin produk
          tersebut telah dihapus atau URL yang Anda masukkan salah.
        </p>
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/produk">Lihat Semua Produk</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
