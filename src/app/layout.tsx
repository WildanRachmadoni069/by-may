import type { Metadata } from "next";
import localFont from "next/font/local";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
// Remove auth-related imports
// import { AuthStateManager } from "@/components/AuthStateManager";
// import { LogoutDialog } from "@/components/dashboard/LogoutDialog";

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
  // Simplify metadata - remove Firebase dependency
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
        <Toaster />
        {/* Add a simple admin access banner */}
        <div className="bg-blue-500 text-white text-center py-1 text-sm">
          <span>Development Mode: Authentication bypassed</span>
        </div>
        <main className="relative flex-grow">{children}</main>
      </body>
    </html>
  );
}
