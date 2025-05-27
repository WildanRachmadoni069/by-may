"use client";

import React, { useState, useEffect } from "react";
import { useDebug } from "@/hooks/use-debug";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Download, Bug, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DebugPanelProps {
  data: any;
  title?: string;
}

export default function DebugPanel({
  data,
  title = "Debug Info",
}: DebugPanelProps) {
  const isDebugEnabled = useDebug();
  const [isExpanded, setIsExpanded] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    // Create a download URL for the data
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);

    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [data]);

  if (!isDebugEnabled) {
    return null;
  }

  const handleDownload = () => {
    if (!downloadUrl) return;

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `debug-${title.toLowerCase().replace(/\s+/g, "-")}-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card className="mt-4 border-amber-300 bg-amber-50 dark:bg-amber-950 overflow-hidden">
      <div
        className="p-2 bg-amber-200 dark:bg-amber-800 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4" />
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="sr-only">Download JSON</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">
              {isExpanded ? "Collapse" : "Expand"}
            </span>
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "max-h-[500px] overflow-y-auto" : "max-h-0"
        )}
      >
        <pre className="p-3 text-xs overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </Card>
  );
}
