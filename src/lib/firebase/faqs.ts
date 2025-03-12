import { db } from "./firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  FAQ,
  FAQFormValues,
  FilteredFAQsResponse,
  GetFAQsOptions,
} from "@/types/faq";

const FAQS_COLLECTION = "faqs";

// Get all FAQs
export async function getFAQs(): Promise<FAQ[]> {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, FAQS_COLLECTION), orderBy("order", "asc"))
    );

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        question: data.question,
        answer: data.answer,
        order: data.order,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as FAQ;
    });
  } catch (error) {
    console.error("Error getting FAQs:", error);
    throw error;
  }
}

// Get filtered FAQs with pagination
export async function getFilteredFAQs(
  options: GetFAQsOptions
): Promise<FilteredFAQsResponse> {
  try {
    const { searchQuery, itemsPerPage = 10, lastDoc } = options;
    let q = query(collection(db, FAQS_COLLECTION), orderBy("order", "asc"));

    // Apply search filter if provided
    if (searchQuery) {
      // Firebase doesn't support native full-text search, so we'll search by question containing the query
      // This is a simple approach and might need to be enhanced for production
      q = query(
        collection(db, FAQS_COLLECTION),
        where("question", ">=", searchQuery),
        where("question", "<=", searchQuery + "\uf8ff"),
        orderBy("question")
      );
    }

    // Apply pagination
    if (lastDoc) {
      q = query(q, startAfter(lastDoc), limit(itemsPerPage));
    } else {
      q = query(q, limit(itemsPerPage));
    }

    const querySnapshot = await getDocs(q);
    const faqs = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        question: data.question,
        answer: data.answer,
        order: data.order,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as FAQ;
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    const hasMore = querySnapshot.docs.length === itemsPerPage;

    return {
      faqs,
      lastDoc: lastVisible,
      hasMore,
    };
  } catch (error) {
    console.error("Error getting filtered FAQs:", error);
    throw error;
  }
}

// Get a single FAQ by ID
export async function getFAQ(id: string): Promise<FAQ | null> {
  try {
    const docRef = doc(db, FAQS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        question: data.question,
        answer: data.answer,
        order: data.order,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as FAQ;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting FAQ:", error);
    throw error;
  }
}

// Create a new FAQ
export async function createFAQ(faqData: FAQFormValues): Promise<FAQ> {
  try {
    // Get the current highest order
    const querySnapshot = await getDocs(
      query(collection(db, FAQS_COLLECTION), orderBy("order", "desc"), limit(1))
    );

    let highestOrder = 0;
    if (!querySnapshot.empty) {
      highestOrder = querySnapshot.docs[0].data().order || 0;
    }

    const faqWithTimestamp = {
      ...faqData,
      order: highestOrder + 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, FAQS_COLLECTION),
      faqWithTimestamp
    );

    return {
      id: docRef.id,
      ...faqData,
      order: highestOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FAQ;
  } catch (error) {
    console.error("Error creating FAQ:", error);
    throw error;
  }
}

// Update an existing FAQ
export async function updateFAQ(
  id: string,
  faqData: Partial<FAQFormValues>
): Promise<FAQ> {
  try {
    const faqRef = doc(db, FAQS_COLLECTION, id);

    const updateData = {
      ...faqData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(faqRef, updateData);

    const updatedFAQ = await getFAQ(id);
    if (!updatedFAQ) {
      throw new Error("Failed to retrieve updated FAQ");
    }

    return updatedFAQ;
  } catch (error) {
    console.error("Error updating FAQ:", error);
    throw error;
  }
}

// Delete a FAQ
export async function deleteFAQ(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, FAQS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    throw error;
  }
}

// Reorder FAQs
export async function reorderFAQs(
  reorderedFAQs: { id: string; order: number }[]
): Promise<void> {
  try {
    // Use a batch to update all FAQs atomically
    const batch = writeBatch(db);

    reorderedFAQs.forEach((item) => {
      const faqRef = doc(db, FAQS_COLLECTION, item.id);
      batch.update(faqRef, {
        order: item.order,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error reordering FAQs:", error);
    throw error;
  }
}

// Sync JSON data with Firebase (for initial setup)
export async function syncFAQsFromJSON(
  jsonFAQs: { question: string; answer: string }[]
): Promise<void> {
  try {
    // Clear existing FAQs
    const querySnapshot = await getDocs(collection(db, FAQS_COLLECTION));
    const batch = writeBatch(db);

    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    // Add new FAQs
    for (let i = 0; i < jsonFAQs.length; i++) {
      const faq = jsonFAQs[i];
      await createFAQ({
        question: faq.question,
        answer: faq.answer,
      });
    }
  } catch (error) {
    console.error("Error syncing FAQs from JSON:", error);
    throw error;
  }
}
