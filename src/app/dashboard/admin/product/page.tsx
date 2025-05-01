"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatRupiah } from "@/lib/utils";
import Image from "next/image";
import {
  getProductsAction,
  deleteProductAction,
} from "@/app/actions/product-actions";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";
import { Product } from "@/types/product";

function AdminProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean;
    slug: string | null;
  }>({
    open: false,
    slug: null,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { toast } = useToast();

  // Fetch products with filters
  const fetchProducts = async (page = 1) => {
    setIsLoading(true);
    try {
      const result = await getProductsAction({
        page,
        limit: 10,
        search: debouncedSearchQuery,
      });

      setProducts(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengambil produk. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when search changes
  useEffect(() => {
    fetchProducts(1);
  }, [debouncedSearchQuery]);

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchProducts(page);
  };

  // Handle product deletion
  const handleDelete = async (slug: string) => {
    // Open confirmation dialog with the slug to delete
    setDeleteConfirmDialog({
      open: true,
      slug,
    });
  };

  // Execute actual deletion after confirmation
  const confirmDelete = async () => {
    const slugToDelete = deleteConfirmDialog.slug;
    if (!slugToDelete) return;

    setDeleteConfirmDialog({ open: false, slug: null });
    setDeletingSlug(slugToDelete);

    try {
      const result = await deleteProductAction(slugToDelete);

      if (result.success) {
        toast({
          title: "Produk berhasil dihapus",
          description: "Produk telah dihapus dari sistem.",
        });
        fetchProducts(pagination.page);
      } else {
        toast({
          variant: "destructive",
          title: "Gagal menghapus produk",
          description:
            result.message || "Terjadi kesalahan saat menghapus produk.",
        });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Gagal menghapus produk",
        description:
          "Terjadi kesalahan saat menghapus produk. Silakan coba lagi.",
      });
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Daftar Produk</h1>
          <p className="text-muted-foreground">
            Kelola produk yang dijual di toko Anda
          </p>
        </div>
        <Link href="/dashboard/admin/product/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Produk
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Products Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Gambar</TableHead>
                  <TableHead className="w-[250px]">Nama Produk</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <p className="text-muted-foreground">
                        Tidak ada produk ditemukan
                      </p>
                      <Link href="/dashboard/admin/product/add">
                        <Button variant="link" className="mt-2">
                          Tambah Produk Baru
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.featuredImage?.url ? (
                          <div className="relative h-12 w-12 rounded-md overflow-hidden">
                            <Image
                              src={product.featuredImage.url}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        {product.hasVariations
                          ? "Multiple"
                          : product.basePrice
                          ? formatRupiah(product.basePrice)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {product.hasVariations
                          ? "Multiple"
                          : product.baseStock ?? "-"}
                      </TableCell>
                      <TableCell>{product.category?.name || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/admin/product/edit/${product.slug}`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(product.slug)}
                            disabled={deletingSlug === product.slug}
                          >
                            {deletingSlug === product.slug ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog.open}
        onOpenChange={(open) =>
          setDeleteConfirmDialog({ ...deleteConfirmDialog, open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteConfirmDialog({ open: false, slug: null })
              }
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Ya, Hapus Produk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminProductList;
