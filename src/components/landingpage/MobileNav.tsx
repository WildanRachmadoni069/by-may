"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "../dashboard/LogoutButton";
import useAuthStore from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function MobileNav() {
  const [open, setOpen] = useState(false);
  const { currentUser, userData, isAdmin } = useAuthStore();

  // Get initials from user's fullName
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const closeSheet = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] py-6">
        <SheetHeader>
          <SheetTitle className="text-left">Menu Navigasi</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full gap-6 mt-4">
          <div className="flex flex-col gap-2">
            {currentUser ? (
              <div className="flex items-center gap-3 p-2 mb-2">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src="" alt={userData?.fullName || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/90 to-primary/70 text-white font-medium text-sm">
                    {getInitials(userData?.fullName || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {userData?.fullName || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {userData?.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 p-2 mb-2">
                <p className="font-medium">Akun Saya</p>
                <div className="flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={closeSheet}
                  >
                    <Link href="/login">Masuk</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="flex-1"
                    onClick={closeSheet}
                  >
                    <Link href="/sign-up">Daftar</Link>
                  </Button>
                </div>
              </div>
            )}
            <Separator />
          </div>

          <nav className="flex-1">
            <ul className="flex flex-col gap-1">
              <li>
                <Button
                  asChild
                  variant="ghost"
                  className="justify-start w-full"
                  onClick={closeSheet}
                >
                  <Link href="/">Beranda</Link>
                </Button>
              </li>
              <li>
                <Button
                  asChild
                  variant="ghost"
                  className="justify-start w-full"
                  onClick={closeSheet}
                >
                  <Link href="/produk">Produk</Link>
                </Button>
              </li>
              <li>
                <Button
                  asChild
                  variant="ghost"
                  className="justify-start w-full"
                  onClick={closeSheet}
                >
                  <Link href="/artikel">Artikel</Link>
                </Button>
              </li>
              <li>
                <Button
                  asChild
                  variant="ghost"
                  className="justify-start w-full"
                  onClick={closeSheet}
                >
                  <Link href="/tentang-kami">Tentang Kami</Link>
                </Button>
              </li>
              <li>
                <Button
                  asChild
                  variant="ghost"
                  className="justify-start w-full"
                  onClick={closeSheet}
                >
                  <Link href="/faq">FAQ</Link>
                </Button>
              </li>
            </ul>
          </nav>

          {currentUser && (
            <div className="mt-auto">
              <Separator className="mb-4" />
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="account" className="border-none">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <span className="text-sm font-medium">Akun Saya</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-1 pl-4">
                      {isAdmin && (
                        <Button
                          asChild
                          variant="ghost"
                          className="justify-start h-9 px-2 text-amber-600 font-medium"
                          onClick={closeSheet}
                        >
                          <Link href="/dashboard/admin">Admin Dashboard</Link>
                        </Button>
                      )}
                      <Button
                        asChild
                        variant="ghost"
                        className="justify-start h-9 px-2"
                        onClick={closeSheet}
                      >
                        <Link href="/pesanan">Pesanan Saya</Link>
                      </Button>
                      {!isAdmin && (
                        <Button
                          asChild
                          variant="ghost"
                          className="justify-start h-9 px-2"
                          onClick={closeSheet}
                        >
                          <Link href="/profil">Profil Saya</Link>
                        </Button>
                      )}
                      <div className="py-1 px-2">
                        <LogoutButton />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNav;
