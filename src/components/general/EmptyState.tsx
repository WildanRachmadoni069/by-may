import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, PenLine } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title = "No content found",
  description = "There's nothing to display here yet.",
  icon = <FileText className="h-12 w-12 text-gray-400" />,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}

export function ArticleEmptyState({ isAdmin = false }) {
  return (
    <EmptyState
      title="No articles found"
      description="There are no articles published yet."
      icon={<PenLine className="h-12 w-12 text-gray-400" />}
      action={
        isAdmin ? (
          <Link href="/dashboard/admin/artikel/create">
            <Button>Create your first article</Button>
          </Link>
        ) : null
      }
    />
  );
}
