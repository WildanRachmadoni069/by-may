// SERVER-SIDE ONLY - do not import in client components
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  value: string;
  label: string;
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    value: c.slug, // Changed from c.id to c.slug for URL-friendly values
    label: c.name,
  }));
}

// Get category by slug
export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
  });
}

// Create a new category
export async function createCategory(name: string): Promise<Category> {
  const category = await db.category.create({
    data: {
      name,
      slug: slugify(name),
    },
  });

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    value: category.slug,
    label: category.name,
  };
}

// Update a category
export async function updateCategory(
  id: string,
  name: string
): Promise<Category> {
  const category = await db.category.update({
    where: { id },
    data: {
      name,
      slug: slugify(name),
    },
  });

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    value: category.slug,
    label: category.name,
  };
}

// Delete a category
export async function deleteCategory(id: string): Promise<void> {
  await db.category.delete({
    where: { id },
  });
}
