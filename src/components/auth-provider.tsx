"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import { LogoutDialog } from "@/components/dashboard/LogoutDialog";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { checkAuth, initialized, loading } = useAuthStore();

  // Check authentication status when component mounts
  useEffect(() => {
    if (!initialized) {
      checkAuth();
    }
  }, [checkAuth, initialized]);

  // Show loading screen while checking auth status on first load
  if (!initialized && loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {children}
      <LogoutDialog />
    </>
  );
}
