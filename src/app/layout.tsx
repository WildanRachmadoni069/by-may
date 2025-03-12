import type { Metadata } from "next";
import localFont from "next/font/local";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/landingpage/Footer";
import { getSeoData } from "@/lib/firebase/seo";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const jakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seoData = await getSeoData("homepage");

    return {
      title: {
        default: seoData?.title || "Al-Quran Custom Cover",
        template: "%s | By May Scarf",
      },
      description:
        seoData?.description ||
        "Jual Al-Quran custom nama di cover murah berkualitas. Berbagai pilihan desain dan warna. Pengiriman ke seluruh Indonesia.",
      keywords: seoData?.keywords,
      openGraph: {
        title: seoData?.title || "Al-Quran Custom Cover",
        description: seoData?.description,
        images: seoData?.og_image ? [{ url: seoData.og_image }] : undefined,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: {
        default: "Al-Quran Custom Cover",
        template: "%s | By May Scarf",
      },
      description:
        "Jual Al-Quran custom nama di cover murah berkualitas. Berbagai pilihan desain dan warna. Pengiriman ke seluruh Indonesia.",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${jakartaSans.className} antialiased min-h-screen bg-background flex flex-col`}
      >
        <Toaster />
        <main className="relative flex-grow">{children}</main>
      </body>
    </html>
  );
}
