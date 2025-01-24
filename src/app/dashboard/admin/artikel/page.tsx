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
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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

function ArtikelAdminPage() {
  // Temporary dummy data - replace with actual API call
  const [articles] = useState([
    {
      id: 1,
      title: "Article 1",
      category: "Fashion",
      publishDate: "2024-01-20",
    },
    {
      id: 2,
      title: "Article 2",
      category: "Lifestyle",
      publishDate: "2024-01-21",
    },
  ]);

  const handleDelete = (id: number) => {
    // Implement delete functionality here
    console.log("Deleting article:", id);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Artikel</h1>
        <Link href="/dashboard/admin/artikel/create">
          <Button>Tambah Artikel</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Judul</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Tanggal Publikasi</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article, index) => (
            <TableRow key={article.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{article.title}</TableCell>
              <TableCell>{article.category}</TableCell>
              <TableCell>{article.publishDate}</TableCell>
              <TableCell className="flex gap-2">
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
    </div>
  );
}

export default ArtikelAdminPage;
