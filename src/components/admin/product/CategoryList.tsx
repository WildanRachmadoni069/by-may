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
import { CategoryData } from "@/types/category";

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

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Ambil data kategori saat komponen dimount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /**
   * Menangani permintaan edit kategori
   */
  const handleEdit = (category: CategoryData) => {
    setEditingSlug(category.slug);
    setEditName(category.name);
  };

  /**
   * Menangani pembatalan edit
   */
  const handleCancelEdit = () => {
    setEditingSlug(null);
    setEditName("");
  };

  /**
   * Menangani penyimpanan perubahan kategori
   */
  const handleSaveEdit = async () => {
    if (!editingSlug) return;

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
      const category = categories.find((c) => c.slug === editingSlug);
      if (!category) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Kategori tidak ditemukan",
        });
        return;
      }

      const result = await updateCategory(category.id, { name: editName });

      if (result.success && result.data) {
        // Refresh data untuk memastikan UI terupdate
        await fetchCategories();

        toast({
          title: "Kategori berhasil diperbarui",
          description:
            result.message || "Perubahan pada kategori telah disimpan.",
        });
        setEditingSlug(null);
        setEditName("");
      } else {
        throw new Error(result.message || "Gagal memperbarui kategori");
      }
    } catch (error) {
      logError("CategoryList.handleSaveEdit", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
    } finally {
      setIsEditing(false);
    }
  };

  /**
   * Menangani penghapusan kategori
   */
  const handleDelete = async () => {
    if (!deleteSlug) return;

    try {
      const category = categories.find((c) => c.slug === deleteSlug);
      if (!category) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Kategori tidak ditemukan",
        });
        return;
      }

      const result = await deleteCategory(category.id);

      if (result.success) {
        // Refresh data untuk memastikan UI terupdate
        await fetchCategories();

        toast({
          title: "Kategori berhasil dihapus",
          description:
            result.message || "Kategori telah dihapus dari database.",
        });
      } else {
        throw new Error(
          result.message || "Terjadi kesalahan saat menghapus kategori."
        );
      }
    } catch (error) {
      logError("CategoryList.handleDelete", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
    } finally {
      setDeleteSlug(null);
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Kategori</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            // Loading skeleton
            [...Array(3)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-6 w-[200px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-[120px]" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : error ? (
            // Error state
            <TableRow>
              <TableCell colSpan={3}>
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
              </TableCell>
            </TableRow>
          ) : categories.length === 0 ? (
            // Empty state
            <TableRow>
              <TableCell colSpan={3}>
                <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
                  <CircleSlashed className="h-8 w-8" />
                  <p>Belum ada kategori</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            // Data state
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  {editingSlug === category.slug ? (
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
                      <div className="w-full md:w-auto flex gap-2">
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
                          onClick={handleCancelEdit}
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
                <TableCell>{category.slug}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(category)}
                      disabled={editingSlug !== null || isEditing}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Dialog
                      open={deleteSlug === category.slug}
                      onOpenChange={(isOpen) => !isOpen && setDeleteSlug(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteSlug(category.slug)}
                          disabled={
                            deleteSlug !== null ||
                            deletingCategories[category.slug]
                          }
                          className="text-destructive hover:text-destructive"
                        >
                          {deletingCategories[category.slug] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Hapus Kategori</DialogTitle>
                          <DialogDescription>
                            Apakah Anda yakin ingin menghapus kategori &quot;
                            {category.name}&quot;? Kategori yang dihapus tidak
                            dapat dikembalikan.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDeleteSlug(null)}
                            disabled={deletingCategories[category.slug]}
                          >
                            Batal
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deletingCategories[category.slug]}
                          >
                            {deletingCategories[category.slug] ? (
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
