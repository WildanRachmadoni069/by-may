"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateFAQ } from "@/lib/api/faqs";
import { useFAQ } from "@/hooks/useFAQs";
import { useSWRConfig } from "swr";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";

export default function EditFAQPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: globalMutate } = useSWRConfig();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch FAQ data using SWR
  const { faq, isLoading, error, mutate } = useFAQ(params.id);

  // Populate form when data is loaded
  useEffect(() => {
    if (faq) {
      setQuestion(faq.question);
      setAnswer(faq.answer);
    }
  }, [faq]);

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
      const updatedFaq = await updateFAQ(params.id, { question, answer });

      // Update local data and invalidate cache
      mutate(updatedFaq, false);
      globalMutate("/api/faqs");

      toast({
        title: "Sukses",
        description: "FAQ berhasil diperbarui",
      });

      router.push("/dashboard/admin/faq");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Gagal memperbarui FAQ",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat data FAQ...</p>
        </div>
      </div>
    );
  }

  if (error || !faq) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-lg font-medium">FAQ Tidak Ditemukan</h3>
          <p className="text-muted-foreground mt-2">{error?.message}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/dashboard/admin/faq")}
          >
            Kembali ke Daftar FAQ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb separator={<ChevronRight className="h-4 w-4" />}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/admin/faq">FAQ</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink>Edit FAQ</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold mb-2">Edit FAQ</h1>
        <p className="text-muted-foreground">
          Perbarui pertanyaan umum dan jawabannya untuk membantu pelanggan
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Pertanyaan dan Jawaban</CardTitle>
          <CardDescription>
            Perbarui informasi FAQ untuk membantu pelanggan
          </CardDescription>
        </CardHeader>
        <CardContent>
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

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/admin/faq")}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !question || !answer}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
