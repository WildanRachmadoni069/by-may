"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              Oops! Terjadi Kesalahan
            </h1>
            <p className="text-gray-600 mb-6">
              Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah
              diberitahu dan sedang memperbaiki masalah ini.
            </p>
            <div className="space-y-3">
              <Button onClick={reset} className="w-full">
                Coba Lagi
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Kembali ke Beranda</Link>
              </Button>
            </div>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-4 p-4 bg-gray-100 rounded text-left text-sm">
                <summary className="cursor-pointer font-semibold">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
                {error.digest && (
                  <p className="mt-2">
                    <strong>Digest:</strong> {error.digest}
                  </p>
                )}
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
