import { create } from "zustand";
import {
  getFAQs,
  getFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getFilteredFAQs,
  reorderFAQs,
} from "@/utils/faq";
import { FAQ, FAQFormValues, GetFAQsOptions } from "@/types/faq";
import { logError } from "@/lib/debug";

interface FAQState {
  faqs: FAQ[];
  loading: boolean;
  error: string | null;
  selectedFAQ: FAQ | null;
  pagination: {
    page: number;
    total: number;
    hasMore: boolean;
  };

  fetchFAQs: () => Promise<void>;
  fetchFilteredFAQs: (options: GetFAQsOptions) => Promise<void>;
  fetchMoreFAQs: (options: GetFAQsOptions) => Promise<void>;
  fetchFAQ: (id: string) => Promise<void>;
  addFAQ: (faq: FAQFormValues) => Promise<void>;
  editFAQ: (id: string, faq: Partial<FAQFormValues>) => Promise<void>;
  removeFAQ: (id: string) => Promise<void>;
  updateFAQOrder: (
    reorderedFAQs: { id: string; order: number }[]
  ) => Promise<void>;
  setSelectedFAQ: (faq: FAQ | null) => void;
}

export const useFaqStore = create<FAQState>((set, get) => ({
  faqs: [],
  loading: false,
  error: null,
  selectedFAQ: null,
  pagination: {
    page: 1,
    total: 0,
    hasMore: false,
  },

  fetchFAQs: async () => {
    set({ loading: true });
    try {
      const faqsData = await getFAQs();
      set({ faqs: faqsData, error: null });
    } catch (error) {
      set({ error: "Failed to fetch FAQs" });
      logError("faq/fetch", error);
    } finally {
      set({ loading: false });
    }
  },
  fetchFilteredFAQs: async (options: GetFAQsOptions) => {
    set({ loading: true });
    try {
      const response = await getFilteredFAQs(options);
      set({
        faqs: response.faqs,
        pagination: response.pagination,
        error: null,
      });
    } catch (error) {
      set({ error: "Failed to fetch FAQs" });
      logError("faq/fetch-filtered", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchMoreFAQs: async (options: GetFAQsOptions) => {
    const { pagination } = get();

    if (!pagination.hasMore) return;

    set({ loading: true });
    try {
      const nextPage = pagination.page + 1;
      const response = await getFilteredFAQs({
        ...options,
        page: nextPage,
      });

      set((state) => ({
        faqs: [...state.faqs, ...response.faqs],
        pagination: response.pagination,
        error: null,
      }));
    } catch (error) {
      set({ error: "Failed to fetch more FAQs" });
      logError("faq/fetch-more", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchFAQ: async (id: string) => {
    set({ loading: true });
    try {
      const faq = await getFAQ(id);
      if (faq) {
        set({ selectedFAQ: faq });
      }
    } catch (error) {
      set({ error: "Failed to fetch FAQ" });
      logError("faq/fetch-single", error);
    } finally {
      set({ loading: false });
    }
  },

  addFAQ: async (faq: FAQFormValues) => {
    set({ loading: true });
    try {
      const newFAQ = await createFAQ(faq);
      set((state) => ({ faqs: [...state.faqs, newFAQ], error: null }));
    } catch (error) {
      set({ error: "Failed to add FAQ" });
      logError("faq/add", error);
    } finally {
      set({ loading: false });
    }
  },

  editFAQ: async (id: string, faq: Partial<FAQFormValues>) => {
    set({ loading: true });
    try {
      const updatedFAQ = await updateFAQ(id, faq);
      set((state) => ({
        faqs: state.faqs.map((f) => (f.id === id ? updatedFAQ : f)),
        error: null,
      }));
    } catch (error) {
      set({ error: "Failed to update FAQ" });
      logError("faq/update", error);
    } finally {
      set({ loading: false });
    }
  },

  removeFAQ: async (id: string) => {
    set({ loading: true });
    try {
      await deleteFAQ(id);
      set((state) => ({
        faqs: state.faqs.filter((f) => f.id !== id),
        error: null,
      }));
    } catch (error) {
      set({ error: "Failed to delete FAQ" });
      logError("faq/delete", error);
    } finally {
      set({ loading: false });
    }
  },

  updateFAQOrder: async (reorderedFAQs: { id: string; order: number }[]) => {
    set({ loading: true });
    try {
      await reorderFAQs(reorderedFAQs);

      // Update the local state with the new order
      set((state) => {
        const updatedFaqs = [...state.faqs];
        reorderedFAQs.forEach(({ id, order }) => {
          const faqIndex = updatedFaqs.findIndex((f) => f.id === id);
          if (faqIndex !== -1) {
            updatedFaqs[faqIndex] = { ...updatedFaqs[faqIndex], order };
          }
        });

        // Sort by order
        updatedFaqs.sort((a, b) => (a.order || 0) - (b.order || 0));

        return {
          faqs: updatedFaqs,
          error: null,
        };
      });
    } catch (error) {
      set({ error: "Failed to update FAQ order" });
      logError("faq/reorder", error);
    } finally {
      set({ loading: false });
    }
  },

  setSelectedFAQ: (faq) => {
    set({ selectedFAQ: faq });
  },
}));
