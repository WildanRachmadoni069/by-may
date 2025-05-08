"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createFAQ } from "@/lib/api/faqs";
import { useSWRConfig } from "swr";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export default function AddFAQPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { mutate } = useSWRConfig();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await createFAQ({ question, answer });

      // Invalidate cache
      mutate("/api/faqs");

      toast({
        title: "Sukses",
        description: "FAQ berhasil ditambahkan",
      });

      router.push("/dashboard/admin/faq");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Gagal membuat FAQ",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <BreadcrumbLink>Tambah FAQ</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold mb-2">Tambah FAQ Baru</h1>
        <p className="text-muted-foreground">
          Tambahkan pertanyaan umum dan jawabannya untuk membantu pelanggan
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pertanyaan dan Jawaban</CardTitle>
          <CardDescription>
            Masukkan detail pertanyaan dan jawaban untuk ditampilkan di halaman
            FAQ
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
                  "Simpan FAQ"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
