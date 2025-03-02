"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type Quill from "quill";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";
import type { ArticleData } from "@/types/article";
import { generateSlug, generateExcerpt } from "@/utils/article";
import LabelWithTooltip from "@/components/general/LabelWithTooltip";
import GoogleSearchPreview from "@/components/general/GoogleSearchPreview";
import FeaturedImageArticle from "@/components/admin/article/FeaturedImageArticle";
import CharacterCountSEO from "@/components/seo/CharacterCountSEO";

const QuillEditor = dynamic(() => import("@/components/editor/QuillEditor"), {
  ssr: false,
});

const validationSchema = Yup.object({
  title: Yup.string().required("Judul wajib diisi"),
  slug: Yup.string().required("Slug wajib diisi"),
  content: Yup.string().required("Konten wajib diisi"),
  excerpt: Yup.string().required("Ringkasan wajib diisi"),
  featured_image: Yup.object({
    url: Yup.string().url("URL tidak valid").nullable(),
    alt: Yup.string().when("url", ([url]) => {
      return url && url.length > 0
        ? Yup.string().required("Teks alt wajib diisi")
        : Yup.string().nullable();
    }),
  }).nullable(),
  status: Yup.string().oneOf(["draft", "published"]).required(),
  meta: Yup.object({
    title: Yup.string().required("Meta title wajib diisi"),
    description: Yup.string().required("Meta description wajib diisi"),
    og_image: Yup.string().url("URL tidak valid"),
  }),
});

interface EditArticleFormProps {
  article: ArticleData;
}

export default function EditArticleForm({ article }: EditArticleFormProps) {
  const quillRef = React.useRef<Quill>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [slugManuallyChanged, setSlugManuallyChanged] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      featured_image: article.featured_image,
      status: article.status,
      meta: article.meta,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const docRef = doc(db, "articles", article.id);
        const updateData = {
          ...values,
          updated_at: Timestamp.now(),
        };

        await updateDoc(docRef, updateData);
        toast({
          title: "Artikel berhasil diperbarui",
          description: "Perubahan telah berhasil disimpan",
        });
        router.push("/dashboard/admin/artikel");
      } catch (error) {
        console.error("Error updating article:", error);
        toast({
          title: "Gagal memperbarui artikel",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Improved slug generation
  React.useEffect(() => {
    if (!slugManuallyChanged) {
      const newSlug = generateSlug(formik.values.title);
      formik.setFieldValue("slug", newSlug);
    }
  }, [formik.values.title, slugManuallyChanged]);

  // Auto-generate excerpt when content changes
  React.useEffect(() => {
    const excerpt = generateExcerpt(formik.values.content);
    formik.setFieldValue("excerpt", excerpt);
  }, [formik.values.content]);

  // Sync featured image to og_image
  React.useEffect(() => {
    if (formik.values.featured_image?.url) {
      formik.setFieldValue("meta.og_image", formik.values.featured_image.url);
    }
  }, [formik.values.featured_image]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Artikel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <LabelWithTooltip
                htmlFor="title"
                label="Judul"
                tooltip="Judul artikel yang akan ditampilkan sebagai headline"
              />
              <Input id="title" {...formik.getFieldProps("title")} />
              {formik.touched.title && formik.errors.title && (
                <p className="text-sm text-red-500">{formik.errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <LabelWithTooltip
                htmlFor="slug"
                label="Slug"
                tooltip="URL ramah untuk artikel ini. Dibuat otomatis dari judul, tapi bisa diubah manual."
              />
              <Input
                id="slug"
                {...formik.getFieldProps("slug")}
                onChange={(e) => {
                  setSlugManuallyChanged(true);
                  formik.handleChange(e);
                }}
              />
              {formik.touched.slug && formik.errors.slug && (
                <p className="text-sm text-red-500">{formik.errors.slug}</p>
              )}
            </div>

            <div className="space-y-2">
              <LabelWithTooltip
                htmlFor="content"
                label="Konten"
                tooltip="Isi utama artikel"
              />
              <div className="h-[400px] relative">
                <QuillEditor
                  ref={quillRef}
                  value={formik.values.content}
                  onChange={(value) => formik.setFieldValue("content", value)}
                  className="h-full"
                />
              </div>
              {formik.touched.content && formik.errors.content && (
                <p className="text-sm text-red-500">{formik.errors.content}</p>
              )}
            </div>

            <div className="space-y-2">
              <LabelWithTooltip
                htmlFor="excerpt"
                label="Ringkasan (Otomatis)"
                tooltip="Ringkasan singkat artikel yang dibuat otomatis dari konten."
              />
              <Textarea
                id="excerpt"
                {...formik.getFieldProps("excerpt")}
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <LabelWithTooltip
                htmlFor="status"
                label="Status"
                tooltip="Status publikasi artikel"
              />
              <Select
                value={formik.values.status}
                onValueChange={(value) => formik.setFieldValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Terbit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gambar Utama</CardTitle>
          </CardHeader>
          <CardContent>
            <FeaturedImageArticle
              value={formik.values.featured_image}
              onChange={(imageData) =>
                formik.setFieldValue("featured_image", imageData)
              }
            />
            {formik.touched.featured_image?.url &&
              formik.errors.featured_image?.url && (
                <p className="text-sm text-red-500">
                  {formik.errors.featured_image.url}
                </p>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO & Meta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="meta.title"
                  label="Judul Meta"
                  tooltip="Judul untuk SEO"
                />
                <Input
                  id="meta.title"
                  {...formik.getFieldProps("meta.title")}
                />
                <CharacterCountSEO
                  current={formik.values.meta.title.length}
                  type="title"
                />
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="meta.description"
                  label="Deskripsi Meta"
                  tooltip="Deskripsi untuk SEO"
                />
                <Textarea
                  id="meta.description"
                  {...formik.getFieldProps("meta.description")}
                />
                <CharacterCountSEO
                  current={formik.values.meta.description.length}
                  type="description"
                />
              </div>

              <Input
                type="hidden"
                id="meta.og_image"
                {...formik.getFieldProps("meta.og_image")}
              />
            </div>

            <div className="border rounded-lg p-4 bg-white">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Pratinjau Hasil Pencarian Google
              </h4>
              <GoogleSearchPreview
                title={formik.values.meta.title || formik.values.title}
                description={formik.values.meta.description}
                slug={formik.values.slug}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
