/**
 * Get the base URL for the application
 * In development: http://localhost:3000
 * In production: https://bymayscarf.shop (or whatever the domain is)
 */
export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side
    return window.location.origin;
  }

  // Server-side
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Fallback for local development
  return "http://localhost:3000";
}

/**
 * Get the full app URL including the base URL and path
 */
export function getAppUrl(path: string = ""): string {
  const baseUrl = getBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
