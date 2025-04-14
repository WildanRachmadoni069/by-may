"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Search,
  PlusCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Article, deleteArticle } from "@/lib/api/articles";

function ArtikelAdminPage() {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingArticles, setDeletingArticles] = useState<
    Record<string, boolean>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/articles`);

        if (!res.ok) {
          throw new Error("Failed to fetch articles");
        }

        const data = await res.json();
        setArticles(data.data);
      } catch (error) {
        console.error("Error fetching articles:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load articles",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [toast]);

  const toggleSort = () => {
    setSortDirection(sortDirection === "desc" ? "asc" : "desc");
  };

  // Apply sort and search to the articles
  const sortedArticles = [...articles].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortDirection === "desc"
      ? dateB.getTime() - dateA.getTime()
      : dateA.getTime() - dateB.getTime();
  });

  // Filter articles based on search query
  const filteredArticles = sortedArticles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update pagination calculation to use filtered articles
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDelete = async (slug: string) => {
    try {
      // Set the deleting state for this specific article
      setDeletingArticles((prev) => ({ ...prev, [slug]: true }));

      await deleteArticle(slug); // This now handles both database deletion and Cloudinary image deletion

      // Remove the deleted article from state
      setArticles(articles.filter((article) => article.slug !== slug));

      toast({
        title: "Artikel berhasil dihapus",
        description: "Artikel telah dihapus dari database.",
      });
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus artikel. Silakan coba lagi.",
      });
    } finally {
      // Clear the deleting state for this article
      setDeletingArticles((prev) => ({ ...prev, [slug]: false }));
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: "draft" | "published") => {
    if (status === "published") {
      return <Badge className="bg-green-500">Terbit</Badge>;
    }
    return <Badge variant="secondary">Draft</Badge>;
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Manajemen Artikel</h1>
        <p className="text-muted-foreground">
          Kelola artikel blog untuk website Anda
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cari artikel berdasarkan judul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link href="/dashboard/admin/artikel/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Artikel
          </Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Judul</TableHead>
            <TableHead>Status</TableHead>
            <TableHead
              onClick={toggleSort}
              className="cursor-pointer hover:bg-gray-100 select-none"
            >
              <div className="flex items-center gap-2">
                Tanggal Dibuat
                {sortDirection === "desc" ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentArticles.map((article, index) => (
            <TableRow key={article.id}>
              <TableCell>{startIndex + index + 1}</TableCell>
              <TableCell>{article.title}</TableCell>
              <TableCell>{getStatusBadge(article.status)}</TableCell>
              <TableCell>{formatDate(article.createdAt)}</TableCell>
              <TableCell className="flex gap-2">
                <Link href={`/artikel/${article.slug}`} target="_blank">
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/dashboard/admin/artikel/edit/${article.slug}`}>
                  <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      disabled={deletingArticles[article.slug]}
                    >
                      {deletingArticles[article.slug] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Artikel</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus artikel ini? Tindakan
                        ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(article.slug)}
                        disabled={deletingArticles[article.slug]}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deletingArticles[article.slug] ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menghapus...
                          </>
                        ) : (
                          "Hapus"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Show "Tidak ada artikel" message when no results found */}
      {filteredArticles.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          Tidak ada artikel yang ditemukan
        </div>
      )}

      {/* Only show pagination if there are articles */}
      {filteredArticles.length > 0 && (
        <div className="flex items-center justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Halaman {currentPage} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default ArtikelAdminPage;
