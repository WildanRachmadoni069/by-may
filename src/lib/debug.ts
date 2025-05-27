export function logError(context: string, error: unknown) {
  // Only log errors in development mode
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}] Error:`, error);

    // Include more detailed information for specific errors
    if (error instanceof Error) {
      console.error(`Stack trace: ${error.stack}`);
    }

    // Log environment details that might be useful
    console.log("Environment:", {
      nodeEnv: process.env.NODE_ENV,
      isServer: typeof window === "undefined",
    });
  }
}

// Helper for production errors that should always be logged
export function logCriticalError(context: string, error: unknown) {
  console.error(
    `[${context}] Critical Error:`,
    error instanceof Error ? error.message : error
  );
}

// Helper for development-only debugging
export function debugLog(context: string, ...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[${context}]:`, ...args);
  }
}

/**
 * Mengekstrak pesan error dari berbagai format response error
 * @param error Error yang akan diproses
 * @returns String pesan error yang sudah diformat
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") {
    try {
      const errorObj = JSON.parse(error);
      return errorObj.message || "Terjadi kesalahan yang tidak diketahui";
    } catch {
      return error;
    }
  }
  return "Terjadi kesalahan yang tidak diketahui";
}
