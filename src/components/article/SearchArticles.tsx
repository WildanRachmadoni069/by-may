"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchArticlesProps {
  currentSearch?: string;
}

export function SearchArticles({ currentSearch = "" }: SearchArticlesProps) {
  const [searchQuery, setSearchQuery] = useState(currentSearch);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery) {
      router.push(`/artikel?search=${encodeURIComponent(trimmedQuery)}`);
    } else {
      router.push("/artikel");
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    router.push("/artikel");
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center max-w-lg mx-auto"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Cari artikel..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="submit" className="ml-2">
        Cari
      </Button>
    </form>
  );
}
