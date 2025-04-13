"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase/firebaseConfig";
import {
  collection,
  query,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: string;
  name: string;
}

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // For tracking specific actions

  useEffect(() => {
    const q = query(collection(db, "categories"));
    setLoading(true);
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const categoriesData: Category[] = [];
        querySnapshot.forEach((doc) => {
          categoriesData.push({ id: doc.id, ...doc.data() } as Category);
        });
        setCategories(categoriesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error loading categories",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    setActionLoading(editingId);
    try {
      await updateDoc(doc(db, "categories", editingId), { name: editName });
      toast({
        title: "Kategori berhasil diperbarui",
        description: "Perubahan pada kategori telah disimpan.",
      });
      setEditingId(null);
      setEditName("");
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Gagal memperbarui kategori",
        description:
          "Terjadi kesalahan saat memperbarui kategori. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setActionLoading(deleteId);
    try {
      await deleteDoc(doc(db, "categories", deleteId));
      toast({
        title: "Kategori berhasil dihapus",
        description: "Kategori telah dihapus dari database.",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Gagal menghapus kategori",
        description:
          "Terjadi kesalahan saat menghapus kategori. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
      setActionLoading(null);
    }
  };

  // Render category table skeletons
  const renderSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell>
            <Skeleton className="h-6 w-3/4" />
          </TableCell>
          <TableCell className="flex flex-col md:flex-row items-end md:justify-end gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </TableCell>
        </TableRow>
      ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Daftar Kategori</span>
          {loading && (
            <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kategori</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              renderSkeletons()
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center py-8 text-muted-foreground"
                >
                  Belum ada kategori yang tersedia
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow
                  key={category.id}
                  className={actionLoading === category.id ? "opacity-60" : ""}
                >
                  <TableCell>
                    {editingId === category.id ? (
                      <div className="flex flex-col md:flex-row gap-2 items-center space-x-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSaveEdit()
                          }
                          className="flex-grow"
                          disabled={actionLoading === category.id}
                        />
                        <div className="w-full flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={actionLoading === category.id}
                          >
                            {actionLoading === category.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Simpan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={actionLoading === category.id}
                          >
                            Batal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      category.name
                    )}
                  </TableCell>
                  <TableCell className="flex flex-col md:flex-row items-end md:justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(category)}
                      disabled={
                        Boolean(editingId) || actionLoading === category.id
                      }
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeleteId(category.id)}
                          disabled={
                            Boolean(editingId) || actionLoading === category.id
                          }
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Konfirmasi Hapus</DialogTitle>
                          <DialogDescription>
                            Apakah Anda yakin ingin menghapus kategori ini?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                            disabled={actionLoading === deleteId}
                          >
                            Batal
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={actionLoading === deleteId}
                          >
                            {actionLoading === deleteId ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Hapus
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
