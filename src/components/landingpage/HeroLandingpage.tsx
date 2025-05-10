import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";

function HeroLandingpage() {
  return (
    <section
      className="bg-neutral-lighter py-12 lg:py-16 min-h-[70vh] flex items-center"
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
            className="w-full max-w-lg h-[300px] md:h-[350px] lg:h-[450px] relative"
            itemProp="image"
            itemScope
            itemType="https://schema.org/ImageObject"
          >
            <Image
              src="/img/Landing-Page/header-image.webp"
              alt="Al-Quran Custom Nama di Cover Premium"
              width={1600}
              height={1200}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              priority
              quality={90}
              className="object-contain rounded-lg w-full h-full"
              style={{ filter: "drop-shadow(0 8px 12px rgba(0, 0, 0, 0.15))" }}
              itemProp="contentUrl"
              loading="eager"
              fetchPriority="high"
            />
            <meta itemProp="width" content="1600" />
            <meta itemProp="height" content="1200" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroLandingpage;
