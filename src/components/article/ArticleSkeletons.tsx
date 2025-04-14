import { Skeleton } from "@/components/ui/skeleton";

interface ArticleSkeletonsProps {
  count?: number;
}

export function ArticleSkeletons({ count = 3 }: ArticleSkeletonsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {Array(count)
        .fill(null)
        .map((_, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div className="relative w-full aspect-[16/9]">
              <Skeleton className="w-full h-full absolute inset-0" />
            </div>
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex items-center pt-2">
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
