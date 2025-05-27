"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { logError, getErrorMessage } from "@/lib/debug";

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

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Ambil data koleksi saat komponen dimount
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  /**
   * Menangani permintaan edit koleksi
   * @param collection Koleksi yang akan diedit
   */
  const handleEdit = (collection: { slug: string; name: string }) => {
    setEditingSlug(collection.slug);
    setEditName(collection.name);
  };

  /**
   * Menangani penyimpanan perubahan koleksi
   */
  const handleSaveEdit = async () => {
    if (!editingSlug) return;

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
      await updateCollection(editingSlug, { name: editName });
      toast({
        title: "Koleksi berhasil diperbarui",
        description: "Perubahan pada koleksi telah disimpan.",
      });
      setEditingSlug(null);
      setEditName("");
    } catch (error) {
      logError("CollectionList.handleSaveEdit", error);
      toast({
        title: "Gagal memperbarui koleksi",
        description: getErrorMessage(error),
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
    if (!deleteSlug) return;

    try {
      const result = await deleteCollection(deleteSlug);
      if (result.success) {
        toast({
          title: "Koleksi berhasil dihapus",
          description: "Koleksi telah dihapus dari sistem.",
        });
      } else {
        throw new Error(result.message || "Gagal menghapus koleksi");
      }
    } catch (error) {
      logError("CollectionList.handleDelete", error);
      toast({
        title: "Gagal menghapus koleksi",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setDeleteSlug(null);
    }
  };

  /**
   * Menangani pembatalan edit
   */
  const handleCancelEdit = () => {
    setEditingSlug(null);
    setEditName("");
  };

  // Jika sedang loading, tampilkan skeleton
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Jika terjadi error, tampilkan pesan error
  if (error) {
    return (
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
    );
  }

  // Jika tidak ada data koleksi
  if (!collections || collections.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
        <CircleSlashed className="h-8 w-8" />
        <p>Belum ada koleksi</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Koleksi</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.map((collection) => (
            <TableRow key={collection.id}>
              <TableCell>
                {editingSlug === collection.slug ? (
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
                      placeholder="Nama koleksi..."
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
                        onClick={handleCancelEdit}
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
              <TableCell>{collection.slug}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(collection)}
                  disabled={editingSlug !== null}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Dialog
                  open={deleteSlug === collection.slug}
                  onOpenChange={(open) => !open && setDeleteSlug(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => setDeleteSlug(collection.slug)}
                      disabled={
                        deleteSlug !== null ||
                        deletingCollections[collection.slug]
                      }
                    >
                      {deletingCollections[collection.slug] ? (
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
                        {collection.name}"? Koleksi yang digunakan oleh produk
                        tidak dapat dihapus.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteSlug(null)}
                        disabled={deletingCollections[collection.slug]}
                      >
                        Batal
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deletingCollections[collection.slug]}
                      >
                        {deletingCollections[collection.slug] ? (
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
    </div>
  );
}
