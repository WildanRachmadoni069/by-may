"use client";

import Script from "next/script";
import { memo } from "react";

interface SimpleStructuredDataProps {
  id?: string;
  data: Record<string, any>;
}

/**
 * Simplified component to insert structured data (JSON-LD) into a page
 * Uses Next.js Script component for better performance and to avoid hydration issues
 */
const SimpleStructuredData = ({
  id = "structured-data",
  data,
}: SimpleStructuredDataProps) => {
  const jsonString = JSON.stringify(data);

  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
      strategy="afterInteractive"
    />
  );
};

// Memoize to prevent unnecessary re-renders
export default memo(SimpleStructuredData);
