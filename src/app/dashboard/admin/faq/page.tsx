"use client";
import React, { useEffect } from "react";
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
import { Pencil, PlusCircle, Trash, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
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
import { useFaqStore } from "@/store/useFaqStore";

function AdminFaqList() {
  const {
    faqs,
    loading,
    error,
    hasMore,
    fetchFAQs,
    fetchMoreFAQs,
    removeFAQ,
    updateFAQOrder,
  } = useFaqStore();
  const { toast } = useToast();

  // Fetch all FAQs on mount (no need for pagination since FAQ lists are typically small)
  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  const handleDelete = async (faqId: string) => {
    try {
      await removeFAQ(faqId);
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
    }
  };

  const loadMore = () => {
    fetchMoreFAQs({ itemsPerPage: 10 });
  };

  const moveItemUp = async (index: number) => {
    if (index <= 0) return; // Already at the top

    const reorderedFaqs = [...faqs];
    const currentOrder = reorderedFaqs[index].order || index;
    const prevOrder = reorderedFaqs[index - 1].order || index - 1;

    // Swap the order
    await updateFAQOrder([
      { id: reorderedFaqs[index].id, order: prevOrder },
      { id: reorderedFaqs[index - 1].id, order: currentOrder },
    ]);
  };

  const moveItemDown = async (index: number) => {
    if (index >= faqs.length - 1) return; // Already at the bottom

    const reorderedFaqs = [...faqs];
    const currentOrder = reorderedFaqs[index].order || index;
    const nextOrder = reorderedFaqs[index + 1].order || index + 1;

    // Swap the order
    await updateFAQOrder([
      { id: reorderedFaqs[index].id, order: nextOrder },
      { id: reorderedFaqs[index + 1].id, order: currentOrder },
    ]);
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
    return <div>Error: {error}</div>;
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pertanyaan Umum (FAQ)</h1>
        <p className="text-muted-foreground">
          Kelola pertanyaan dan jawaban untuk membantu pelanggan
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div></div>
        <Link href="/dashboard/admin/faq/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah FAQ
          </Button>
        </Link>
      </div>

      {loading && faqs.length === 0 ? (
        renderTableSkeleton()
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
                <TableCell colSpan={4} className="text-center">
                  Tidak ada FAQ yang ditemukan
                </TableCell>
              </TableRow>
            ) : (
              faqs.map((faq, index) => (
                <TableRow key={faq.id}>
                  <TableCell className="font-medium">{faq.question}</TableCell>
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
                        disabled={index === 0}
                        onClick={() => moveItemUp(index)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={index === faqs.length - 1}
                        onClick={() => moveItemDown(index)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/dashboard/admin/faq/edit/${faq.id}`}>
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
                          <AlertDialogTitle>Hapus FAQ</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus FAQ ini? Tindakan
                            ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(faq.id)}
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
      )}

      {hasMore && faqs.length > 0 && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? "Memuat..." : "Tampilkan Lebih Banyak"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default AdminFaqList;
