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
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function ArtikelAdminPage() {
  interface Article {
    id: string;
    title: string;
    slug: string;
    status: "draft" | "published"; // Add status to interface
    created_at: Timestamp;
    featured_image?: {
      url: string;
    };
  }
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const articlesRef = collection(db, "articles");
        const snapshot = await getDocs(articlesRef);
        const articlesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Article[];

        // Sort articles by created_at
        const sortedArticles = articlesData.sort((a, b) => {
          const dateA = a.created_at?.toDate?.() || new Date(0);
          const dateB = b.created_at?.toDate?.() || new Date(0);
          return sortDirection === "desc"
            ? dateB.getTime() - dateA.getTime()
            : dateA.getTime() - dateB.getTime();
        });

        setArticles(sortedArticles);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [sortDirection]);

  // Filter articles based on search query
  const filteredArticles = articles.filter((article) =>
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

  const toggleSort = () => {
    setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const handleDelete = async (id: string) => {
    try {
      // Get article data to get the image URL
      const articleDoc = doc(db, "articles", id);
      const articleSnapshot = await getDoc(articleDoc);
      const articleData = articleSnapshot.data();

      // If there's a featured image, delete it from Cloudinary
      if (articleData?.featured_image?.url) {
        const response = await fetch("/api/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: articleData.featured_image.url }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete image from Cloudinary");
        }
      }

      // Delete the article from Firebase
      await deleteDoc(articleDoc);
      setArticles(articles.filter((article) => article.id !== id));
    } catch (error) {
      console.error("Error deleting article:", error);
      // You might want to show an error message to the user here
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp || !timestamp.toDate) {
      return "Tanggal tidak tersedia";
    }
    return timestamp.toDate().toLocaleDateString("id-ID", {
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Artikel</h1>
        <Link href="/dashboard/admin/artikel/create">
          <Button>Tambah Artikel</Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Cari artikel berdasarkan judul..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-sm"
        />
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
              <TableCell>{formatDate(article.created_at)}</TableCell>
              <TableCell className="flex gap-2">
                <Link href={`/artikel/${article.slug}`} target="_blank">
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/dashboard/admin/artikel/edit/${article.id}`}>
                  <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
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
                        onClick={() => handleDelete(article.id)}
                      >
                        Hapus
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
