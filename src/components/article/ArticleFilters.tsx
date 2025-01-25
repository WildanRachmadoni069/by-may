import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ArticleFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function ArticleFilters({
  searchQuery,
  onSearchChange,
}: ArticleFiltersProps) {
  return (
    <div className="mb-8">
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Cari artikel..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
