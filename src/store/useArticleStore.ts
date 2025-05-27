/**
 * Store Artikel
 *
 * Store ini mengelola state UI artikel untuk digunakan di seluruh aplikasi,
 * terutama untuk filter dan pagination. Untuk fetching data,
 * gunakan hooks useArticles dan useArticle.
 */

import { create } from "zustand";
import {
  deleteArticle as deleteArticleApi,
  createArticle as createArticleApi,
  updateArticle as updateArticleApi,
} from "@/lib/api/articles";
import { ArticleData, ArticleFormData } from "@/types/article";
import { ArticlesFilters } from "@/hooks/useArticles";
import { mutate as globalMutate } from "swr";

/**
 * Interface untuk state store artikel
 */
interface ArticleState {
  // UI state only - data comes from SWR
  loading: boolean;
  error: string | null;
  filters: {
    page: number;
    limit: number;
    status: "all" | "draft" | "published";
    sort: "desc" | "asc";
    searchQuery: string;
  };

  // Actions
  setFilters: (filters: Partial<ArticleState["filters"]>) => void;
  resetFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  deleteArticle: (slug: string) => Promise<boolean>;
  createArticle: (data: ArticleFormData) => Promise<ArticleData | null>;
  updateArticle: (
    slug: string,
    data: Partial<ArticleFormData>
  ) => Promise<ArticleData | null>;

  // Helper to get the current filters in the format expected by useArticles
  getArticleFilters: () => ArticlesFilters;
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    status: "all",
    sort: "desc",
    searchQuery: "",
  },

  setLoading: (isLoading) => set({ loading: isLoading }),

  setError: (error) => set({ error }),

  setFilters: (filters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    }));
  },

  resetFilters: () => {
    set({
      filters: {
        page: 1,
        limit: 10,
        status: "all",
        sort: "desc",
        searchQuery: "",
      },
    });
  },

  getArticleFilters: () => {
    const { filters } = get();
    return {
      page: filters.page,
      limit: filters.limit,
      status: filters.status !== "all" ? filters.status : undefined,
      sort: filters.sort,
      searchQuery: filters.searchQuery || undefined,
    };
  },
  deleteArticle: async (slug: string) => {
    const { setLoading, setError } = get();

    setLoading(true);
    setError(null);

    try {
      await deleteArticleApi(slug);

      // Invalidate any articles cache that might contain this article
      globalMutate(
        (key: string) =>
          typeof key === "string" && key.startsWith("/api/articles")
      );

      return true;
    } catch (error) {
      console.error("Failed to delete article:", error);
      setError("Failed to delete article");
      return false;
    } finally {
      setLoading(false);
    }
  },
  createArticle: async (data: ArticleFormData) => {
    const { setLoading, setError } = get();

    setLoading(true);
    setError(null);

    try {
      const article = await createArticleApi(data);

      // Invalidate articles cache after creating a new article
      globalMutate(
        (key: string) =>
          typeof key === "string" && key.startsWith("/api/articles")
      );

      return article;
    } catch (error) {
      console.error("Failed to create article:", error);
      setError("Failed to create article");
      return null;
    } finally {
      setLoading(false);
    }
  },
  updateArticle: async (slug: string, data: Partial<ArticleFormData>) => {
    const { setLoading, setError } = get();

    setLoading(true);
    setError(null);

    try {
      const article = await updateArticleApi(slug, data);

      // Invalidate both the list cache and the specific article cache
      globalMutate(
        (key: string) =>
          typeof key === "string" &&
          (key.startsWith("/api/articles") ||
            key.includes(`/api/articles/${slug}`))
      );

      return article;
    } catch (error) {
      console.error("Failed to update article:", error);
      setError("Failed to update article");
      return null;
    } finally {
      setLoading(false);
    }
  },
}));
