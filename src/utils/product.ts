// SERVER-SIDE ONLY - do not import in client components
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type {
  ProductFormValues,
  GetProductsOptions,
  FilteredProductsResponse,
  Product,
  ProductVariation,
  ProductSEO,
  ProductDimensions,
  VariationPrice,
} from "@/types/product";

export async function getProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        collection: true,
        variations: {
          include: {
            options: true,
          },
        },
        priceVariants: {
          include: {
            options: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return products.map(formatProductResponse);
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        collection: true,
        variations: {
          include: {
            options: true,
          },
        },
        priceVariants: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!product) return null;

    return formatProductResponse(product);
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    throw error;
  }
}

export async function getFilteredProducts(
  options: GetProductsOptions
): Promise<FilteredProductsResponse> {
  try {
    const {
      category,
      collection,
      sortBy = "newest",
      searchQuery = "",
      itemsPerPage = 10,
    } = options;

    // Build where conditions
    const where: Prisma.ProductWhereInput = {};

    if (category && category !== "all") {
      where.categoryId = category;
    }

    if (collection && collection !== "all") {
      where.collectionId = collection;
    }

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
        {
          description: {
            contains: searchQuery,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];

      // Add search by keywords if needed
      // No direct hasSome for array in Prisma, would need a workaround or raw SQL
    }

    // Build orderBy
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (sortBy === "price-asc") orderBy = { basePrice: "asc" };
    if (sortBy === "price-desc") orderBy = { basePrice: "desc" };

    // Execute query
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        collection: true,
        variations: {
          include: {
            options: true,
          },
        },
        priceVariants: {
          include: {
            options: true,
          },
        },
      },
      orderBy,
      take: itemsPerPage,
    });

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    return {
      products: products.map(formatProductResponse),
      lastDoc: null, // No longer needed with SQL
      hasMore: products.length < total,
    };
  } catch (error) {
    console.error("Error filtering products:", error);
    throw error;
  }
}

export async function addProduct(
  productData: ProductFormValues
): Promise<Product> {
  try {
    // Extract fields for proper handling
    const {
      variations = [],
      variationPrices = {},
      category,
      collection,
      seo,
      dimensions,
      searchKeywords = [],
      additionalImages = [],
      ...productFields
    } = productData;

    // Filter out null/empty values from additionalImages
    const cleanAdditionalImages =
      additionalImages.filter((img): img is string => Boolean(img)) || [];

    // Step 1: Create the product first
    const product = await prisma.product.create({
      data: {
        ...productFields,
        additionalImages: cleanAdditionalImages,
        seo: seo as unknown as Prisma.InputJsonValue,
        dimensions: dimensions as unknown as Prisma.InputJsonValue,
        searchKeywords: searchKeywords || [],
        // Connect category if provided
        ...(category && category !== "none"
          ? { category: { connect: { id: category } } }
          : {}),
        // Connect collection if provided
        ...(collection && collection !== "none"
          ? { collection: { connect: { id: collection } } }
          : {}),
      },
    });

    // Step 2: Create variations separately (if any)
    if (variations.length > 0) {
      for (const variation of variations) {
        const createdVariation = await prisma.productVariation.create({
          data: {
            name: variation.name,
            product: { connect: { id: product.id } },
          },
        });

        // Create options for this variation
        for (const option of variation.options) {
          await prisma.productVariationOption.create({
            data: {
              name: option.name,
              imageUrl: option.imageUrl || null,
              variation: { connect: { id: createdVariation.id } },
            },
          });
        }
      }
    }

    // Step 3: Create price variants (if any)
    if (Object.keys(variationPrices).length > 0) {
      for (const [combinationKey, { price, stock }] of Object.entries(
        variationPrices
      )) {
        await prisma.priceVariant.create({
          data: {
            combinationKey,
            price,
            stock,
            product: { connect: { id: product.id } },
          },
        });
      }
    }

    // Step 4: Fetch the complete product with all relations
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        collection: true,
        variations: {
          include: { options: true },
        },
        priceVariants: {
          include: { options: true },
        },
      },
    });

    if (!completeProduct) {
      throw new Error("Failed to fetch the created product");
    }

    return formatProductResponse(completeProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

export async function updateProduct(
  id: string,
  productData: ProductFormValues
): Promise<Product> {
  try {
    const {
      variations = [],
      variationPrices = {},
      category,
      collection,
      seo,
      dimensions,
      searchKeywords = [],
      additionalImages = [],
      ...productFields
    } = productData;

    // Filter out null values from additionalImages
    const cleanAdditionalImages =
      additionalImages.filter((img): img is string => Boolean(img)) || [];

    // Update the main product data
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...productFields,
        additionalImages: cleanAdditionalImages,
        seo: seo as unknown as Prisma.InputJsonValue,
        dimensions: dimensions as unknown as Prisma.InputJsonValue,
        searchKeywords,
        // Update category if provided
        ...(category
          ? { category: { connect: { id: category } } }
          : { category: { disconnect: true } }),
        // Update collection if provided
        ...(collection && collection !== "none"
          ? { collection: { connect: { id: collection } } }
          : { collection: { disconnect: true } }),
      },
      include: {
        category: true,
        collection: true,
        variations: {
          include: { options: true },
        },
        priceVariants: {
          include: { options: true },
        },
      },
    });

    // Note: Handling variations and price variants during update is complex
    // In a real app, you would need to handle:
    // 1. Deleting removed variations/options/price variants
    // 2. Updating existing ones
    // 3. Adding new ones
    // This requires careful comparison and transaction management

    return formatProductResponse(updatedProduct);
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
}

// Helper function to format product response
function formatProductResponse(dbProduct: any): Product {
  const {
    id,
    name,
    slug,
    description,
    mainImage,
    additionalImages,
    basePrice,
    baseStock,
    hasVariations,
    specialLabel,
    weight,
    dimensions,
    seo,
    searchKeywords,
    category,
    collection,
    variations,
    priceVariants,
    createdAt,
    updatedAt,
  } = dbProduct;

  // Format variations
  const formattedVariations: ProductVariation[] =
    variations?.map((v: any) => ({
      id: v.id,
      name: v.name,
      options:
        v.options?.map((o: any) => ({
          id: o.id,
          name: o.name,
          imageUrl: o.imageUrl || undefined,
        })) || [],
    })) || [];

  // Format variation prices
  const formattedVariationPrices: Record<string, VariationPrice> = {};
  if (priceVariants) {
    priceVariants.forEach((pv: any) => {
      formattedVariationPrices[pv.combinationKey] = {
        price: pv.price,
        stock: pv.stock,
      };
    });
  }

  return {
    id,
    name,
    slug,
    description: description || "",
    mainImage: mainImage || null,
    additionalImages: additionalImages || [],
    basePrice: basePrice || undefined,
    baseStock: baseStock || undefined,
    hasVariations: hasVariations || false,
    specialLabel: specialLabel || "",
    weight: weight || 0,
    dimensions: dimensions
      ? (dimensions as ProductDimensions)
      : {
          width: 0,
          length: 0,
          height: 0,
        },
    seo: seo
      ? (seo as ProductSEO)
      : {
          title: name,
          description: description || "",
          keywords: [],
        },
    searchKeywords: searchKeywords || [],
    category: category?.id || "",
    collection: collection?.id || undefined,
    variations: formattedVariations,
    variationPrices: formattedVariationPrices,
    createdAt,
    updatedAt,
  };
}
