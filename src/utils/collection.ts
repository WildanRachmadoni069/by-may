// SERVER-SIDE ONLY - do not import in client components
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

interface Collection {
  id: string;
  name: string;
  slug: string;
  value: string;
  label: string;
}

// Get all collections
export async function getCollections(): Promise<Collection[]> {
  const collections = await prisma.collection.findMany({
    orderBy: { name: "asc" },
  });

  return collections.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    value: c.slug, // Changed from c.id to c.slug for URL-friendly values
    label: c.name,
  }));
}

// Create a new collection
export async function createCollection(name: string): Promise<Collection> {
  const collection = await prisma.collection.create({
    data: {
      name,
      slug: slugify(name),
    },
  });

  return {
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    value: collection.slug,
    label: collection.name,
  };
}

// Update a collection
export async function updateCollection(
  id: string,
  name: string
): Promise<Collection> {
  const collection = await prisma.collection.update({
    where: { id },
    data: {
      name,
      slug: slugify(name),
    },
  });

  return {
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    value: collection.slug,
    label: collection.name,
  };
}

// Get collection by slug
export async function getCollectionBySlug(slug: string) {
  return prisma.collection.findUnique({
    where: { slug },
  });
}

// Delete a collection
export async function deleteCollection(id: string): Promise<void> {
  await prisma.collection.delete({
    where: { id },
  });
}
