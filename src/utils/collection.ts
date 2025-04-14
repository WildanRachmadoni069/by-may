import { prisma } from "@/lib/prisma";

interface Collection {
  id: string;
  name: string;
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
    value: c.id, // For select component
    label: c.name, // For select component
  }));
}

// Create a new collection
export async function createCollection(name: string): Promise<Collection> {
  const collection = await prisma.collection.create({
    data: { name },
  });

  return {
    id: collection.id,
    name: collection.name,
    value: collection.id,
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
    data: { name },
  });

  return {
    id: collection.id,
    name: collection.name,
    value: collection.id,
    label: collection.name,
  };
}

// Delete a collection
export async function deleteCollection(id: string): Promise<void> {
  await prisma.collection.delete({
    where: { id },
  });
}
