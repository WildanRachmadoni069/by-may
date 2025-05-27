export function logError(context: string, error: unknown) {
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
