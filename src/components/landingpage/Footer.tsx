import Link from "next/link";
import { BsInstagram, BsWhatsapp, BsTiktok } from "react-icons/bs";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="bg-background border-t border-border relative"
      itemScope
      itemType="https://schema.org/WPFooter"
    >
      <div className="container px-4 py-16 mx-auto">
        <div className="grid grid-cols-1 gap-12 md:gap-16 md:grid-cols-4">
          {/* Brand Column */}
          <div
            itemScope
            itemType="https://schema.org/Organization"
            className="md:pr-8"
          >
            <div className="mb-6">
              <Link href="/" itemProp="url" className="inline-block">
                <Image
                  src="/img/Logo.webp"
                  alt="bymayscarf"
                  width={150}
                  height={50}
                  className="h-auto w-36"
                  itemProp="logo"
                  sizes="150px"
                  quality={85}
                />
              </Link>
            </div>
            <p
              className="text-muted-foreground/90 text-sm leading-relaxed"
              itemProp="description"
            >
              Spesialis Al-Qur&apos;an custom cover dan perlengkapan ibadah
              berkualitas. Mewujudkan keindahan dalam beribadah dengan sentuhan
              personal.
            </p>
          </div>

          {/* Contact Column */}
          <div itemScope itemType="https://schema.org/ContactPoint">
            <h3 className="text-lg font-medium mb-6">Kontak & Sosial Media</h3>
            <div className="space-y-4">
              <a
                href="https://wa.me/6285161790424"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-muted-foreground hover:text-primary transition-colors group"
                itemProp="telephone"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-background border border-border group-hover:border-primary group-hover:text-primary transition-colors">
                  <BsWhatsapp className="w-4 h-4" />
                </span>
                +62 851-6179-0424
              </a>
              <a
                href="https://www.instagram.com/by.mayofficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-muted-foreground hover:text-primary transition-colors group"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-background border border-border group-hover:border-primary group-hover:text-primary transition-colors">
                  <BsInstagram className="w-4 h-4" />
                </span>
                @by.mayofficial
              </a>
              <a
                href="https://www.tiktok.com/@by.mayofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-muted-foreground hover:text-primary transition-colors group"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-background border border-border group-hover:border-primary group-hover:text-primary transition-colors">
                  <BsTiktok className="w-4 h-4" />
                </span>
                @by.mayofficial
              </a>
            </div>
            <h3 className="text-lg font-medium mb-6 mt-8">Marketplace</h3>
            <div className="flex items-center gap-6">
              <a
                href="https://shopee.co.id/by.may"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-75 transition-opacity"
                title="by.may official di Shopee"
              >
                <Image
                  src="/img/marketplace-logo/shopee.webp"
                  alt="Shopee by.may official"
                  width={32}
                  height={32}
                  quality={85}
                />
              </a>
              <a
                href="https://www.tokopedia.com/by-mayscarf/"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-75 transition-opacity"
                title="BY MAYSCARF di Tokopedia"
              >
                <Image
                  src="/img/marketplace-logo/tokopedia.webp"
                  alt="Tokopedia BY MAYSCARF"
                  width={32}
                  height={32}
                  quality={85}
                />
              </a>
              <a
                href="https://www.lazada.co.id/shop/by-may/"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-75 transition-opacity"
                title="by.may di Lazada"
              >
                <Image
                  src="/img/marketplace-logo/lazada.webp"
                  alt="Lazada by.may"
                  width={32}
                  height={32}
                  quality={85}
                />
              </a>
            </div>
          </div>

          {/* Products Column */}
          <div>
            <h3 className="text-lg font-medium mb-6">Produk Kami</h3>
            <nav
              className="space-y-4"
              itemScope
              itemType="https://schema.org/SiteNavigationElement"
            >
              {" "}
              <Link
                href="/produk?category=may-quran"
                className="block text-muted-foreground hover:text-primary transition-colors"
                itemProp="url"
              >
                <span itemProp="name">Al-Qur&apos;an Custom</span>
              </Link>
              <Link
                href="/produk?category=may-prayer"
                className="block text-muted-foreground hover:text-primary transition-colors"
                itemProp="url"
              >
                <span itemProp="name">Sajadah Ukir Nama</span>
              </Link>
              <Link
                href="/produk?category=may-gift"
                className="block text-muted-foreground hover:text-primary transition-colors"
                itemProp="url"
              >
                <span itemProp="name">Hampers</span>
              </Link>
              <Link
                href="/produk"
                className="block text-muted-foreground hover:text-primary transition-colors"
                itemProp="url"
              >
                <span itemProp="name">Semua Produk</span>
              </Link>
            </nav>
          </div>

          {/* Information Column */}
          <div>
            <h3 className="text-lg font-medium mb-6">Informasi</h3>
            <nav
              className="space-y-4"
              itemScope
              itemType="https://schema.org/SiteNavigationElement"
            >
              <Link
                href="/tentang-kami"
                className="block text-muted-foreground hover:text-primary transition-colors"
                itemProp="url"
              >
                <span itemProp="name">Tentang Kami</span>
              </Link>
              <Link
                href="/faq"
                className="block text-muted-foreground hover:text-primary transition-colors"
                itemProp="url"
              >
                <span itemProp="name">FAQ</span>
              </Link>
              <Link
                href="/artikel"
                className="block text-muted-foreground hover:text-primary transition-colors"
                itemProp="url"
              >
                <span itemProp="name">Artikel</span>
              </Link>
              <Link
                href="/keranjang"
                className="block text-muted-foreground hover:text-primary transition-colors"
                itemProp="url"
              >
                <span itemProp="name">Keranjang</span>
              </Link>
              <Link
                href="/pesanan"
                className="block text-muted-foreground hover:text-primary transition-colors"
                itemProp="url"
              >
                <span itemProp="name">Pesanan Saya</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} bymayscarf. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
