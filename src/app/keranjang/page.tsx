"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore } from "@/store/useCartStore";
import useAuthStore from "@/store/useAuthStore";
import { formatRupiah } from "@/lib/utils";
import { getVariantLabel } from "@/utils/cart";
import { MinusIcon, PlusIcon, ShoppingBagIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";
import { UpdateCartItemInput } from "@/types/cart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Construction } from "lucide-react";

export default function CartPage() {
  const {
    items,
    summary,
    isLoading,
    isInitialized,
    fetchCart,
    updateItemQuantity,
    removeItem,
    error,
  } = useCartStore();
  const { currentUser, initialized: isAuthInitialized } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  // Local state for cart item quantities with pending updates
  const [pendingQuantities, setPendingQuantities] = useState<
    Record<string, number>
  >({});

  // Track items being updated to show loading state
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>(
    {}
  );

  // Create debounced version of pendingQuantities
  const debouncedQuantities = useDebounce(pendingQuantities, 500);

  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemName: string | null;
  }>({
    isOpen: false,
    itemId: null,
    itemName: null,
  });

  // Add state for development feature dialog
  const [showDevFeatureDialog, setShowDevFeatureDialog] = useState(false);

  // Handle hydration issue
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load cart data when auth is initialized
  useEffect(() => {
    if (isMounted && isAuthInitialized && currentUser && !isInitialized) {
      fetchCart();
    }
  }, [isMounted, isAuthInitialized, currentUser, isInitialized, fetchCart]);

  // Initialize pending quantities from cart items
  useEffect(() => {
    if (items.length > 0) {
      const initialQuantities: Record<string, number> = {};
      items.forEach((item) => {
        if (item.id) {
          initialQuantities[item.id] = item.quantity;
        }
      });
      setPendingQuantities(initialQuantities);
    }
  }, [items]);

  // Process debounced quantity updates
  useEffect(() => {
    const updatePendingQuantities = async () => {
      const itemsToUpdate = Object.entries(debouncedQuantities);

      for (const [itemId, quantity] of itemsToUpdate) {
        const item = items.find((i) => i.id === itemId);

        // Skip if no change from current cart value or item not found
        if (!item || item.quantity === quantity) continue;

        // Mark item as updating
        setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));

        try {
          await updateItemQuantity({ id: itemId, quantity });
        } catch (error) {
          console.error("Error updating quantity:", error);

          // Revert to previous value on error
          setPendingQuantities((prev) => ({
            ...prev,
            [itemId]: item.quantity,
          }));

          toast({
            variant: "destructive",
            description:
              error instanceof Error
                ? error.message
                : "Failed to update quantity",
          });
        } finally {
          // Remove updating state
          setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
        }
      }
    };

    if (Object.keys(debouncedQuantities).length > 0) {
      updatePendingQuantities();
    }
  }, [debouncedQuantities, items, updateItemQuantity, toast]);

  // Handle direct quantity change
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    // Find the item
    const item = items.find((i) => i.id === id);
    if (!item) return;

    // Check stock limit
    const maxStock = item.priceVariant?.stock || 99;
    if (newQuantity > maxStock) {
      toast({
        description: `Maximum available stock is ${maxStock}`,
      });
      newQuantity = maxStock;
    }

    // Update local state immediately for responsive UI
    setPendingQuantities((prev) => ({
      ...prev,
      [id]: newQuantity,
    }));
  };

  // Handle increment/decrement buttons
  const handleQuantityAdjust = (id: string, adjustment: 1 | -1) => {
    const currentQty = pendingQuantities[id] || 1;
    const newQty = currentQty + adjustment;

    if (newQty < 1) return;

    // Find the item
    const item = items.find((i) => i.id === id);
    if (!item) return;

    // Check stock limit when incrementing
    if (adjustment > 0) {
      const maxStock = item.priceVariant?.stock || 99;
      if (newQty > maxStock) {
        toast({
          description: `Maximum available stock is ${maxStock}`,
        });
        return;
      }
    }

    // Update local state immediately
    setPendingQuantities((prev) => ({
      ...prev,
      [id]: newQty,
    }));
  };

  // Handle opening delete confirmation dialog
  const handleOpenDeleteDialog = (id: string, name?: string) => {
    setDeleteDialog({
      isOpen: true,
      itemId: id,
      itemName: name || "Item",
    });
  };

  // Handle close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      itemId: null,
      itemName: null,
    });
  };

  // Handle confirmed item removal
  const handleConfirmedRemove = async () => {
    const { itemId } = deleteDialog;

    if (!itemId) return;

    try {
      // Mark item as updating to show loading state
      setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));

      // Close the dialog first
      handleCloseDeleteDialog();

      await removeItem(itemId);

      toast({
        description: "Item berhasil dihapus dari keranjang",
      });

      // Remove from pending quantities
      setPendingQuantities((prev) => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "Gagal menghapus item",
      });
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Don't show any content during hydration
  if (!isMounted) {
    return null;
  }

  // Show login prompt if not logged in
  if (isMounted && !currentUser) {
    return (
      <div className="container max-w-4xl mx-auto p-4 min-h-[60vh] flex flex-col items-center justify-center">
        <Card className="w-full max-w-md text-center p-6">
          <CardHeader>
            <div className="mx-auto w-16 h-16 mb-4">
              <ShoppingBagIcon className="w-16 h-16 text-muted-foreground/50" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Login Diperlukan
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground pb-6">
            Silakan login untuk melihat keranjang belanja Anda
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild size="lg">
              <Link href="/login">Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (isLoading || !isInitialized) {
    return (
      <div className="container max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Keranjang Belanja</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[100px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Show empty cart
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
      <h1 className="text-3xl font-bold mb-6">Keranjang Belanja</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Cart Items Section */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Produk ({items.length})</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-350px)]">
              <CardContent className="p-0">
                <div className="divide-y">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 hover:bg-muted/50 transition-all duration-200 animate-fadeIn ${
                        updatingItems[item.id!] ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border bg-muted">
                          {item.product?.featuredImage ? (
                            <Image
                              src={item.product.featuredImage.url}
                              alt={
                                item.product.featuredImage.alt ||
                                item.product?.name ||
                                "Product image"
                              }
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                              No image
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="space-y-1">
                            {/* Product Name with Link */}
                            <h3 className="font-medium">
                              <Link
                                href={`/produk/${item.product?.slug}`}
                                className="hover:underline"
                              >
                                {item.product?.name}
                              </Link>
                            </h3>

                            {/* Variations if any */}
                            {item.priceVariant && (
                              <p className="text-sm text-muted-foreground">
                                {getVariantLabel(item.priceVariant)}
                              </p>
                            )}

                            {/* Price and Stock Information */}
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-primary">
                                {formatRupiah(item.priceVariant?.price || 0)}
                              </p>

                              {/* Add Stock Information */}
                              <p className="text-xs text-muted-foreground">
                                Stok:{" "}
                                {item.priceVariant?.stock || "Tidak tersedia"}
                              </p>
                            </div>
                          </div>

                          {/* Quantity Controls with debounce */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleQuantityAdjust(item.id!, -1)
                                }
                                disabled={
                                  updatingItems[item.id!] ||
                                  pendingQuantities[item.id!] <= 1
                                }
                              >
                                <MinusIcon className="h-4 w-4" />
                              </Button>

                              <Input
                                type="number"
                                value={
                                  pendingQuantities[item.id!] || item.quantity
                                }
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val) && val > 0) {
                                    handleQuantityChange(item.id!, val);
                                  }
                                }}
                                className="w-14 h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                min="1"
                                disabled={updatingItems[item.id!]}
                              />

                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleQuantityAdjust(item.id!, 1)
                                }
                                disabled={
                                  updatingItems[item.id!] ||
                                  pendingQuantities[item.id!] >=
                                    (item.priceVariant?.stock || 99)
                                }
                              >
                                <PlusIcon className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() =>
                                handleOpenDeleteDialog(
                                  item.id!,
                                  item.product?.name
                                )
                              }
                              disabled={updatingItems[item.id!]}
                            >
                              {updatingItems[item.id!] ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <TrashIcon className="h-4 w-4" />
                              )}
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

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <Card className="sticky top-4">
            <CardHeader className="border-b">
              <CardTitle>Ringkasan Belanja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* Show summary */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total Harga ({summary.totalItems} produk)
                  </span>
                  <span>{formatRupiah(summary.totalAmount)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total Tagihan</span>
                  <span className="text-lg text-primary">
                    {formatRupiah(summary.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowDevFeatureDialog(true)}
              >
                Lanjut ke Pembayaran
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDeleteDialog();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {deleteDialog.itemName} dari
              keranjang belanja Anda?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Development Feature Dialog */}
      <Dialog
        open={showDevFeatureDialog}
        onOpenChange={setShowDevFeatureDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Construction className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl pt-4">
              Fitur Dalam Pengembangan
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Maaf, fitur pembayaran sedang dalam proses pengembangan dan akan
              tersedia segera. Terima kasih atas kesabaran Anda.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              variant="default"
              onClick={() => setShowDevFeatureDialog(false)}
            >
              Saya Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
