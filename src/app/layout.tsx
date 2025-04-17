import type { Metadata } from "next";
import localFont from "next/font/local";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/components/auth-provider";
import { LogoutDialog } from "@/components/dashboard/LogoutDialog";

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
  return {
    title: {
      default: "Al-Quran Custom Cover",
      template: "%s | By May Scarf",
    },
    description:
      "Jual Al-Quran custom nama di cover murah berkualitas. Berbagai pilihan desain dan warna. Pengiriman ke seluruh Indonesia.",
  };
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
        <AuthProvider>
          <Toaster />
          <main className="relative flex-grow">{children}</main>
          <LogoutDialog />
        </AuthProvider>
      </body>
    </html>
  );
}
