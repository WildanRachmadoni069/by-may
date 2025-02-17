"use client";
import React from "react";
import ProductCard from "@/components/general/ProductCard";
import { productList } from "@/lib/data/product";
import { ChevronRight } from "lucide-react";
import ProductSidebar from "@/components/productpage/ProductSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function ProductPage() {
  return (
    <>
      <section className="container px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header>
          <h1 className="text-xl font-bold text-foreground sm:text-3xl">
            Produk Kami
          </h1>
          <p className="mt-4 text-gray-500">
            Temukan koleksi lengkap produk Bymay, dari Al-Qur'an custom cover
            hingga perlengkapan ibadah berkualitas. Semua produk kami dirancang
            untuk memenuhi kebutuhan spiritual Anda dengan harga terjangkau di
            Surabaya.
          </p>
        </header>

        <div className="mt-8 block lg:hidden">
          <Sheet>
            <SheetTrigger className="flex cursor-pointer items-center gap-2 border-b border-gray-400 pb-1 text-gray-900 transition hover:border-gray-600">
              <span className="text-sm font-medium"> Filter & Urutkan</span>
              <ChevronRight />
            </SheetTrigger>
            <SheetContent className="lg:hidden p-4 w-full" side="right">
              <ProductSidebar />
            </SheetContent>
          </Sheet>
        </div>

        <div className="mt-4 lg:mt-8 lg:grid lg:grid-cols-4 lg:items-start lg:gap-8">
          <div className="hidden space-y-4 lg:block bg-white p-4 rounded-lg shadow sticky top-[64px]">
            <ProductSidebar />
          </div>

          <div className="lg:col-span-3">
            <h2 className="sr-only">Koleksi Produk</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 justify-center">
              {productList.map((item, index) => {
                // @ts-ignore
                return <ProductCard product={item} key={index} />;
              })}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

export default ProductPage;
