import type { Metadata } from "next";
import localFont from "next/font/local";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/landingpage/Footer";

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

export const metadata: Metadata = {
  title: {
    default: "By May - Al-Qur'an Custom Cover & Perlengkapan Ibadah",
    template: "%s | By May",
  },
  description:
    "Temukan koleksi Al-Qur'an Custom Cover, Sajadah Custom, Tasbih, dan Hampers Islami berkualitas. Hadirkan keindahan dalam beribadah dengan sentuhan personal.",
  keywords: [
    "al quran custom",
    "custom cover quran",
    "sajadah custom",
    "tasbih",
    "hampers islami",
    "hadiah islami",
    "perlengkapan ibadah",
    "hampers ramadhan",
    "gift set muslim",
    "kado islami",
  ],
  authors: [{ name: "By May" }],
  creator: "By May",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://bymay.com",
    siteName: "By May - Al-Qur'an Custom Cover",
    title: "By May - Spesialis Al-Qur'an Custom Cover & Islamic Gifts",
    description:
      "Hadirkan keindahan dalam beribadah dengan Al-Qur'an custom cover dan perlengkapan ibadah berkualitas dari By May",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "By May - Al-Qur'an Custom Cover & Perlengkapan Ibadah",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification", // Add your Google verification code
  },
  alternates: {
    canonical: "https://bymay.com",
  },
};

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
