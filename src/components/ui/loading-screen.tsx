"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LoadingScreenProps {
  className?: string;
}

export function LoadingScreen({ className }: LoadingScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-700",
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100",
        className
      )}
    >
      <div className="relative">
        {/* Logo Animation */}
        <div className="w-40 h-40 relative mb-6 animate-float">
          <Image
            src="/img/Logo.jpg"
            alt="By May Scarf Logo"
            fill
            className="object-contain"
            sizes="160px" // Based on parent div size of w-40 (160px)
            priority
            fetchPriority="high"
          />
          {/* Animated rings around logo */}
          <div className="absolute -inset-4 border-2 border-primary/20 rounded-full animate-ping-slow"></div>
          <div className="absolute -inset-8 border border-primary/10 rounded-full animate-ping-slower"></div>
        </div>

        {/* Loading Text */}
        <div className="flex justify-center mt-8">
          <span className="loading-text flex space-x-1 text-lg font-medium text-muted-foreground">
            <span className="animate-bounce-staggered-1">M</span>
            <span className="animate-bounce-staggered-2">e</span>
            <span className="animate-bounce-staggered-3">m</span>
            <span className="animate-bounce-staggered-4">u</span>
            <span className="animate-bounce-staggered-5">a</span>
            <span className="animate-bounce-staggered-6">t</span>
            <span className="animate-bounce-staggered-7">.</span>
            <span className="animate-bounce-staggered-8">.</span>
            <span className="animate-bounce-staggered-9">.</span>
          </span>
        </div>
      </div>
    </div>
  );
}
