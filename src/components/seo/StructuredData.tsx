"use client";

import { useEffect } from "react";

interface StructuredDataProps {
  data: Record<string, any>;
}

/**
 * Component to insert structured data (JSON-LD) into a page
 * Uses client component with useEffect to properly inject the script
 */
export default function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    // Create the script element
    const script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.textContent = JSON.stringify(data);

    // Add to the document head
    document.head.appendChild(script);

    // Clean up on unmount
    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, [data]);

  // This component does not render anything visible
  return null;
}
