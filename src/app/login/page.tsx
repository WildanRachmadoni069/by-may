"use client";

import { LoginForm } from "@/components/login-form";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { currentUser, initialized } = useAuthStore();
  const router = useRouter();

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (initialized && currentUser) {
      router.replace("/");
    }
  }, [initialized, currentUser, router]);

  // If the auth state is still initializing, or if the user is logged in and about to be redirected,
  // return null to avoid a flash of the login form
  if (!initialized || currentUser) {
    return null; // Or a loading spinner if preferred
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  );
}
