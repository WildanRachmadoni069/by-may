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
// Import PostgreSQL article API functions
import { Article, createArticle, updateArticle } from "@/lib/api/articles";

const QuillEditor = dynamic(() => import("@/components/editor/QuillEditor"), {
  ssr: false,
});

// Updated validation schema with better typing
const validationSchema = Yup.object({
  title: Yup.string().required("Judul wajib diisi"),
  slug: Yup.string().required("Slug wajib diisi"),
  content: Yup.string().required("Konten wajib diisi"),
  excerpt: Yup.string().nullable(),
  featured_image: Yup.object({
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
    og_image: Yup.string().nullable(),
  }),
});

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-") // Replace multiple - with single -
    .trim(); // Trim - from start and end
};

const generateExcerpt = (content: string): string => {
  // Add space before closing HTML tags
  const textWithSpaces = content.replace(/<\//g, " </");

  // Remove HTML tags and get plain text
  const plainText = textWithSpaces
    .replace(/<[^>]+>/g, "") // Remove HTML tags
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\n+/g, " ") // Replace line breaks with space
    .trim(); // Remove leading/trailing spaces

  // Get first 150 characters and add ellipsis if needed
  return plainText.length > 150
    ? `${plainText.substring(0, 150)}...`
    : plainText;
};

interface ArticleFormProps {
  article?: ArticleData; // Optional for create, required for edit
}

// Properly typed default values
const getDefaultInitialValues = (): ArticleFormData => ({
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  featured_image: { url: "", alt: "" },
  status: "draft" as const,
  meta: {
    title: "",
    description: "",
    og_image: "",
  },
});

function validateArticleData(data: ArticleFormData) {
  // Check required fields
  const errors: string[] = [];

  if (!data.title) errors.push("Title is required");
  if (!data.content) errors.push("Content is required");
  if (!data.status) errors.push("Status is required");

  // Check data types
  if (data.meta && typeof data.meta !== "object")
    errors.push("Meta must be an object");
  if (data.featured_image && typeof data.featured_image !== "object")
    errors.push("Featured image must be an object");

  // Return validation results
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export default function ArticleForm({ article }: ArticleFormProps) {
  const quillRef = React.useRef<Quill>(null);
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!article;

  // Create properly typed initial form values
  const initialValues: ArticleFormData = React.useMemo(() => {
    if (article) {
      return {
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt || "",
        featured_image: article.featured_image || { url: "", alt: "" },
        status: article.status,
        meta: {
          title: article.meta?.title || "",
          description: article.meta?.description || "",
          og_image: article.meta?.og_image || "",
        },
      };
    }
    return getDefaultInitialValues();
  }, [article]);

  const formik = useFormik<ArticleFormData>({
    initialValues,
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Validate data
        const validation = validateArticleData(values);
        if (!validation.isValid) {
          console.error("Article data validation failed:", validation.errors);
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: validation.errors.join(", "),
          });
          return;
        }

        // Log the data being sent
        console.log("Submitting article data:", values);

        if (isEditMode && article) {
          // Update existing article using PostgreSQL API
          await updateArticle(article.slug, {
            ...values,
            status: values.status,
          });

          toast({
            title: "Artikel berhasil diperbarui",
            description: "Perubahan telah berhasil disimpan",
          });
        } else {
          // Create new article using PostgreSQL API
          const articleData = {
            ...values,
            status: values.status,
            author: {
              id: "admin", // This could be dynamic based on the authenticated user
              name: "Admin",
            },
          };

          await createArticle(articleData);

          toast({
            title: "Artikel berhasil dibuat",
            description: "Artikel telah berhasil disimpan ke database",
          });
        }

        router.push("/dashboard/admin/artikel");
      } catch (error) {
        console.error(
          isEditMode ? "Error updating article:" : "Error creating article:",
          error
        );
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

  // Auto-generate slug when title changes (only if slug hasn't been manually edited)
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false);

  React.useEffect(() => {
    if (!slugManuallyEdited && formik.values.title) {
      const slug = generateSlug(formik.values.title);
      formik.setFieldValue("slug", slug);
    }
  }, [formik.values.title, slugManuallyEdited]);

  // Auto-generate excerpt when content changes
  React.useEffect(() => {
    if (formik.values.content) {
      const excerpt = generateExcerpt(formik.values.content);
      formik.setFieldValue("excerpt", excerpt);
    }
  }, [formik.values.content]);

  // Sync featured image URL to og_image
  React.useEffect(() => {
    if (formik.values.featured_image?.url) {
      formik.setFieldValue("meta.og_image", formik.values.featured_image.url);
    }
  }, [formik.values.featured_image?.url]);

  // Sync title to meta title if meta.title is empty or same as previous title
  React.useEffect(() => {
    if (
      formik.values.title &&
      (!formik.values.meta.title ||
        formik.values.meta.title === formik.initialValues.title)
    ) {
      formik.setFieldValue("meta.title", formik.values.title);
    }
  }, [formik.values.title, formik.initialValues.title]);

  // Handle title change with automatic meta title update
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

  // Handle slug change - mark as manually edited
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    formik.handleChange(e);
  };

  // For type-safe access to nested errors
  const getNestedError = (path: string) => {
    const parts = path.split(".");
    let error: any = formik.errors;
    for (const part of parts) {
      if (!error[part]) return undefined;
      error = error[part];
    }
    return error;
  };

  // For type-safe checking if a field is touched
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
              value={formik.values.featured_image}
              onChange={(imageData) =>
                formik.setFieldValue("featured_image", imageData)
              }
            />
            {/* Handle nested form errors better */}
            {isFieldTouched("featured_image.url") &&
              (formik.errors.featured_image as any)?.url && (
                <p className="text-sm text-red-500">
                  {(formik.errors.featured_image as any).url}
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

              {/* Hidden OG Image field */}
              <input
                type="hidden"
                id="meta.og_image"
                name="meta.og_image"
                value={formik.values.meta.og_image || ""}
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

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" disabled={formik.isSubmitting}>
            {formik.isSubmitting
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
