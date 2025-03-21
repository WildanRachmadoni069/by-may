"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const logOut = useAuthStore((state) => state.logOut);

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari akun?")) {
      try {
        setIsLoggingOut(true);
        await logOut();

        toast({
          title: "Logout berhasil",
          description: "Anda telah keluar dari akun",
        });

        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 300);
      } catch (error) {
        console.error("Error logging out:", error);
        toast({
          variant: "destructive",
          title: "Gagal logout",
          description: "Terjadi kesalahan saat logout. Silakan coba lagi.",
        });
        setIsLoggingOut(false);
      }
    }
  };

  return (
    <div
      onClick={handleLogout}
      className="flex w-full items-center cursor-pointer"
      role="button"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
    </div>
  );
}
