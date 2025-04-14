import React from "react";
import { cn } from "@/lib/utils";

interface ArticleContentProps {
  content: string;
  className?: string;
}

export function ArticleContent({ content, className }: ArticleContentProps) {
  return (
    <div
      className={cn("prose prose-slate max-w-none lg:prose-lg", className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
