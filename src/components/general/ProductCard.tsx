import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  stock: number;
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={"/"}
      className="group relative block overflow-hidden w-full max-w-xs"
    >
      <Card>
        {/* Gambar Produk */}
        <CardHeader className="p-0 overflow-hidden">
          <div className="relative aspect-square transition duration-500 group-hover:scale-105 ">
            <Image
              src="https://placehold.co/300"
              alt="Product Image"
              fill
              className="object-cover"
            />
          </div>
        </CardHeader>

        {/* Detail Produk */}
        <CardContent className="flex flex-col gap-1 pt-2">
          <h3 className="text-lg font-semibold text-wrap min-h-[56px] line-clamp-2">
            {product.title}
          </h3>
          <p className="text-gray-600">
            <span className="text-sm">Rp</span>
            {product.price}
          </p>
        </CardContent>

        {/* Tombol Tambah ke Keranjang */}
        <CardFooter>
          <Button
            size="default"
            className="w-full transition duration-300 hover:scale-105"
            aria-label="Tambah ke Keranjang"
          >
            <ShoppingCart size={20} />
            <p>Tambah Keranjang</p>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

export default ProductCard;
