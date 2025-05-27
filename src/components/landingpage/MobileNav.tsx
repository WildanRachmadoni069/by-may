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
import useAuthStore from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { useLogoutDialog } from "@/components/dashboard/LogoutDialog";
import { ScrollArea } from "@/components/ui/scroll-area";

function MobileNav() {
  const [open, setOpen] = useState(false);
  const { currentUser, isAdmin } = useAuthStore();
  const { setOpen: setLogoutDialogOpen } = useLogoutDialog();

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
      <SheetContent
        side="right"
        className="w-full max-w-[300px] sm:max-w-[380px] p-0"
      >
        <div className="flex flex-col h-screen">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="text-left">Menu Navigasi</SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="px-6 py-4 flex flex-col space-y-6">
              {/* User Profile/Login Section */}
              {currentUser ? (
                <div className="flex flex-col">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="account" className="border-none">
                      <AccordionTrigger className="w-full p-2 rounded-md bg-slate-100 hover:bg-slate-200 hover:no-underline transition-colors">
                        {/* Gunakan info profil sebagai trigger accordion */}
                        <div className="flex items-center gap-3 w-full">
                          {" "}
                          <Avatar className="h-10 w-10 border-2 border-primary/20">
                            <AvatarImage
                              src=""
                              alt={currentUser?.fullName || "User"}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-primary/90 to-primary/70 text-white font-medium text-sm">
                              {getInitials(currentUser?.fullName || "User")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="font-medium text-sm truncate">
                              {currentUser?.fullName || "User"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {currentUser?.email}
                            </p>
                          </div>
                          {/* Chevron sudah ditangani oleh AccordionTrigger */}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-1 pl-1 mt-1">
                          {isAdmin && (
                            <Button
                              asChild
                              variant="ghost"
                              className="justify-start h-9 px-2 text-amber-600 font-medium"
                              onClick={closeSheet}
                            >
                              <Link href="/dashboard/admin">
                                Admin Dashboard
                              </Link>
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
                          <Button
                            variant="ghost"
                            className="justify-start h-9 px-2 text-destructive"
                            onClick={() => {
                              closeSheet();
                              setTimeout(() => setLogoutDialogOpen(true), 100);
                            }}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-2">
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

              {/* Navigation Links */}
              <nav>
                <ul>
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
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNav;
