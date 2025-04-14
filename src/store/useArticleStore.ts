import { create } from "zustand";
import {
  Article,
  ArticleCreateInput,
  ArticleUpdateInput,
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  PaginationResult,
} from "@/lib/api/articles";

interface ArticleState {
  // Articles data
  articles: Article[];
  currentArticle: Article | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchArticles: (options?: {
    status?: "draft" | "published";
    tag?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchArticleBySlug: (slug: string) => Promise<Article | null>;
  addArticle: (data: ArticleCreateInput) => Promise<Article | null>;
  editArticle: (
    slug: string,
    data: ArticleUpdateInput
  ) => Promise<Article | null>;
  removeArticle: (slug: string) => Promise<boolean>;
  clearCurrentArticle: () => void;
  setError: (error: string | null) => void;
}

const useArticleStore = create<ArticleState>((set, get) => ({
  // Initial state
  articles: [],
  currentArticle: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  isLoading: false,
  error: null,

  // Actions
  fetchArticles: async (options = {}) => {
    set({ isLoading: true, error: null });
    try {
      const result = await getArticles(options);
      set({
        articles: result.data,
        pagination: result.pagination,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch articles";
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchArticleBySlug: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      const article = await getArticleBySlug(slug);
      set({ currentArticle: article, isLoading: false });
      return article;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch article";
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  addArticle: async (data: ArticleCreateInput) => {
    set({ isLoading: true, error: null });
    try {
      const newArticle = await createArticle(data);
      set((state) => ({
        articles: [newArticle, ...state.articles],
        isLoading: false,
      }));
      return newArticle;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create article";
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  editArticle: async (slug: string, data: ArticleUpdateInput) => {
    set({ isLoading: true, error: null });
    try {
      const updatedArticle = await updateArticle(slug, data);
      set((state) => ({
        articles: state.articles.map((article) =>
          article.slug === slug ? updatedArticle : article
        ),
        currentArticle:
          state.currentArticle?.slug === slug
            ? updatedArticle
            : state.currentArticle,
        isLoading: false,
      }));
      return updatedArticle;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update article";
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  removeArticle: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteArticle(slug);
      set((state) => ({
        articles: state.articles.filter((article) => article.slug !== slug),
        currentArticle:
          state.currentArticle?.slug === slug ? null : state.currentArticle,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete article";
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  clearCurrentArticle: () => {
    set({ currentArticle: null });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

export default useArticleStore;
