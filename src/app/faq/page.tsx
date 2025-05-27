/**
 * Halaman FAQ (Frequently Asked Questions)
 * @module FAQPage
 * @description Menampilkan halaman FAQ dengan fitur:
 * - Daftar pertanyaan yang sering diajukan
 * - Accordion untuk mempermudah navigasi
 * - Tombol hubungi admin untuk pertanyaan lebih lanjut
 * - Breadcrumb navigation
 * - Loading states & error handling
 */
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Footer from "@/components/landingpage/Footer";
import { useFAQs } from "@/hooks/useFAQs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Instagram } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function FAQPage() {
  // Gunakan hook SWR untuk FAQ, limit banyak karena FAQ biasanya tidak banyak
  const { faqs, isLoading, error, mutate } = useFAQs({ limit: 50 });

  if (isLoading) {
    return (
      <>
        <main className="container px-4 py-8">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center space-x-2 mb-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-24 w-2/3 mx-auto mb-8" />
          <div className="w-full max-w-3xl mx-auto space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <main className="container px-4 py-8 text-center">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6 text-left">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Beranda</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>FAQ</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-4xl font-bold mb-4">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h1>
          <p className="text-red-500 mt-8 mb-4">{error.message}</p>
          <Button onClick={() => mutate()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Coba Lagi
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="container px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Beranda</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>FAQ</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-4xl font-bold mb-4 text-center">
          Pertanyaan yang Sering Diajukan (FAQ)
        </h1>
        <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          Temukan jawaban atas pertanyaan umum seputar produk Al-Qur'an custom
          cover, perlengkapan ibadah, dan layanan bymayscarf. Kami berkomitmen
          untuk memberikan informasi yang jelas dan membantu Anda mendapatkan
          produk berkualitas dengan harga termurah di Surabaya dan seluruh
          Indonesia.
        </p>
        <Accordion
          type="single"
          collapsible
          className="w-full max-w-3xl mx-auto"
        >
          {faqs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Belum ada pertanyaan yang tersedia saat ini.
            </p>
          ) : (
            faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))
          )}
        </Accordion>
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-6">
            Masih punya pertanyaan?
          </h2>
          <p className="text-gray-600 mb-8">
            Jangan ragu untuk menghubungi kami melalui:
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/6285161790424"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-lg shadow-md hover:shadow-lg transition-all border border-green-200 hover:border-green-300 w-full sm:w-auto justify-center"
            >
              <FaWhatsapp className="w-5 h-5" />
              <span>Chat WhatsApp</span>
            </a>
            <a
              href="https://instagram.com/by.mayofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white text-pink-600 rounded-lg shadow-md hover:shadow-lg transition-all border border-pink-200 hover:border-pink-300 w-full sm:w-auto justify-center"
            >
              <Instagram className="w-5 h-5" />
              <span>Follow Instagram</span>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
