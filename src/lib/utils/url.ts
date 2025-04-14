/**
 * Get the full URL to the application, using the NEXT_PUBLIC_APP_URL environment variable
 * or falling back to localhost in development.
 */
export function getAppUrl(path = ""): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://by-may-scarf.com");

  // Make sure path starts with a slash if it's not empty
  const normalizedPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";

  return `${baseUrl}${normalizedPath}`;
}
