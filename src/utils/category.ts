// SERVER-SIDE ONLY - do not import in client components
import { prisma } from "@/lib/db";

interface Category {
  id: string;
  name: string;
  value: string;
  label: string;
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    value: c.id, // For select component
    label: c.name, // For select component
  }));
}

// Create a new category
export async function createCategory(name: string): Promise<Category> {
  const category = await prisma.category.create({
    data: { name },
  });

  return {
    id: category.id,
    name: category.name,
    value: category.id,
    label: category.name,
  };
}

// Update a category
export async function updateCategory(
  id: string,
  name: string
): Promise<Category> {
  const category = await prisma.category.update({
    where: { id },
    data: { name },
  });

  return {
    id: category.id,
    name: category.name,
    value: category.id,
    label: category.name,
  };
}

// Delete a category
export async function deleteCategory(id: string): Promise<void> {
  await prisma.category.delete({
    where: { id },
  });
}
