// Note: If this file doesn't exist exactly as named, adapt the code to your navigation component
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Previously you might have had authentication state here
  // const { user, isAdmin } = useAuthStore();
  // For now, we'll just allow admin access without checks
  const isAdmin = true; // Force admin access

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="font-bold text-xl">
            By May Scarf
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/quran"
              className="text-foreground/60 hover:text-foreground"
            >
              Al-Quran
            </Link>
            <Link
              href="/products"
              className="text-foreground/60 hover:text-foreground"
            >
              Products
            </Link>
            <Link
              href="/artikel"
              className="text-foreground/60 hover:text-foreground"
            >
              Artikel
            </Link>
            <Link
              href="/about"
              className="text-foreground/60 hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/faq"
              className="text-foreground/60 hover:text-foreground"
            >
              FAQ
            </Link>

            {/* Always show admin dashboard link */}
            <Link href="/dashboard/admin">
              <Button variant="outline">Admin Dashboard</Button>
            </Link>
          </nav>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-6">
                <Link
                  href="/quran"
                  className="text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Al-Quran
                </Link>
                <Link
                  href="/products"
                  className="text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Products
                </Link>
                <Link
                  href="/artikel"
                  className="text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Artikel
                </Link>
                <Link
                  href="/about"
                  className="text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/faq"
                  className="text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  FAQ
                </Link>

                {/* Always show admin dashboard link in mobile menu too */}
                <Link href="/dashboard/admin" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Admin Dashboard</Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
