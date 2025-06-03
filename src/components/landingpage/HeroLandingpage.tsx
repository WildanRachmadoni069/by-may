import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";

function HeroLandingpage() {
  // Media query untuk mendeteksi device
  const mobileImageSrc = "/img/Landing-Page/header-image-mobile.webp";
  const desktopImageSrc = "/img/Landing-Page/header-image.webp";

  return (
    <section
      className="bg-neutral-lighter py-12 lg:py-16 min-h-[100vh] flex items-center"
      aria-label="Pengenalan produk"
      itemScope
      itemType="https://schema.org/WebPageElement"
      itemProp="mainContentOfPage"
    >
      <div className="container mx-auto flex flex-col lg:flex-row items-center lg:justify-between px-4 lg:px-8">
        {/* Left: Text content with appropriate semantic markup */}
        <div className="max-w-lg lg:mr-8">
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
        {/* Right: Image with semantic markup and optimization */}
        <div className="mt-8 lg:mt-0 relative flex justify-center lg:justify-end w-full lg:w-1/2">
          <div
            className="w-full max-w-lg aspect-[4/3] relative"
            itemProp="image"
            itemScope
            itemType="https://schema.org/ImageObject"
          >
            {/* Mobile Image */}
            <Image
              src={mobileImageSrc}
              alt="Al-Quran Custom Nama Murah bymayscarf"
              fill
              sizes="(max-width: 1023px) 95vw, 1px"
              priority
              quality={60}
              className="object-contain lg:hidden"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              style={{
                transform: "translate3d(0, 0, 0)",
                willChange: "transform",
              }}
              itemProp="contentUrl"
              loading="eager"
              fetchPriority="high"
            />
            {/* Desktop Image */}
            <Image
              src={desktopImageSrc}
              alt="Al-Quran Custom Nama bymayscarf"
              fill
              sizes="(max-width: 1023px) 1px, (min-width: 1024px) 50vw"
              priority
              quality={75}
              className="object-contain hidden lg:block"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              style={{
                transform: "translate3d(0, 0, 0)",
                willChange: "transform",
              }}
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
