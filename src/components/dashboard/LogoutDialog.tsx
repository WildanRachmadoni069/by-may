"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/useAuthStore";

// Store untuk mengontrol dialog logout secara global
import { create } from "zustand";

interface LogoutDialogStore {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export const useLogoutDialog = create<LogoutDialogStore>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
}));

export function LogoutDialog() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isOpen, setOpen } = useLogoutDialog();
  const { toast } = useToast();
  const logOut = useAuthStore((state) => state.logOut);

  // Handle safely close the dialog
  const handleOpenChange = (open: boolean) => {
    // If we're in the process of logging out, don't allow closing the dialog
    if (isLoggingOut && !open) return;

    // Otherwise set the open state
    setOpen(open);

    // If we're closing the dialog, make sure isLoggingOut is reset
    if (!open) {
      setIsLoggingOut(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await logOut();

      toast({
        title: "Logout berhasil",
        description: "Anda telah keluar dari akun",
      });

      // First set our state
      setIsLoggingOut(false);
      handleOpenChange(false);

      // Then do the navigation after a small delay
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        variant: "destructive",
        title: "Gagal logout",
        description: "Terjadi kesalahan saat logout. Silakan coba lagi.",
      });
      setIsLoggingOut(false);
    }
  };

  const handleCancel = () => {
    setIsLoggingOut(false);
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking outside during logout
          if (isLoggingOut) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing with Escape key during logout
          if (isLoggingOut) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Konfirmasi Logout</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin keluar dari akun?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoggingOut}
            type="button"
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
            type="button"
          >
            {isLoggingOut ? (
              <span className="flex items-center gap-1">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging out...
              </span>
            ) : (
              "Ya, Logout"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
