"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import { LogoutDialog } from "@/components/dashboard/LogoutDialog";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { usePathname, useRouter } from "next/navigation";

/**
 * Komponen Penyedia Autentikasi
 *
 * Membungkus aplikasi untuk menyediakan konteks dan fungsionalitas autentikasi:
 * - Memeriksa status autentikasi pada saat pemuatan awal
 * - Mengarahkan pengguna terotentikasi dari halaman login/daftar
 * - Menampilkan layar loading selama pemeriksaan autentikasi
 *
 * @param {object} props - Props komponen
 * @param {React.ReactNode} props.children - Komponen anak untuk dirender
 * @returns {JSX.Element} Aplikasi yang dibungkus dengan konteks auth
 */
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
        // Use replace to avoid creating history entry
        router.replace("/");
      }
    }
  }, [initialized, loading, currentUser, pathname, router, authRoutes]);

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
