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
  title = "Konten tidak ditemukan",
  description = "Belum ada konten yang dapat ditampilkan saat ini.",
  icon = <FileText className="h-12 w-12 text-gray-400" />,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">{description}</p>
      {action}
    </div>
  );
}

export function ArticleEmptyState({ isAdmin = false }) {
  return (
    <EmptyState
      title="Belum ada artikel"
      description="Kami sedang menyiapkan artikel-artikel menarik untuk Anda. Silahkan kunjungi halaman ini lagi nanti."
      icon={<PenLine className="h-8 w-8 text-gray-500" />}
      action={
        isAdmin ? (
          <Link href="/dashboard/admin/artikel/create">
            <Button>Buat Artikel Pertama</Button>
          </Link>
        ) : null
      }
    />
  );
}
