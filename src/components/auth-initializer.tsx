"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";

/**
 * Komponen untuk initialize auth state di root level
 */
export function AuthInitializer() {
  const { checkAuth, initialized } = useAuthStore();
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/sign-up";

  useEffect(() => {
    if (!initialized && !isAuthPage) {
      checkAuth();
    }
  }, [checkAuth, initialized, isAuthPage]);

  return null;
}
