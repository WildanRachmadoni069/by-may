import Link from "next/link";
import { Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold mb-4">By May</h3>
            <p className="text-gray-600 mb-4">
              Spesialis Al-Qur'an custom cover dan perlengkapan ibadah
              berkualitas. Mewujudkan keindahan dalam beribadah dengan sentuhan
              personal.
            </p>
            <div className="space-y-2">
              <a
                href="tel:+6281234567890"
                className="flex items-center text-gray-600 hover:text-primary"
              >
                <Phone className="w-4 h-4 mr-2" />
                +62 812-3456-7890
              </a>
              <a
                href="mailto:contact@bymayscarf.com"
                className="flex items-center text-gray-600 hover:text-primary"
              >
                <Mail className="w-4 h-4 mr-2" />
                contact@bymayscarf.com
              </a>
              <a
                href="https://instagram.com/bymayscarf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-primary"
              >
                <Instagram className="w-4 h-4 mr-2" />
                @bymayscarf
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Produk Kami</h3>
            <nav className="space-y-2">
              <Link
                href="/produk/al-quran-custom"
                className="block text-gray-600 hover:text-primary"
              >
                Al-Qur'an Custom Cover
              </Link>
              <Link
                href="/produk/sajadah-custom"
                className="block text-gray-600 hover:text-primary"
              >
                Sajadah Custom
              </Link>
              <Link
                href="/produk/tasbih"
                className="block text-gray-600 hover:text-primary"
              >
                Tasbih
              </Link>
              <Link
                href="/produk/hampers"
                className="block text-gray-600 hover:text-primary"
              >
                Hampers Islami
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Informasi</h3>
            <nav className="space-y-2">
              <Link
                href="/cara-pesan"
                className="block text-gray-600 hover:text-primary"
              >
                Cara Pemesanan Custom
              </Link>
              <Link
                href="/pengiriman"
                className="block text-gray-600 hover:text-primary"
              >
                Informasi Pengiriman
              </Link>
              <Link
                href="/faq"
                className="block text-gray-600 hover:text-primary"
              >
                FAQ
              </Link>
              <Link
                href="/tentang"
                className="block text-gray-600 hover:text-primary"
              >
                Tentang Kami
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} By May. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
