"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FAQ } from "@/types/faq";
import { createFAQ, updateFAQ } from "@/lib/api/faqs";

interface FAQFormProps {
  initialData?: FAQ | null;
  onSuccess: () => void;
}

export default function FAQForm({ initialData, onSuccess }: FAQFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [question, setQuestion] = useState(initialData?.question || "");
  const [answer, setAnswer] = useState(initialData?.answer || "");

  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question || !answer) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Pertanyaan dan jawaban harus diisi",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing && initialData) {
        // Update existing FAQ
        await updateFAQ(initialData.id, { question, answer });
        toast({
          title: "Sukses",
          description: "FAQ berhasil diperbarui",
        });
      } else {
        // Create new FAQ
        await createFAQ({ question, answer });
        toast({
          title: "Sukses",
          description: "FAQ baru berhasil ditambahkan",
        });
      }

      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menyimpan FAQ",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="question">Pertanyaan</Label>
        <Input
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Masukkan pertanyaan"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="answer">Jawaban</Label>
        <Textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Masukkan jawaban"
          className="min-h-[200px]"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !question || !answer}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Perbarui FAQ" : "Tambah FAQ"}
        </Button>
      </div>
    </form>
  );
}
