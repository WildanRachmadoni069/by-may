"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";
import { PageSeoForm } from "@/components/admin/seo/PageSeoForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HomePageSEO() {
  const [seoData, setSeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSeoData() {
      try {
        setLoading(true);
        const docRef = doc(db, "seo_settings", "homepage");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSeoData(docSnap.data());
        } else {
          // Create default SEO data if it doesn't exist
          const defaultData = {
            title: "Al-Quran Custom Nama Murah di Cover Surabaya",
            description:
              "Jual Al-Quran custom nama di cover murah berkualitas. Berbagai pilihan desain dan warna. Pengiriman ke seluruh Indonesia.",
            keywords:
              "al-quran custom, nama di cover, quran custom surabaya, quran murah berkualitas",
            og_image: "",
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await setDoc(doc(db, "seo_settings", "homepage"), defaultData);
          setSeoData(defaultData);
        }
      } catch (err) {
        console.error("Error fetching homepage SEO data:", err);
        setError("Gagal memuat data SEO. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    }

    fetchSeoData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/seo">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">SEO Halaman Beranda</h1>
          <p className="text-sm text-muted-foreground">
            Optimalisasi halaman beranda Anda untuk mesin pencari
          </p>
        </div>
      </div>

      {seoData && (
        <PageSeoForm
          initialValues={{
            title: seoData.title || "",
            description: seoData.description || "",
            keywords: seoData.keywords || "",
            og_image: seoData.og_image || "",
          }}
          pageId="homepage"
          pageSlug=""
          pageType="Beranda"
        />
      )}
    </div>
  );
}
