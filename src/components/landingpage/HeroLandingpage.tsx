import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

function HeroLandingpage() {
  return (
    <section className="bg-neutral-lighter py-12">
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

        {/* Right: Image */}
        <div className="mt-8 lg:mt-0">
          <img
            src="/img/Landing-Page/Header Image.png"
            alt="Al-Quran Custom Nama di Cover"
            className="max-w-full h-auto rounded-lg"
            style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
          />
        </div>
      </div>
    </section>
  );
}

export default HeroLandingpage;
