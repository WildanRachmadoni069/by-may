"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getFAQs } from "@/lib/firebase/faqs";
import { FAQ } from "@/types/faq";
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

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFAQs() {
      try {
        setLoading(true);
        const faqsData = await getFAQs();
        setFaqs(faqsData);
      } catch (err) {
        console.error("Error loading FAQs:", err);
        setError("Gagal memuat data FAQ. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    }

    loadFAQs();
  }, []);

  if (loading) {
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
          <p className="text-red-500 mt-8">{error}</p>
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
          cover, perlengkapan ibadah, dan layanan Bymay. Kami berkomitmen untuk
          memberikan informasi yang jelas dan membantu Anda mendapatkan produk
          berkualitas dengan harga terjangkau di Surabaya dan seluruh Indonesia.
        </p>

        <Accordion
          type="single"
          collapsible
          className="w-full max-w-3xl mx-auto"
        >
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Masih punya pertanyaan? Jangan ragu untuk menghubungi kami.
          </p>
          <a
            href="mailto:info@bymay.com"
            className="text-blue-600 hover:underline"
          >
            info@bymay.com
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
