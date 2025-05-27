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
