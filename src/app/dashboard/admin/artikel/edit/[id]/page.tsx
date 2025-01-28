import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";
import { notFound } from "next/navigation";
import EditArticleForm from "@/components/admin/article/EditArticleForm";
import type { ArticleData } from "@/types/article";

function convertTimestampToISO(timestamp: any) {
  if (!timestamp) return null;
  return new Date(timestamp.seconds * 1000).toISOString();
}

export default async function ArticleEditPage({
  params,
}: {
  params: { id: string };
}) {
  const getArticle = async () => {
    try {
      const docRef = doc(db, "articles", params.id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        notFound();
      }

      const data = docSnap.data();

      // Convert Firestore timestamps to ISO string
      const serializedData = {
        ...data,
        id: docSnap.id,
        created_at: convertTimestampToISO(data.created_at),
        updated_at: convertTimestampToISO(data.updated_at),
      };

      return serializedData as ArticleData;
    } catch (error) {
      console.error("Error fetching article:", error);
      notFound();
    }
  };

  const article = await getArticle();

  return <EditArticleForm article={article} />;
}
