import { create } from "zustand";
import {
  getPublishedArticles,
  getAllArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
} from "@/utils/article";
import type { ArticleData } from "@/types/article";

interface ArticleState {
  articles: ArticleData[];
  selectedArticle: ArticleData | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchPublishedArticles: () => Promise<ArticleData[]>;
  fetchAllArticles: () => Promise<ArticleData[]>;
  fetchArticleBySlug: (slug: string) => Promise<ArticleData | null>;
  createArticle: (
    article: Omit<ArticleData, "id" | "created_at" | "updated_at">
  ) => Promise<ArticleData>;
  updateArticle: (
    id: string,
    article: Partial<ArticleData>
  ) => Promise<ArticleData>;
  deleteArticle: (id: string) => Promise<void>;
  setSelectedArticle: (article: ArticleData | null) => void;
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  articles: [],
  selectedArticle: null,
  loading: false,
  error: null,

  fetchPublishedArticles: async () => {
    set({ loading: true });
    try {
      const articles = await getPublishedArticles();
      set({ articles, error: null });
      return articles;
    } catch (error) {
      console.error("Error fetching published articles:", error);
      set({ error: "Failed to fetch articles" });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  fetchAllArticles: async () => {
    set({ loading: true });
    try {
      const articles = await getAllArticles();
      set({ articles, error: null });
      return articles;
    } catch (error) {
      console.error("Error fetching all articles:", error);
      set({ error: "Failed to fetch articles" });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  fetchArticleBySlug: async (slug: string) => {
    set({ loading: true });
    try {
      const article = await getArticleBySlug(slug);
      if (article) {
        set({ selectedArticle: article });
      }
      return article;
    } catch (error) {
      console.error("Error fetching article by slug:", error);
      set({ error: "Failed to fetch article" });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  createArticle: async (articleData) => {
    set({ loading: true });
    try {
      const newArticle = await createArticle(articleData);
      set((state) => ({
        articles: [newArticle, ...state.articles],
        error: null,
      }));
      return newArticle;
    } catch (error) {
      console.error("Error creating article:", error);
      set({ error: "Failed to create article" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateArticle: async (id, articleData) => {
    set({ loading: true });
    try {
      const updatedArticle = await updateArticle(id, articleData);
      set((state) => ({
        articles: state.articles.map((a) => (a.id === id ? updatedArticle : a)),
        selectedArticle:
          state.selectedArticle?.id === id
            ? updatedArticle
            : state.selectedArticle,
        error: null,
      }));
      return updatedArticle;
    } catch (error) {
      console.error("Error updating article:", error);
      set({ error: "Failed to update article" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteArticle: async (id) => {
    set({ loading: true });
    try {
      await deleteArticle(id);
      set((state) => ({
        articles: state.articles.filter((a) => a.id !== id),
        selectedArticle:
          state.selectedArticle?.id === id ? null : state.selectedArticle,
        error: null,
      }));
    } catch (error) {
      console.error("Error deleting article:", error);
      set({ error: "Failed to delete article" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setSelectedArticle: (article) => {
    set({ selectedArticle: article });
  },
}));
