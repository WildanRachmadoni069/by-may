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
import { useCategoryStore } from "@/store/useCategoryStore";
import { Skeleton } from "@/components/ui/skeleton";
import { logError, getErrorMessage } from "@/lib/debug";

/**
 * Komponen untuk menampilkan dan mengelola daftar kategori
 */
export default function CategoryList() {
  const { toast } = useToast();
  const {
    categories,
    loading,
    error,
    fetchCategories,
    deleteCategory,
    updateCategory,
    deletingCategories,
  } = useCategoryStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Ambil data kategori saat komponen dimount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /**
   * Menangani permintaan edit kategori
   * @param category Kategori yang akan diedit
   */
  const handleEdit = (category: { id: string; name: string }) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  /**
   * Menangani penyimpanan perubahan kategori
   */
  const handleSaveEdit = async () => {
    if (!editingId) return;

    if (!editName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Nama kategori tidak boleh kosong",
      });
      return;
    }

    try {
      setIsEditing(true);
      await updateCategory(editingId, { name: editName });
      toast({
        title: "Kategori berhasil diperbarui",
        description: "Perubahan pada kategori telah disimpan.",
      });
      setEditingId(null);
      setEditName("");
    } catch (error) {
      logError("CategoryList.handleSaveEdit", error);
      toast({
        title: "Gagal memperbarui kategori",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  /**
   * Menangani penghapusan kategori
   */
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const result = await deleteCategory(deleteId);

      if (result.success) {
        toast({
          title: "Kategori berhasil dihapus",
          description: "Kategori telah dihapus dari database.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Gagal menghapus kategori",
          description:
            result.message || "Terjadi kesalahan saat menghapus kategori.",
        });
      }
      setDeleteId(null);
    } catch (error) {
      logError("CategoryList.handleDelete", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
    } finally {
      setDeleteId(null);
    }
  };

  /**
   * Render loading skeleton
   */
  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
        <p>Terjadi kesalahan saat memuat data: {error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchCategories()}
          className="mt-2"
        >
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
        <CircleSlashed className="h-8 w-8" />
        <p>Belum ada kategori</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
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
                        {isEditing && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
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
                  category.name
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Dialog open={deleteId === category.id}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-primary" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Hapus Kategori</DialogTitle>
                        <DialogDescription>
                          Apakah Anda yakin ingin menghapus kategori ini?
                          Kategori yang dihapus tidak dapat dikembalikan.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setDeleteId(null)}
                        >
                          Batal
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={deletingCategories[category.id]}
                        >
                          {deletingCategories[category.id] ? (
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
