import Link from "next/link";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="bg-white border-t"
      itemScope
      itemType="https://schema.org/WPFooter"
    >
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div itemScope itemType="https://schema.org/Organization">
            <div>
              <Link href="/" itemProp="url">
                <Image
                  src="/img/Logo.jpg"
                  alt="By May Scarf"
                  width={150}
                  height={50}
                  className="h-auto"
                  itemProp="logo"
                />
              </Link>
            </div>
            <p className="text-gray-600 mb-4" itemProp="description">
              Spesialis Al-Qur&apos;an custom cover dan perlengkapan ibadah
              berkualitas. Mewujudkan keindahan dalam beribadah dengan sentuhan
              personal.
            </p>
          </div>{" "}
          {/* Contact Column */}
          <div itemScope itemType="https://schema.org/ContactPoint">
            <h3 className="text-lg font-semibold mb-4">Kontak Kami</h3>
            <div className="space-y-2">
              <a
                href="https://wa.me/6281295038834"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-primary"
                itemProp="telephone"
              >
                <Phone className="w-4 h-4 mr-2" />
                +62 812-9503-8834
              </a>
              <a
                href="mailto:info@bymayscarf.com"
                className="flex items-center text-gray-600 hover:text-primary"
                itemProp="email"
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
              <div
                className="flex items-start text-gray-600"
                itemScope
                itemType="https://schema.org/PostalAddress"
              >
                <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                <span itemProp="addressLocality">Bogor</span>,{" "}
                <span itemProp="addressRegion">Jawa Barat</span>,{" "}
                <span itemProp="addressCountry">Indonesia</span>
              </div>
            </div>
          </div>{" "}
          {/* Products Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Produk Kami</h3>
            <nav
              className="space-y-2"
              itemScope
              itemType="https://schema.org/SiteNavigationElement"
            >
              <Link
                href="/produk?category=Al-Quran"
                className="block text-gray-600 hover:text-primary"
                itemProp="url"
              >
                <span itemProp="name">Al-Qur&apos;an Custom Cover</span>
              </Link>
              <Link
                href="/produk?category=Sajadah"
                className="block text-gray-600 hover:text-primary"
                itemProp="url"
              >
                <span itemProp="name">Sajadah Premium</span>
              </Link>
              <Link
                href="/produk?category=Tasbih"
                className="block text-gray-600 hover:text-primary"
                itemProp="url"
              >
                <span itemProp="name">Tasbih</span>
              </Link>
              <Link
                href="/produk?category=Hampers"
                className="block text-gray-600 hover:text-primary"
                itemProp="url"
              >
                <span itemProp="name">Hampers Islami</span>
              </Link>
              <Link
                href="/produk"
                className="block text-gray-600 hover:text-primary"
                itemProp="url"
              >
                <span itemProp="name">Semua Produk</span>
              </Link>
            </nav>
          </div>{" "}
          {/* Information Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informasi</h3>
            <nav
              className="space-y-2"
              itemScope
              itemType="https://schema.org/SiteNavigationElement"
            >
              <Link
                href="/tentang-kami"
                className="block text-gray-600 hover:text-primary"
                itemProp="url"
              >
                <span itemProp="name">Tentang Kami</span>
              </Link>
              <Link
                href="/faq"
                className="block text-gray-600 hover:text-primary"
                itemProp="url"
              >
                <span itemProp="name">FAQ</span>
              </Link>
              <Link
                href="/artikel"
                className="block text-gray-600 hover:text-primary"
                itemProp="url"
              >
                <span itemProp="name">Artikel</span>
              </Link>
              <Link
                href="/keranjang"
                className="block text-gray-600 hover:text-primary"
                itemProp="url"
              >
                <span itemProp="name">Keranjang</span>
              </Link>
              <Link
                href="/pesanan"
                className="block text-gray-600 hover:text-primary"
                itemProp="url"
              >
                <span itemProp="name">Pesanan Saya</span>
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
