"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import { LogoutDialog } from "@/components/dashboard/LogoutDialog";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { usePathname, useRouter } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { checkAuth, initialized, loading, currentUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Define auth routes that should not be accessible when logged in
  const authRoutes = ["/login", "/sign-up"];

  // Check authentication status when component mounts
  useEffect(() => {
    if (!initialized) {
      checkAuth();
    }
  }, [checkAuth, initialized]);

  // Redirect away from login/signup pages if user is already authenticated
  useEffect(() => {
    if (initialized && !loading && currentUser) {
      // If user is logged in and on an auth page, redirect to home
      if (authRoutes.includes(pathname)) {
        console.log("User is already logged in. Redirecting from auth page.");
        router.replace("/");
      }
    }
  }, [initialized, loading, currentUser, pathname, router]);

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
