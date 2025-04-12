import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  onReset: () => void;
  loading?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  onReset,
  loading = false,
}: SearchBarProps) {
  return (
    <div className="relative flex w-full max-w-md items-center">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari produk..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-10"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch(value);
            }
          }}
        />
        {value && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={onReset}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="ml-2"
        onClick={() => onSearch(value)}
        disabled={loading}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        ) : (
          "Cari"
        )}
      </Button>
    </div>
  );
}
