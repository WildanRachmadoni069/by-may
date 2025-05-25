import type { Metadata } from "next";
import localFont from "next/font/local";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/components/auth-provider";
import { LogoutDialog } from "@/components/dashboard/LogoutDialog";
import { getSeoData } from "@/lib/services/seo";
// Preloading untuk font dan aset penting
import { headers } from "next/headers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap", // Use 'swap' to prevent invisible text during font loading
  preload: true, // Preload this font
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap", // Use 'swap' to prevent invisible text during font loading
  preload: false, // Not preloading since this is less critical
});
const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap", // Use 'swap' to prevent invisible text during font loading
  preload: true, // Preload this font
});

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoData("homepage");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: seoData?.title || "Al-Quran Custom Cover Murah | bymayscarf",
      template: "%s | bymayscarf",
    },
    description:
      seoData?.description ||
      "Jual Al-Quran custom nama di cover murah berkualitas. Berbagai pilihan desain dan warna. Pengiriman ke seluruh Indonesia.",
    keywords:
      seoData?.keywords ||
      "al-quran custom, al-quran custom nama, al-quran custom cover, jual al-quran custom, al-quran custom murah",
    authors: [{ name: "bymayscarf" }],
    generator: "Next.js",
    applicationName: "bymayscarf",
    referrer: "origin-when-cross-origin",
    creator: "bymayscarf",
    publisher: "bymayscarf",
    formatDetection: {
      email: true,
      address: true,
      telephone: true,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: baseUrl,
      siteName: "bymayscarf",
      title: seoData?.title || "Al-Quran Custom Cover | bymayscarf",
      description:
        seoData?.description ||
        "Jual Al-Quran custom nama di cover murah berkualitas. Berbagai pilihan desain dan warna. Pengiriman ke seluruh Indonesia.",
      images: seoData?.ogImage
        ? [
            {
              url: seoData.ogImage,
              width: 1200,
              height: 630,
              alt: "By May Scarf - Al-Quran Custom Cover",
            },
          ]
        : [
            {
              url: `${baseUrl}/img/Landing-Page/header-image.webp`,
              width: 1200,
              height: 630,
              alt: "By May Scarf - Al-Quran Custom Cover",
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: seoData?.title || "Al-Quran Custom Cover | By May Scarf",
      description:
        seoData?.description ||
        "Jual Al-Quran custom nama di cover murah berkualitas. Berbagai pilihan desain dan warna. Pengiriman ke seluruh Indonesia.",
      images: seoData?.ogImage
        ? [seoData.ogImage]
        : [`${baseUrl}/img/Landing-Page/header-image.webp`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/img/Landing-Page/header-image.webp"
          as="image"
          type="image/webp"
        />
        <link
          rel="preconnect"
          href="https://res.cloudinary.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body
        className={`${jakartaSans.className} antialiased min-h-screen bg-background flex flex-col`}
      >
        <AuthProvider>
          <Toaster />
          <main className="relative flex-grow">{children}</main>
          <LogoutDialog />
        </AuthProvider>
      </body>
    </html>
  );
}
