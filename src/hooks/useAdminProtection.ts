"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";

export function useAdminProtection() {
  const { currentUser, loading: authLoading, isAdmin } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/");
      } else {
        setLoading(false);
      }
    }
  }, [currentUser, authLoading, isAdmin, router]);

  return { isAdmin, loading };
}
