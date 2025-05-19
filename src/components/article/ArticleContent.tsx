import React from "react";
import { cn } from "@/lib/utils";

interface ArticleContentProps {
  content: string;
  className?: string;
}

export function ArticleContent({ content, className }: ArticleContentProps) {
  return (
    <div
      className={cn(
        "prose prose-zinc prose-a:text-primary hover:prose-a:text-primary/80 max-w-none lg:prose-lg",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
