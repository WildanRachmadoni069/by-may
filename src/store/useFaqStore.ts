import { create } from "zustand";
import {
  getFAQs,
  getFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getFilteredFAQs,
  reorderFAQs,
} from "@/lib/firebase/faqs";
import { FAQ, FAQFormValues, GetFAQsOptions } from "@/types/faq";

interface FAQState {
  faqs: FAQ[];
  loading: boolean;
  error: string | null;
  selectedFAQ: FAQ | null;
  lastDoc: any;
  hasMore: boolean;

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
  lastDoc: null,
  hasMore: true,

  fetchFAQs: async () => {
    set({ loading: true });
    try {
      const faqsData = await getFAQs();
      set({ faqs: faqsData, error: null });
    } catch (error) {
      set({ error: "Failed to fetch FAQs" });
      console.error("Error fetching FAQs:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchFilteredFAQs: async (options: GetFAQsOptions) => {
    set({ loading: true, faqs: [] }); // Reset FAQs when filters change
    try {
      const result = await getFilteredFAQs(options);
      set({
        faqs: result.faqs,
        lastDoc: result.lastDoc,
        hasMore: result.hasMore,
        error: null,
      });
    } catch (error) {
      set({ error: "Failed to fetch FAQs" });
      console.error("Error fetching filtered FAQs:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchMoreFAQs: async (options: GetFAQsOptions) => {
    const { lastDoc, loading } = get();
    if (loading || !lastDoc) return;

    set({ loading: true });
    try {
      const result = await getFilteredFAQs({
        ...options,
        lastDoc,
      });
      set((state) => ({
        faqs: [...state.faqs, ...result.faqs],
        lastDoc: result.lastDoc,
        hasMore: result.hasMore,
        error: null,
      }));
    } catch (error) {
      set({ error: "Failed to fetch more FAQs" });
      console.error("Error fetching more FAQs:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchFAQ: async (id: string) => {
    set({ loading: true });
    try {
      const faq = await getFAQ(id);
      if (faq) {
        set({ selectedFAQ: faq, error: null });
      } else {
        set({ error: "FAQ not found" });
      }
    } catch (error) {
      set({ error: "Failed to fetch FAQ" });
      console.error("Error fetching FAQ:", error);
    } finally {
      set({ loading: false });
    }
  },

  addFAQ: async (faqData: FAQFormValues) => {
    set({ loading: true });
    try {
      const newFAQ = await createFAQ(faqData);
      set((state) => ({
        faqs: [newFAQ, ...state.faqs],
        error: null,
      }));
    } catch (error) {
      set({ error: "Failed to add FAQ" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  editFAQ: async (id: string, faqData: Partial<FAQFormValues>) => {
    set({ loading: true });
    try {
      const updatedFAQ = await updateFAQ(id, faqData);
      set((state) => ({
        faqs: state.faqs.map((f) => (f.id === id ? updatedFAQ : f)),
        selectedFAQ: null,
        error: null,
      }));
    } catch (error) {
      set({ error: "Failed to update FAQ" });
      throw error;
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
      throw error;
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
      set({ error: "Failed to reorder FAQs" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setSelectedFAQ: (faq: FAQ | null) => {
    set({ selectedFAQ: faq });
  },
}));
