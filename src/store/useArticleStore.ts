import { create } from "zustand";
import {
  Article,
  PaginationResult,
  getArticles,
  deleteArticle as deleteArticleApi,
} from "@/lib/api/articles";

interface ArticleState {
  articles: Article[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    itemsPerPage: number; // Renamed from limit for consistency
    total: number;
    totalPages: number;
  };
  filters: {
    status: "all" | "draft" | "published";
    sortDirection: "asc" | "desc";
    searchQuery: string;
  };

  // Actions
  fetchArticles: (options?: {
    page?: number;
    limit?: number;
    status?: "draft" | "published";
    searchQuery?: string;
    sort?: "asc" | "desc"; // Add this parameter
  }) => Promise<void>;
  deleteArticle: (slug: string) => Promise<boolean>;
  setFilter: (key: keyof ArticleState["filters"], value: string) => void;
  resetFilters: () => void;
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  articles: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    itemsPerPage: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    status: "all",
    sortDirection: "desc",
    searchQuery: "",
  },

  fetchArticles: async (options = {}) => {
    const { filters, pagination } = get();

    set({ isLoading: true, error: null });

    try {
      // Extract options with defaults from current state
      const page = options.page ?? pagination.page;
      const limit = options.limit ?? pagination.itemsPerPage;
      const status =
        options.status ||
        (filters.status !== "all" ? filters.status : undefined);

      // Prepare search query if provided
      const searchQuery = options.searchQuery ?? filters.searchQuery;

      // Add sort parameter
      const sort = options.sort ?? filters.sortDirection;

      // Call API with server-side filtering and pagination
      const result = await getArticles({
        page,
        limit,
        status,
        search: searchQuery || undefined,
        sort: sort, // Pass sort parameter correctly
      });

      // Update state with results
      set({
        articles: result.data,
        pagination: {
          page: result.pagination.page,
          itemsPerPage: result.pagination.limit,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch articles:", error);
      set({
        error: "Failed to load articles",
        isLoading: false,
      });
    }
  },

  deleteArticle: async (slug: string) => {
    try {
      await deleteArticleApi(slug);

      // Update local state to remove the deleted article
      set((state) => ({
        articles: state.articles.filter((article) => article.slug !== slug),
        pagination: {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - 1),
          totalPages: Math.ceil(
            (state.pagination.total - 1) / state.pagination.itemsPerPage
          ),
        },
      }));

      return true;
    } catch (error) {
      console.error("Failed to delete article:", error);
      return false;
    }
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }));
  },

  resetFilters: () => {
    set({
      filters: {
        status: "all",
        sortDirection: "desc",
        searchQuery: "",
      },
      pagination: {
        ...get().pagination,
        page: 1,
      },
    });
  },
}));
