"use server";

import { revalidatePath } from "next/cache";

const staticPages = ["/", "/tentang-kami", "/faq"];

export async function revalidatePagePath(path: string) {
  revalidatePath(path);

  if (staticPages.includes(path)) {
    staticPages.forEach((page) => {
      revalidatePath(page);
    });
  }
}
