"use client";
import React, { useEffect, useState } from "react";
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
import { Pencil, PlusCircle, Trash, Search, Eye } from "lucide-react"; // Add Eye icon
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useProductStore } from "@/store/useProductStore";
import { useCollectionStore } from "@/store/useCollectionStore";
import { useProductFilterStore } from "@/store/useProductFilterStore";

interface Product {
  id: string;
  name: string;
  basePrice?: number;
  baseStock?: number;
  hasVariations: boolean;
  variationPrices: Record<string, { price: number; stock: number }>;
  category: string;
}

function AdminProductList() {
  const {
    products,
    loading: productsLoading,
    error,
    hasMore,
    fetchFilteredProducts,
    fetchMoreProducts,
    removeProduct,
  } = useProductStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const filters = useProductFilterStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { collections, fetchCollections } = useCollectionStore();

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchCollections();
  }, [fetchCategories, fetchCollections]);

  // Fetch filtered products
  useEffect(() => {
    fetchFilteredProducts({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
      itemsPerPage: 10,
    });
  }, [
    fetchFilteredProducts,
    filters.category,
    filters.collection,
    filters.sortBy,
  ]);

  const loadMore = () => {
    fetchMoreProducts({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
      itemsPerPage: 10,
      searchQuery: searchQuery.trim(),
    });
  };

  const handleDelete = async (productId: string) => {
    try {
      await removeProduct(productId);
      toast({
        title: "Sukses",
        description: "Produk berhasil dihapus",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus produk",
      });
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      // Reset to initial state if search is empty
      fetchFilteredProducts({
        category: filters.category,
        collection: filters.collection,
        sortBy: filters.sortBy,
        itemsPerPage: 10,
      });
      return;
    }

    fetchFilteredProducts({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
      itemsPerPage: 10,
      searchQuery: searchQuery.trim(),
    });
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    fetchFilteredProducts({
      category: filters.category,
      collection: filters.collection,
      sortBy: filters.sortBy,
      itemsPerPage: 10,
    });
  };

  const getProductPrice = (product: Product) => {
    if (!product.hasVariations) {
      // Format harga untuk produk tanpa variasi
      return formatRupiah(product.basePrice || 0);
    }

    // Format harga untuk produk dengan variasi
    const prices = Object.values(product.variationPrices).map((v) => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return minPrice === maxPrice
      ? formatRupiah(minPrice)
      : `${formatRupiah(minPrice)} - ${formatRupiah(maxPrice)}`;
  };

  const getProductStock = (product: Product) => {
    if (!product.hasVariations) {
      return product.baseStock || 0;
    }

    return Object.values(product.variationPrices).reduce(
      (total, variation) => total + variation.stock,
      0
    );
  };

  if (productsLoading) {
    return (
      <div className="space-y-4">
        <div className="w-full flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daftar Produk</h1>
        <Link href="/dashboard/admin/product/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Produk
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
          <Button onClick={handleSearch} disabled={productsLoading}>
            {productsLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Mencari...
              </span>
            ) : (
              "Cari"
            )}
          </Button>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={handleResetSearch}
              disabled={productsLoading}
            >
              Reset
            </Button>
          )}
        </div>
        <Select value={filters.category} onValueChange={filters.setCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.collection}
          onValueChange={filters.setCollection}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Semua Koleksi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Koleksi</SelectItem>
            <SelectItem value="none">Tanpa Koleksi</SelectItem>
            {collections.map((collection) => (
              <SelectItem key={collection.value} value={collection.value}>
                {collection.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Harga</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                {productsLoading ? "Memuat..." : "Tidak ada produk yang sesuai"}
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  {categories.find((c) => c.value === product.category)
                    ?.label || "-"}
                </TableCell>
                <TableCell>{getProductPrice(product)}</TableCell>
                <TableCell>{getProductStock(product)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/produk/${product.slug}`} target="_blank">
                    <Button variant="outline" size="sm" className="mr-2">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/admin/product/edit/${product.id}`}>
                    <Button variant="outline" size="sm" className="mr-2">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="default" size="sm">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus produk ini? Tindakan
                          ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(product.id)}
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={productsLoading}
          >
            {productsLoading ? "Memuat..." : "Tampilkan Lebih Banyak"}
          </Button>
        </div>
      )}
    </>
  );
}

export default AdminProductList;
