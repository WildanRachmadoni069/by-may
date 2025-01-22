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
import { Pencil, Trash } from "lucide-react";
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

interface Category {
  id: string;
  name: string;
}

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "categories"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const categoriesData: Category[] = [];
      querySnapshot.forEach((doc) => {
        categoriesData.push({ id: doc.id, ...doc.data() } as Category);
      });
      setCategories(categoriesData);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

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
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteDoc(doc(db, "categories", deleteId));
      toast({
        title: "Kategori berhasil dihapus",
        description: "Kategori telah dihapus dari database.",
      });
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Gagal menghapus kategori",
        description:
          "Terjadi kesalahan saat menghapus kategori. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Kategori</CardTitle>
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
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  {editingId === category.id ? (
                    <div className="flex flex-col md:flex-row gap-2 items-center space-x-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSaveEdit()
                        }
                        className="grow"
                      />
                      <div className="w-full flex gap-2">
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={handleSaveEdit}
                        >
                          Simpan
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
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
                        >
                          Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                          Hapus
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
