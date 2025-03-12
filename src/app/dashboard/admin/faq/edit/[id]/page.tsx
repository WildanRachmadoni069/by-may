"use client";

import { useEffect } from "react";
import { FaqForm } from "@/components/admin/faq/FaqForm";
import { Separator } from "@/components/ui/separator";
import { useFaqStore } from "@/store/useFaqStore";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditFaqPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { fetchFAQ, selectedFAQ, loading, error } = useFaqStore();

  useEffect(() => {
    if (id) {
      fetchFAQ(id);
    }
  }, [id, fetchFAQ]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <Separator />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!selectedFAQ) {
    return <div>FAQ tidak ditemukan</div>;
  }

  const initialData = {
    question: selectedFAQ.question,
    answer: selectedFAQ.answer,
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit FAQ</h3>
        <p className="text-sm text-muted-foreground">
          Perbarui pertanyaan dan jawaban FAQ.
        </p>
      </div>
      <Separator />
      <FaqForm faqId={id} initialData={initialData} />
    </div>
  );
}
