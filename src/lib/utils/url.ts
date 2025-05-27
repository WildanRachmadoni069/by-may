/**
 * Get the base URL for the application
 * In development: http://localhost:3000 (from NEXT_PUBLIC_APP_URL)
 * In production: https://bymayscarf.shop (from NEXT_PUBLIC_SITE_URL)
 */
export function getBaseUrl(): string {
  // If we're on the client side, use the window location
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Server-side logic
  // First try NEXT_PUBLIC_SITE_URL for production
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Then try NEXT_PUBLIC_APP_URL for local development
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
