"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import useAuthStore from "@/store/useAuthStore";

export default function CartButton() {
  const [isMounted, setIsMounted] = useState(false);
  const {
    summary,
    isInitialized: isCartInitialized,
    fetchCart,
  } = useCartStore();
  const { currentUser, initialized: isAuthInitialized } = useAuthStore();

  // Handle hydration issue with SSR
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch cart data when user is authenticated and cart store isn't initialized
  useEffect(() => {
    const initCart = async () => {
      if (isMounted && currentUser && !isCartInitialized) {
        await fetchCart();
      }
    };

    if (isAuthInitialized) {
      initCart();
    }
  }, [isMounted, currentUser, isAuthInitialized, isCartInitialized, fetchCart]);

  // Don't render during SSR to avoid hydration mismatch
  if (!isMounted) {
    return (
      <Button variant="outline" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Link href="/keranjang">
      <Button variant="outline" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5" />
        {currentUser && summary.totalItems > 0 && (
          <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-[10px] font-medium bg-primary text-primary-foreground rounded-full">
            {summary.totalItems > 99 ? "99+" : summary.totalItems}
          </span>
        )}
        <span className="sr-only">
          Keranjang ({summary.totalItems || 0} item)
        </span>
      </Button>
    </Link>
  );
}
