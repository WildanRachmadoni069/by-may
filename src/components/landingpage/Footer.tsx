import Link from "next/link";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div>
            <div>
              <Link href="/">
                <Image
                  src="/img/Logo.jpg"
                  alt="By May Scarf"
                  width={150}
                  height={50}
                  className="h-auto"
                />
              </Link>
            </div>
            <p className="text-gray-600 mb-4">
              Spesialis Al-Qur&apos;an custom cover dan perlengkapan ibadah
              berkualitas. Mewujudkan keindahan dalam beribadah dengan sentuhan
              personal.
            </p>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontak Kami</h3>
            <div className="space-y-2">
              <a
                href="https://wa.me/6281295038834"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-primary"
              >
                <Phone className="w-4 h-4 mr-2" />
                +62 812-9503-8834
              </a>
              <a
                href="mailto:info@bymayscarf.com"
                className="flex items-center text-gray-600 hover:text-primary"
              >
                <Mail className="w-4 h-4 mr-2" />
                info@bymayscarf.com
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
              <div className="flex items-start text-gray-600">
                <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                <span>Bogor, Jawa Barat, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Products Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Produk Kami</h3>
            <nav className="space-y-2">
              <Link
                href="/produk?category=Al-Quran"
                className="block text-gray-600 hover:text-primary"
              >
                Al-Qur&apos;an Custom Cover
              </Link>
              <Link
                href="/produk?category=Sajadah"
                className="block text-gray-600 hover:text-primary"
              >
                Sajadah Premium
              </Link>
              <Link
                href="/produk?category=Tasbih"
                className="block text-gray-600 hover:text-primary"
              >
                Tasbih
              </Link>
              <Link
                href="/produk?category=Hampers"
                className="block text-gray-600 hover:text-primary"
              >
                Hampers Islami
              </Link>
              <Link
                href="/produk"
                className="block text-gray-600 hover:text-primary"
              >
                Semua Produk
              </Link>
            </nav>
          </div>

          {/* Information Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informasi</h3>
            <nav className="space-y-2">
              <Link
                href="/tentang-kami"
                className="block text-gray-600 hover:text-primary"
              >
                Tentang Kami
              </Link>
              <Link
                href="/faq"
                className="block text-gray-600 hover:text-primary"
              >
                FAQ
              </Link>
              <Link
                href="/artikel"
                className="block text-gray-600 hover:text-primary"
              >
                Artikel
              </Link>
              <Link
                href="/keranjang"
                className="block text-gray-600 hover:text-primary"
              >
                Keranjang
              </Link>
              <Link
                href="/pesanan"
                className="block text-gray-600 hover:text-primary"
              >
                Pesanan Saya
              </Link>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-12 pt-8 text-center text-gray-600">
          <p>
            &copy; {new Date().getFullYear()} By May Scarf. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
