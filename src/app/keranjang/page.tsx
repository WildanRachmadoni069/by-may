"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useCartStore } from "@/store/useCartStore";
import { formatRupiah } from "@/lib/utils";
import { MinusIcon, PlusIcon, ShoppingBagIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { CartItem } from "@/types/cart";

export default function CartPage() {
  const {
    items,
    loading,
    error,
    initializeCart,
    updateQuantity,
    removeItem,
    getTotalPrice,
  } = useCartStore();

  const { toast } = useToast();
  const totalPrice = getTotalPrice();
  const freeShippingThreshold = 300000;
  const progressToFreeShipping = Math.min(
    (totalPrice / freeShippingThreshold) * 100,
    100
  );

  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

  const handleUpdateQuantity = async (
    productId: string,
    quantity: number,
    variationKey?: string
  ) => {
    if (quantity < 1) return;
    try {
      await updateQuantity(productId, quantity, variationKey);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Gagal mengubah jumlah produk",
      });
    }
  };

  const handleRemoveItem = async (productId: string, variationKey?: string) => {
    try {
      await removeItem(productId, variationKey);
      toast({
        description: "Produk berhasil dihapus dari keranjang",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Gagal menghapus produk",
      });
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[100px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto p-4 min-h-[60vh] flex flex-col items-center justify-center">
        <Card className="w-full max-w-md text-center p-6">
          <CardHeader>
            <div className="mx-auto w-16 h-16 mb-4">
              <ShoppingBagIcon className="w-16 h-16 text-muted-foreground/50" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Keranjang Kosong
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground pb-6">
            Belum ada produk di keranjang belanja Anda. Yuk, mulai belanja!
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild size="lg">
              <Link href="/produk">Lihat Katalog Produk</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Cart Items Section */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Keranjang Belanja ({items.length} produk)</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-350px)]">
              <CardContent className="p-0">
                <div className="divide-y">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variationKey}`}
                      className="p-4 hover:bg-muted/50 transition-all duration-200 animate-fadeIn"
                    >
                      <div className="flex gap-4">
                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="space-y-1">
                            <h3 className="font-medium">{item.name}</h3>
                            {item.selectedOptions && (
                              <p className="text-sm text-muted-foreground">
                                {Object.values(item.selectedOptions).join(
                                  " / "
                                )}
                              </p>
                            )}
                            <p className="font-medium text-primary">
                              {formatRupiah(item.price)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.productId,
                                    item.quantity - 1,
                                    item.variationKey
                                  )
                                }
                              >
                                <MinusIcon className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateQuantity(
                                    item.productId,
                                    parseInt(e.target.value) || 1,
                                    item.variationKey
                                  )
                                }
                                className="w-14 h-8 text-center"
                                min="1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.productId,
                                    item.quantity + 1,
                                    item.variationKey
                                  )
                                }
                              >
                                <PlusIcon className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() =>
                                handleRemoveItem(
                                  item.productId,
                                  item.variationKey
                                )
                              }
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>

        {/* Summary Section */}
        <div className="lg:col-span-4">
          <Card className="sticky top-4">
            <CardHeader className="border-b">
              <CardTitle>Ringkasan Belanja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {totalPrice < freeShippingThreshold && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Tambah {formatRupiah(freeShippingThreshold - totalPrice)}{" "}
                    lagi untuk mendapatkan gratis ongkir
                  </p>
                  <Progress value={progressToFreeShipping} className="h-2" />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total Harga ({items.length} produk)
                  </span>
                  <span>{formatRupiah(totalPrice)}</span>
                </div>
                {totalPrice >= freeShippingThreshold && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ongkos Kirim</span>
                    <span className="text-green-600">GRATIS</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total Tagihan</span>
                  <span className="text-lg text-primary">
                    {formatRupiah(totalPrice)}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg">
                Lanjut ke Pembayaran
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
