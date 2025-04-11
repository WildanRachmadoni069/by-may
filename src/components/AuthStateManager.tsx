"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface AuthStateManagerProps {
  children: React.ReactNode;
}

export function AuthStateManager({ children }: AuthStateManagerProps) {
  // Pastikan hook useAuthStore hanya dipanggil dalam client component
  const { loading } = useAuthStore();

  // Tampilkan loading screen saat loading
  if (loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
