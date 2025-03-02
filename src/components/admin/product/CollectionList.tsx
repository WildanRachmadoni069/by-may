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
import { collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
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
import { useCollectionStore } from "@/store/useCollectionStore";

export default function CollectionList() {
  const { collections, loading, error, fetchCollections } =
    useCollectionStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleEdit = (collection: { id: string; name: string }) => {
    setEditingId(collection.id);
    setEditName(collection.name);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      await updateDoc(doc(db, "collections", editingId), { name: editName });
      toast({
        title: "Koleksi berhasil diperbarui",
        description: "Perubahan pada koleksi telah disimpan.",
      });
      setEditingId(null);
      setEditName("");
    } catch (error) {
      console.error("Error updating collection:", error);
      toast({
        title: "Gagal memperbarui koleksi",
        description: "Terjadi kesalahan saat memperbarui koleksi.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteDoc(doc(db, "collections", deleteId));
      toast({
        title: "Koleksi berhasil dihapus",
        description: "Koleksi telah dihapus dari database.",
      });
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast({
        title: "Gagal menghapus koleksi",
        description: "Terjadi kesalahan saat menghapus koleksi.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Koleksi</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Koleksi</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.map((collection) => (
              <TableRow key={collection.id}>
                <TableCell>
                  {editingId === collection.id ? (
                    <div className="flex flex-col md:flex-row gap-2 items-center space-x-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSaveEdit()
                        }
                        className="flex-grow"
                      />
                      <div className="w-full flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          Simpan
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    collection.name
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(collection)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteId(collection.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                        <DialogDescription>
                          Apakah Anda yakin ingin menghapus koleksi ini?
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
