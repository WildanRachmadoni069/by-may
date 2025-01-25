import { db } from "@/lib/firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ArticleData } from "@/types/article";

export async function getArticleBySlug(
  slug: string
): Promise<ArticleData | null> {
  try {
    const articlesRef = collection(db, "articles");
    const q = query(
      articlesRef,
      where("slug", "==", slug),
      where("status", "==", "published")
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as ArticleData;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}
