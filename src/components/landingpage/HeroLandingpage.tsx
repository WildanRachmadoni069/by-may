import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";

/**
 * Komponen hero section untuk landing page
 * @description Menampilkan banner utama dengan teks promosi dan gambar produk
 * yang dioptimasi untuk LCP dan responsif untuk mobile/desktop
 */
function HeroLandingpage() {
  const mobileImageSrc = "/img/Landing-Page/header-image-mobile.webp";
  const desktopImageSrc = "/img/Landing-Page/header-image.webp";
  const neutralBlurDataURL =
    "data:image/webp;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/58hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

  return (
    <section
      className="bg-neutral-lighter py-12 lg:py-16 min-h-[100vh] flex items-center"
      aria-label="Pengenalan produk"
      itemScope
      itemType="https://schema.org/WebPageElement"
      itemProp="mainContentOfPage"
    >
      <div className="container mx-auto flex flex-col lg:flex-row items-center lg:justify-between px-4 lg:px-8 gap-8 lg:gap-12">
        <div className="max-w-lg lg:flex-1">
          <p className="text-lg text-primary font-medium uppercase">
            Selamat datang di BYMAYSCARF
          </p>
          <h1
            className="mt-2 text-4xl lg:text-5xl font-bold text-foreground leading-tight"
            itemProp="headline"
          >
            Al-Quran Custom Nama Murah
          </h1>
          <p className="mt-4 text-lg text-foreground" itemProp="description">
            Buat momen ibadah lebih bermakna dengan Al-Quran custom nama di
            cover yang elegan dan{" "}
            <span className="font-semibold">terjangkau.</span> Hanya di sini
            Anda bisa mendapatkan Al-Quran berkualitas dengan desain personal!
          </p>
          <Button
            asChild
            className="mt-6"
            aria-label="Lihat koleksi produk Al-Quran"
          >
            <Link href="/produk">Lihat Koleksi</Link>
          </Button>
        </div>

        <div className="relative flex justify-center lg:justify-end w-full lg:w-1/2 lg:flex-1">
          <div
            className="w-full max-w-sm sm:max-w-md lg:max-w-lg aspect-[4/3] relative rounded-lg overflow-hidden shadow-sm"
            itemProp="image"
            itemScope
            itemType="https://schema.org/ImageObject"
          >
            <Image
              src={mobileImageSrc}
              alt="Al-Quran Custom Nama Murah bymayscarf"
              fill
              sizes="(max-width: 384px) 100vw, (max-width: 640px) 384px, (max-width: 1024px) 448px, 1px"
              priority
              quality={85}
              className="object-contain lg:hidden"
              placeholder="blur"
              blurDataURL={neutralBlurDataURL}
              style={{ transform: "translate3d(0, 0, 0)" }}
              itemProp="contentUrl"
              loading="eager"
              fetchPriority="high"
            />
            <Image
              src={desktopImageSrc}
              alt="Al-Quran Custom Nama bymayscarf"
              fill
              sizes="(max-width: 1023px) 1px, (min-width: 1024px) 50vw"
              priority
              quality={85}
              className="object-contain hidden lg:block"
              placeholder="blur"
              blurDataURL={neutralBlurDataURL}
              style={{ transform: "translate3d(0, 0, 0)" }}
              itemProp="contentUrl"
              loading="eager"
              fetchPriority="high"
            />
            <meta itemProp="width" content="800" />
            <meta itemProp="height" content="600" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroLandingpage;
