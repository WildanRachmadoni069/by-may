"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import { create } from "zustand";

// Create a store for managing dialog state
interface LogoutDialogStore {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

export const useLogoutDialogStore = create<LogoutDialogStore>((set) => ({
  isOpen: false,
  setOpen: (isOpen) => set({ isOpen }),
}));

// Hook for using the dialog
export function useLogoutDialog() {
  return useLogoutDialogStore();
}

export function LogoutDialog() {
  const { isOpen, setOpen } = useLogoutDialogStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const { signOut } = useAuthStore();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      setOpen(false);

      // Force a complete page reload to clear all state and ensure clean logout
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keluar</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin keluar dari akun Anda?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            onClick={handleLogout}
            variant="destructive"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Memproses..." : "Keluar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
