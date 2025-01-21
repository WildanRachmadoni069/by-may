import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, PlusCircle, Trash } from "lucide-react";
import Link from "next/link";
import React from "react";

function AdminProductList() {
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Harga</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Nama Produk</TableCell>
            <TableCell>Rp1.000.000</TableCell>
            <TableCell>100</TableCell>
            <TableCell>
              <Link href={`/dashboard/products/edit/989898`}>
                <Button variant="ghost" size="sm" className="mr-2">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <Trash className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
}

export default AdminProductList;
