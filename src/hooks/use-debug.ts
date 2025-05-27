import { useState, useEffect } from "react";

/**
 * Hook to enable debugging features based on URL or localStorage
 *
 * @returns Whether debugging is enabled
 */
export function useDebug() {
  const [isDebugEnabled, setIsDebugEnabled] = useState(false);

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    // Check if debug mode is enabled via URL parameter or localStorage
    const debugParam = new URLSearchParams(window.location.search).get("debug");
    const storedDebug = localStorage.getItem("debug");

    const isEnabled = debugParam === "true" || storedDebug === "true";

    // If URL parameter is set, save to localStorage
    if (debugParam === "true" && !storedDebug) {
      localStorage.setItem("debug", "true");
    }
    // If URL parameter is explicitly set to false, remove from localStorage
    else if (debugParam === "false" && storedDebug) {
      localStorage.removeItem("debug");
    }

    setIsDebugEnabled(isEnabled);

    // Add debug class to body for CSS targeting
    if (isEnabled) {
      document.body.classList.add("debug-mode");
    } else {
      document.body.classList.remove("debug-mode");
    }

    return () => {
      document.body.classList.remove("debug-mode");
    };
  }, []);

  return isDebugEnabled;
}
