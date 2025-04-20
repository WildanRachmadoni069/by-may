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
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, CircleSlashed, Loader2 } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Komponen untuk menampilkan dan mengelola daftar koleksi
 */
export default function CollectionList() {
  const { toast } = useToast();
  const {
    collections,
    loading,
    error,
    fetchCollections,
    deleteCollection,
    updateCollection,
    deletingCollections,
  } = useCollectionStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Ambil data koleksi saat komponen dimount
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  /**
   * Menangani permintaan edit koleksi
   * @param collection Koleksi yang akan diedit
   */
  const handleEdit = (collection: { id: string; name: string }) => {
    setEditingId(collection.id);
    setEditName(collection.name);
  };

  /**
   * Menangani penyimpanan perubahan koleksi
   */
  const handleSaveEdit = async () => {
    if (!editingId) return;

    if (!editName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Nama koleksi tidak boleh kosong",
      });
      return;
    }

    try {
      setIsEditing(true);
      await updateCollection(editingId, { name: editName });
      toast({
        title: "Koleksi berhasil diperbarui",
        description: "Perubahan pada koleksi telah disimpan.",
      });
      setEditingId(null);
      setEditName("");
    } catch (error) {
      toast({
        title: "Gagal memperbarui koleksi",
        description: "Terjadi kesalahan saat memperbarui koleksi.",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  /**
   * Menangani penghapusan koleksi
   */
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const result = await deleteCollection(deleteId);

      if (result.success) {
        toast({
          title: "Koleksi berhasil dihapus",
          description: "Koleksi telah dihapus dari database.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Gagal menghapus koleksi",
          description:
            result.message || "Terjadi kesalahan saat menghapus koleksi.",
        });
      }
      setDeleteId(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus koleksi.";

      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    }
  };

  /**
   * Render loading skeleton
   */
  if (loading && collections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daftar Koleksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
            <p>Terjadi kesalahan saat memuat data: {error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCollections()}
              className="mt-2"
            >
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Koleksi</CardTitle>
      </CardHeader>
      <CardContent>
        {collections.length === 0 ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
            <CircleSlashed className="h-8 w-8" />
            <p>Belum ada koleksi</p>
          </div>
        ) : (
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
                      <div className="flex flex-col md:flex-row gap-2 items-center">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !isEditing) {
                              handleSaveEdit();
                            }
                          }}
                          className="flex-grow"
                          disabled={isEditing}
                        />
                        <div className="w-full flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={isEditing}
                          >
                            {isEditing ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : null}
                            {isEditing ? "Menyimpan..." : "Simpan"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            disabled={isEditing}
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
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(collection)}
                      disabled={editingId !== null}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Dialog
                      open={deleteId === collection.id}
                      onOpenChange={(open) => !open && setDeleteId(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => setDeleteId(collection.id)}
                          disabled={
                            deleteId !== null ||
                            deletingCollections[collection.id]
                          }
                        >
                          {deletingCollections[collection.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Konfirmasi Hapus</DialogTitle>
                          <DialogDescription>
                            Apakah Anda yakin ingin menghapus koleksi "
                            {collection.name}"? Koleksi yang digunakan oleh
                            produk tidak dapat dihapus.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                            disabled={deletingCollections[collection.id]}
                          >
                            Batal
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deletingCollections[collection.id]}
                          >
                            {deletingCollections[collection.id] ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Menghapus...
                              </>
                            ) : (
                              "Hapus"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
