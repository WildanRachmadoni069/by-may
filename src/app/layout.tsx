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

  return {
    title: {
      default: seoData?.title || "Al-Quran Custom Cover",
      template: "%s | By May Scarf",
    },
    description:
      seoData?.description ||
      "Jual Al-Quran custom nama di cover murah berkualitas. Berbagai pilihan desain dan warna. Pengiriman ke seluruh Indonesia.",
    keywords: seoData?.keywords || undefined,
    openGraph: {
      title: seoData?.title || "Al-Quran Custom Cover",
      description: seoData?.description,
      images: seoData?.ogImage ? [{ url: seoData.ogImage }] : undefined,
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
        {" "}
        {/* Preload penting assets */}
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
        {/* DNS Prefetch untuk resource eksternal */}
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
