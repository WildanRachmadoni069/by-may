import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";

function HeroLandingpage() {
  return (
    <section className="bg-neutral-lighter py-12 lg:py-16 min-h-[70vh] flex items-center">
      <div className="container mx-auto flex flex-col lg:flex-row items-center lg:justify-between px-4 lg:px-8">
        {/* Left: Text content */}
        <div className="max-w-lg lg:mr-8">
          <p className="text-lg text-primary font-medium uppercase">
            Selamat datang di BYMAYSCARF
          </p>
          <h1 className="mt-2 text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Al-Quran Custom Nama Murah
          </h1>
          <p className="mt-4 text-lg text-foreground">
            Buat momen ibadah lebih bermakna dengan Al-Quran custom nama di
            cover yang elegan dan{" "}
            <span className="font-semibold">terjangkau.</span> Hanya di sini
            Anda bisa mendapatkan Al-Quran berkualitas dengan desain personal!
          </p>
          <Button asChild className="mt-6">
            <Link href="/produk">Lihat Koleksi</Link>
          </Button>
        </div>
        {/* Right: Image - Menggunakan Next.js Image dengan ukuran yang lebih besar */}
        <div className="mt-8 lg:mt-0 relative flex justify-center lg:justify-end w-full lg:w-1/2">
          <div className="w-full max-w-lg h-[300px] md:h-[350px] lg:h-[450px] relative">
            <Image
              src="/img/Landing-Page/header-image.webp"
              alt="Al-Quran Custom Nama di Cover"
              width={1600}
              height={1200}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              priority
              quality={90}
              className="object-contain rounded-lg w-full h-full"
              style={{ filter: "drop-shadow(0 8px 12px rgba(0, 0, 0, 0.15))" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroLandingpage;
