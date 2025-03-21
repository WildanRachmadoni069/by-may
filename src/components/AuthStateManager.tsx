"use client";

import useAuthStore from "@/store/useAuthStore";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface AuthStateManagerProps {
  children: React.ReactNode;
}

export function AuthStateManager({ children }: AuthStateManagerProps) {
  const { loading } = useAuthStore();

  // Tampilkan loading screen saat loading
  if (loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
