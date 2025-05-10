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
import LabelWithTooltip from "@/components/general/LabelWithTooltip";
import GoogleSearchPreview from "@/components/general/GoogleSearchPreview";
import CharacterCountSEO from "@/components/seo/CharacterCountSEO";
import FeaturedImageArticle from "@/components/admin/article/FeaturedImageArticle";
import { useToast } from "@/hooks/use-toast";
import type { ArticleData, ArticleFormData } from "@/types/article";
import { useArticleStore } from "@/store/useArticleStore";

const QuillEditor = dynamic(() => import("@/components/editor/QuillEditor"), {
  ssr: false,
});

/**
 * Skema validasi untuk formulir artikel
 */
const validationSchema = Yup.object({
  title: Yup.string().required("Judul wajib diisi"),
  slug: Yup.string().required("Slug wajib diisi"),
  content: Yup.string().required("Konten wajib diisi"),
  excerpt: Yup.string().nullable(),
  featuredImage: Yup.object({
    url: Yup.string().nullable(),
    alt: Yup.string().when("url", {
      is: (val: any) => val && val.length > 0,
      then: () => Yup.string().required("Teks alt wajib diisi"),
      otherwise: () => Yup.string().nullable(),
    }),
  }).nullable(),
  status: Yup.string().oneOf(["draft", "published"]).required(),
  meta: Yup.object({
    title: Yup.string().required("Meta title wajib diisi"),
    description: Yup.string().required("Meta description wajib diisi"),
    ogImage: Yup.string().nullable(),
  }),
});

/**
 * Menghasilkan slug URL yang ramah dari judul
 * @param title Judul artikel
 * @returns Slug URL yang ramah
 */
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

/**
 * Menghasilkan kutipan dari konten artikel
 * @param content Konten HTML artikel
 * @returns Kutipan teks polos
 */
const generateExcerpt = (content: string): string => {
  const textWithSpaces = content.replace(/<\//g, " </");
  const plainText = textWithSpaces
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .replace(/\n+/g, " ")
    .trim();

  return plainText.length > 150
    ? `${plainText.substring(0, 150)}...`
    : plainText;
};

interface ArticleFormProps {
  article?: ArticleData;
}

/**
 * Mendapatkan nilai awal default untuk formulir artikel
 * @returns Nilai default formulir artikel
 */
const getDefaultInitialValues = (): ArticleFormData => ({
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  featuredImage: { url: "", alt: "" },
  status: "draft" as const,
  meta: {
    title: "",
    description: "",
    ogImage: "",
  },
});

/**
 * Memvalidasi data artikel sebelum pengiriman
 * @param data Data formulir artikel
 * @returns Hasil validasi
 */
function validateArticleData(data: ArticleFormData) {
  const errors: string[] = [];

  if (!data.title) errors.push("Judul wajib diisi");
  if (!data.content) errors.push("Konten wajib diisi");
  if (!data.status) errors.push("Status wajib diisi");

  if (data.meta && typeof data.meta !== "object")
    errors.push("Meta harus berupa objek");
  if (data.featuredImage && typeof data.featuredImage !== "object")
    errors.push("Gambar utama harus berupa objek");

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Komponen formulir artikel untuk membuat dan mengedit artikel
 */
export default function ArticleForm({ article }: ArticleFormProps) {
  const quillRef = React.useRef<Quill>(null);
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!article;

  const initialValues: ArticleFormData = React.useMemo(() => {
    if (article) {
      return {
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt || "",
        featuredImage: article.featuredImage || { url: "", alt: "" },
        status: article.status,
        meta: {
          title: article.meta?.title || "",
          description: article.meta?.description || "",
          ogImage: article.meta?.ogImage || "",
        },
      };
    }
    return getDefaultInitialValues();
  }, [article]);
  const { createArticle, updateArticle, loading } = useArticleStore();

  const formik = useFormik<ArticleFormData>({
    initialValues,
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const validation = validateArticleData(values);
        if (!validation.isValid) {
          toast({
            variant: "destructive",
            title: "Error Validasi",
            description: validation.errors.join(", "),
          });
          return;
        }

        if (isEditMode && article) {
          const updatedArticle = await updateArticle(article.slug, {
            ...values,
            status: values.status,
          });

          if (updatedArticle) {
            toast({
              title: "Artikel berhasil diperbarui",
              description: "Perubahan telah berhasil disimpan",
            });
            router.push("/dashboard/admin/artikel");
          }
        } else {
          const articleData = {
            ...values,
            status: values.status,
            author: {
              id: "admin",
              name: "Admin",
            },
          };

          const newArticle = await createArticle(articleData);

          if (newArticle) {
            toast({
              title: "Artikel berhasil dibuat",
              description: "Artikel telah berhasil disimpan ke database",
            });
            router.push("/dashboard/admin/artikel");
          }
        }
      } catch (error) {
        toast({
          title: isEditMode
            ? "Gagal memperbarui artikel"
            : "Gagal membuat artikel",
          description: "Terjadi kesalahan. Silakan coba lagi.",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false);

  // Otomatis menghasilkan slug dari judul
  React.useEffect(() => {
    if (!slugManuallyEdited && formik.values.title) {
      const slug = generateSlug(formik.values.title);
      formik.setFieldValue("slug", slug);
    }
  }, [formik.values.title, slugManuallyEdited]);

  // Otomatis menghasilkan excerpt dari konten
  React.useEffect(() => {
    if (formik.values.content) {
      const excerpt = generateExcerpt(formik.values.content);
      formik.setFieldValue("excerpt", excerpt);
    }
  }, [formik.values.content]);

  // Sinkronisasi URL gambar utama ke ogImage
  React.useEffect(() => {
    if (formik.values.featuredImage?.url) {
      formik.setFieldValue("meta.ogImage", formik.values.featuredImage.url);
    }
  }, [formik.values.featuredImage?.url]);

  // Sinkronisasi judul ke meta title
  React.useEffect(() => {
    if (
      formik.values.title &&
      (!formik.values.meta.title ||
        formik.values.meta.title === formik.initialValues.title)
    ) {
      formik.setFieldValue("meta.title", formik.values.title);
    }
  }, [formik.values.title, formik.initialValues.title]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    formik.setValues({
      ...formik.values,
      title: newTitle,
      meta: {
        ...formik.values.meta,
        title:
          formik.values.meta.title === formik.values.title
            ? newTitle
            : formik.values.meta.title,
      },
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    formik.handleChange(e);
  };

  // Akses error bertingkat dengan aman
  const getNestedError = (path: string) => {
    const parts = path.split(".");
    let error: any = formik.errors;
    for (const part of parts) {
      if (!error[part]) return undefined;
      error = error[part];
    }
    return error;
  };

  // Cek apakah field telah disentuh
  const isFieldTouched = (path: string) => {
    const parts = path.split(".");
    let touched: any = formik.touched;
    for (const part of parts) {
      if (!touched || !touched[part]) return false;
      touched = touched[part];
    }
    return true;
  };

  return (
    <div className="space-y-6">
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Artikel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <LabelWithTooltip
                htmlFor="title"
                label="Judul"
                tooltip="Judul artikel yang akan ditampilkan sebagai headline. Pastikan menarik dan informatif."
              />
              <Input
                id="title"
                onChange={handleTitleChange}
                value={formik.values.title}
                name="title"
                onBlur={formik.handleBlur}
              />
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
                name="slug"
                value={formik.values.slug}
                onChange={handleSlugChange}
                onBlur={formik.handleBlur}
                className={!slugManuallyEdited ? "bg-gray-50" : ""}
              />
              {formik.touched.slug && formik.errors.slug && (
                <p className="text-sm text-red-500">{formik.errors.slug}</p>
              )}
              {!slugManuallyEdited && (
                <p className="text-xs text-muted-foreground">
                  Slug dibuat otomatis dari judul. Klik untuk mengedit.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <LabelWithTooltip
                htmlFor="content"
                label="Konten"
                tooltip="Isi utama artikel. Gunakan editor untuk memformat teks, menambah gambar, dan mengatur layout."
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
                tooltip="Ringkasan singkat artikel yang dibuat otomatis dari konten. Digunakan di halaman daftar artikel."
              />
              <Textarea
                id="excerpt"
                disabled
                value={formik.values.excerpt ?? ""}
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <LabelWithTooltip
                htmlFor="status"
                label="Status"
                tooltip="Draft untuk menyimpan artikel tanpa dipublikasikan. Terbit untuk menampilkan artikel ke publik."
              />
              <Select
                value={formik.values.status}
                onValueChange={(value: "draft" | "published") =>
                  formik.setFieldValue("status", value)
                }
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
          <CardContent className="space-y-4">
            <FeaturedImageArticle
              value={formik.values.featuredImage}
              onChange={(imageData) =>
                formik.setFieldValue("featuredImage", imageData)
              }
            />
            {isFieldTouched("featuredImage.url") &&
              (formik.errors.featuredImage as any)?.url && (
                <p className="text-sm text-red-500">
                  {(formik.errors.featuredImage as any).url}
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
                  tooltip="Judul yang muncul di hasil pencarian Google. Idealnya tidak lebih dari 60 karakter."
                />
                <Input
                  id="meta.title"
                  name="meta.title"
                  value={formik.values.meta.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <CharacterCountSEO
                  current={formik.values.meta.title.length}
                  type="title"
                />
                {isFieldTouched("meta.title") &&
                  getNestedError("meta.title") && (
                    <p className="text-sm text-red-500">
                      {getNestedError("meta.title")}
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  htmlFor="meta.description"
                  label="Deskripsi Meta"
                  tooltip="Deskripsi singkat yang muncul di hasil pencarian Google. Idealnya tidak lebih dari 160 karakter."
                />
                <Textarea
                  id="meta.description"
                  name="meta.description"
                  value={formik.values.meta.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <CharacterCountSEO
                  current={formik.values.meta.description.length}
                  type="description"
                />
                {isFieldTouched("meta.description") &&
                  getNestedError("meta.description") && (
                    <p className="text-sm text-red-500">
                      {getNestedError("meta.description")}
                    </p>
                  )}
              </div>

              <input
                type="hidden"
                id="meta.ogImage"
                name="meta.ogImage"
                value={formik.values.meta.ogImage || ""}
              />
            </div>

            <div className="border rounded-lg p-4 bg-white space-y-2">
              <h4 className="text-sm font-medium text-gray-500">
                Pratinjau Pencarian Google
              </h4>
              <GoogleSearchPreview
                title={formik.values.meta.title || formik.values.title}
                description={formik.values.meta.description}
                slug={formik.values.slug ? `artikel/${formik.values.slug}` : ""}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" disabled={formik.isSubmitting || loading}>
            {formik.isSubmitting || loading
              ? "Menyimpan..."
              : isEditMode
              ? "Perbarui Artikel"
              : "Simpan Artikel"}
          </Button>
        </div>
      </form>
    </div>
  );
}
