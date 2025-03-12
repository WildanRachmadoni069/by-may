"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useFaqStore } from "@/store/useFaqStore";
import { FAQFormValues } from "@/types/faq";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqFormProps {
  faqId?: string;
  initialData?: FAQFormValues;
}

const FaqSchema = Yup.object().shape({
  question: Yup.string().required("Pertanyaan wajib diisi"),
  answer: Yup.string().required("Jawaban wajib diisi"),
});

const initialValues: FAQFormValues = {
  question: "",
  answer: "",
};

export function FaqForm({ faqId, initialData }: FaqFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { addFAQ, editFAQ } = useFaqStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: initialData || initialValues,
    validationSchema: FaqSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        if (faqId) {
          await editFAQ(faqId, values);
          toast({
            title: "FAQ berhasil diperbarui",
            description: "Perubahan telah disimpan",
          });
        } else {
          await addFAQ(values);
          toast({
            title: "FAQ berhasil ditambahkan",
            description: "FAQ baru telah disimpan",
          });
        }
        router.push("/dashboard/admin/faq");
      } catch (error) {
        console.error("Error submitting form:", error);
        toast({
          variant: "destructive",
          title: "Gagal menyimpan FAQ",
          description: "Terjadi kesalahan. Silakan coba lagi.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Informasi FAQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="question" className="text-base font-medium">
                Pertanyaan
              </Label>
              <div className="mt-2">
                <Input
                  id="question"
                  {...formik.getFieldProps("question")}
                  placeholder="Masukkan pertanyaan yang sering diajukan pelanggan"
                  className="text-base"
                />
                <div className="flex justify-between mt-1">
                  <div>
                    {formik.touched.question && formik.errors.question && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.question}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getCharacterCount(formik.values.question)}/150 karakter
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="answer" className="text-base font-medium">
                Jawaban
              </Label>
              <div className="mt-2">
                <Textarea
                  id="answer"
                  {...formik.getFieldProps("answer")}
                  placeholder="Masukkan jawaban yang jelas dan lengkap"
                  rows={10}
                  className="text-base"
                />
                <div className="flex justify-between mt-1">
                  <div>
                    {formik.touched.answer && formik.errors.answer && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.answer}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getCharacterCount(formik.values.answer)}/500 karakter
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2">
                Tips menulis FAQ yang baik:
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Gunakan bahasa yang sederhana dan mudah dipahami</li>
                <li>Jawaban sebaiknya lengkap namun tetap singkat dan jelas</li>
                <li>
                  Format jawaban dalam poin-poin untuk informasi yang kompleks
                </li>
                <li>Pastikan jawaban menjawab pertanyaan dengan tepat</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Preview Area */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Pratinjau FAQ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="preview-item">
                  <AccordionTrigger className="px-4">
                    {formik.values.question || "Pertanyaan belum diisi"}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 whitespace-pre-wrap">
                    {formik.values.answer || "Jawaban belum diisi"}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>

        {/* Submit buttons */}
        <div className="sticky bottom-0 left-0 right-0 py-4 bg-background border-t">
          <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
            <div>
              {formik.status?.submitError && (
                <div className="text-red-500">{formik.status.submitError}</div>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/admin/faq")}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : faqId
                  ? "Perbarui FAQ"
                  : "Simpan FAQ"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
