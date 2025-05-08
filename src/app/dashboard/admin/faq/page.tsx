"use client";

import React, { useState } from "react";
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
import {
  Pencil,
  PlusCircle,
  Trash,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
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
import { useFAQs } from "@/hooks/useFAQs";
import { deleteFAQ, reorderFAQs } from "@/lib/api/faqs";
import { useSWRConfig } from "swr";
import FAQForm from "@/components/admin/faq/FaqForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FAQ } from "@/types/faq";

function AdminFaqList() {
  const { toast } = useToast();
  const { mutate: globalMutate } = useSWRConfig();
  const [isReordering, setIsReordering] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentFAQ, setCurrentFAQ] = useState<FAQ | null>(null);
  const [sheetMode, setSheetMode] = useState<"add" | "edit">("add");

  // Use SWR hook for FAQs
  const { faqs, isLoading, error, mutate } = useFAQs({ limit: 50 });

  const handleDelete = async (faqId: string) => {
    try {
      setDeletingId(faqId);
      await deleteFAQ(faqId);

      // Invalidate cache
      mutate();

      toast({
        title: "Sukses",
        description: "FAQ berhasil dihapus",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus FAQ",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddClick = () => {
    setCurrentFAQ(null);
    setSheetMode("add");
    setIsSheetOpen(true);
  };

  const handleEditClick = (faq: FAQ) => {
    setCurrentFAQ(faq);
    setSheetMode("edit");
    setIsSheetOpen(true);
  };

  const handleFormSuccess = () => {
    setIsSheetOpen(false);
    mutate(); // Refresh FAQ data
  };

  const moveItemUp = async (index: number) => {
    if (index <= 0 || isReordering) return;

    try {
      setIsReordering(true);
      const reorderedFaqs = [...faqs];
      const currentOrder = reorderedFaqs[index].order;
      const prevOrder = reorderedFaqs[index - 1].order;

      // Swap the order
      await reorderFAQs([
        { id: reorderedFaqs[index].id, order: prevOrder },
        { id: reorderedFaqs[index - 1].id, order: currentOrder },
      ]);

      // Trigger a revalidation
      mutate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengubah urutan FAQ",
      });
    } finally {
      setIsReordering(false);
    }
  };

  const moveItemDown = async (index: number) => {
    if (index >= faqs.length - 1 || isReordering) return;

    try {
      setIsReordering(true);
      const reorderedFaqs = [...faqs];
      const currentOrder = reorderedFaqs[index].order;
      const nextOrder = reorderedFaqs[index + 1].order;

      // Swap the order
      await reorderFAQs([
        { id: reorderedFaqs[index].id, order: nextOrder },
        { id: reorderedFaqs[index + 1].id, order: currentOrder },
      ]);

      // Trigger a revalidation
      mutate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengubah urutan FAQ",
      });
    } finally {
      setIsReordering(false);
    }
  };

  const renderTableSkeleton = () => (
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

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pertanyaan Umum (FAQ)</h1>
          <p className="text-muted-foreground">
            Kelola pertanyaan dan jawaban untuk membantu pelanggan
          </p>
        </div>

        <div className="p-8 text-center">
          <p className="text-red-500 mb-4">Error: {error.message}</p>
          <Button onClick={() => mutate()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header dengan judul dan tombol tambah */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pertanyaan Umum (FAQ)</h1>
          <p className="text-muted-foreground">
            Kelola pertanyaan dan jawaban untuk membantu pelanggan
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah FAQ
        </Button>
      </div>

      {/* Daftar FAQ dengan styling yang sama seperti daftar produk dan kategori */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="p-6">{renderTableSkeleton()}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: "50%" }}>Pertanyaan</TableHead>
                <TableHead style={{ width: "30%" }}>
                  Jawaban (Pratinjau)
                </TableHead>
                <TableHead>Urutan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mb-3 h-10 w-10"
                      >
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="17" x2="12" y2="17"></line>
                      </svg>
                      <p className="mb-2 font-medium">
                        Tidak ada FAQ yang ditemukan
                      </p>
                      <p className="text-sm">
                        Tambahkan FAQ pertama Anda untuk membantu pelanggan
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                faqs.map((faq, index) => (
                  <TableRow key={faq.id}>
                    <TableCell className="font-medium">
                      {faq.question}
                    </TableCell>
                    <TableCell>
                      {faq.answer.length > 100
                        ? `${faq.answer.substring(0, 100)}...`
                        : faq.answer}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={index === 0 || isReordering}
                          onClick={() => moveItemUp(index)}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={index === faqs.length - 1 || isReordering}
                          onClick={() => moveItemDown(index)}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditClick(faq)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={deletingId === faq.id}
                            >
                              {deletingId === faq.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus FAQ</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus FAQ ini?
                                Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(faq.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Ya, Hapus FAQ
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* FAQ Form in Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full md:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {sheetMode === "add" ? "Tambah FAQ" : "Edit FAQ"}
            </SheetTitle>
            <SheetDescription>
              {sheetMode === "add"
                ? "Buat FAQ baru untuk membantu pelanggan Anda"
                : "Perbarui informasi FAQ yang sudah ada"}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <FAQForm initialData={currentFAQ} onSuccess={handleFormSuccess} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default AdminFaqList;
