"use client";
import React from "react";
import ArticleForm from "@/components/admin/article/ArticleForm";

export default function ArticleCreatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tambah Artikel Baru</h1>
        <p className="text-muted-foreground">
          Buat artikel baru untuk website Anda
        </p>
      </div>

      <ArticleForm />
    </div>
  );
}
