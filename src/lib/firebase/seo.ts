import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const SEO_COLLECTION = "seo_settings";

export interface SeoData {
  title: string;
  description: string;
  keywords?: string;
  og_image?: string;
  updatedAt?: Date;
  createdAt?: Date;
}

// Get SEO data for a specific page
export async function getSeoData(pageId: string): Promise<SeoData | null> {
  try {
    const docRef = doc(db, SEO_COLLECTION, pageId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as SeoData;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting SEO data for ${pageId}:`, error);
    throw error;
  }
}

// Create or update SEO data for a specific page
export async function updateSeoData(
  pageId: string,
  data: Partial<SeoData>
): Promise<void> {
  try {
    const docRef = doc(db, SEO_COLLECTION, pageId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Update existing document
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date(),
      });
    } else {
      // Create new document
      await setDoc(docRef, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error(`Error updating SEO data for ${pageId}:`, error);
    throw error;
  }
}
