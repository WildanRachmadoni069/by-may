import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";
import { notFound } from "next/navigation";
import ArticleForm from "@/components/admin/article/ArticleForm";
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
      const paramsId = await params.id;
      const docRef = doc(db, "articles", paramsId);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Edit Artikel</h1>
        <p className="text-muted-foreground">
          Perbarui konten dan pengaturan artikel
        </p>
      </div>

      <ArticleForm article={article} />
    </div>
  );
}
