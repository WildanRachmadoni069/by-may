import type { Metadata } from "next";
import localFont from "next/font/local";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/components/auth-provider";
import { LogoutDialog } from "@/components/dashboard/LogoutDialog";
import { getSeoData } from "@/lib/services/seo";
import { GoogleAnalytics } from "@next/third-parties/google";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bymayscarf.shop";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    template: "%s | bymayscarf",
    default: "Al-Quran Custom Nama Murah di Surabaya",
  },
  description:
    "Jual Al-Quran custom nama di cover murah berkualitas. Berbagai pilihan desain dan warna. Pengiriman ke seluruh Indonesia.",
  applicationName: "bymayscarf",
  authors: [{ name: "bymayscarf" }],
  generator: "Next.js",
  keywords:
    "al-quran custom, al-quran custom nama, al-quran custom cover, jual al-quran custom, al-quran custom murah",
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
    title: "Al-Quran Custom Cover | bymayscarf",
    description:
      "Jual Al-Quran custom nama di cover murah berkualitas. Berbagai pilihan desain dan warna. Pengiriman ke seluruh Indonesia.",
    images: [
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
    title: "Al-Quran Custom Cover | bymayscarf",
    description:
      "Jual Al-Quran custom nama di cover murah berkualitas. Berbagai pilihan desain dan warna. Pengiriman ke seluruh Indonesia.",
    images: [`${baseUrl}/img/Landing-Page/header-image.webp`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
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
        <GoogleAnalytics gaId="G-18X5KKR39Q" />
      </body>
    </html>
  );
}
