"use client";

import { useCartStore } from "@/store/useCartStore";
import { ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";

export default function CartButton() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const initializeCart = useCartStore((state) => state.initializeCart);

  useEffect(() => {
    // Initialize cart data
    initializeCart();
    // Then set mounted to true
    setMounted(true);
  }, [initializeCart]);

  // Show nothing until component is mounted and cart is initialized
  if (!mounted) return null;

  return (
    <Button variant="outline" size="icon" asChild className="relative">
      <Link href="/keranjang">
        <ShoppingCartIcon className="h-5 w-5" />
        {totalItems > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
          >
            {totalItems}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
