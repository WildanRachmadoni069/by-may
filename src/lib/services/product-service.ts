/**
 * Layanan Produk (Product Service)
 *
 * Layanan ini bertanggung jawab untuk menangani semua operasi terkait produk
 * termasuk operasi CRUD, pengambilan data dengan paginasi dan filter,
 * serta pengelolaan gambar produk.
 */

import { db } from "@/lib/db";
import { Prisma, Product as PrismaProduct } from "@prisma/client";
import { CloudinaryService } from "./cloudinary-service";
import {
  CreateProductInput,
  Product,
  PriceVariantItem,
  Image,
  Dimensions,
  Meta,
} from "@/types/product";
import { PaginatedResult } from "@/types/common";
import { generateSearchKeywords, slugify } from "@/lib/utils";

/**
 * Helper type for Prisma JSON fields to ensure compatibility
 * This allows for any string key with any value
 */
type PrismaJsonObject = { [key: string]: any };

export const ProductService = {
  /**
   * Convert typed objects to Prisma-compatible JSON objects
   * @param obj - The typed object to convert
   * @returns A Prisma-compatible JSON object
   */
  _toPrismaJson<T>(
    obj: T | null | undefined
  ): PrismaJsonObject | typeof Prisma.JsonNull | undefined {
    if (obj === null) {
      return Prisma.JsonNull;
    }

    if (obj === undefined) {
      return undefined;
    }

    // Convert the typed object to a plain object that Prisma can handle
    return JSON.parse(JSON.stringify(obj)) as PrismaJsonObject;
  },

  /**
   * Helper to convert an array of typed objects to Prisma JSON array
   * @param array - Array of typed objects
   * @returns Prisma-compatible JSON array
   */
  _toPrismaJsonArray<T>(
    array: T[] | null | undefined
  ): PrismaJsonObject[] | undefined {
    if (!array || array.length === 0) {
      return [];
    }

    return array.map((item) => this._toPrismaJson(item)) as PrismaJsonObject[];
  },

  /**
   * Mengambil produk berdasarkan slug
   * @param slug - Slug produk
   * @returns Produk yang ditemukan atau null jika tidak ada
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const product = await db.product.findUnique({
        where: { slug },
        include: {
          variations: {
            include: {
              options: true,
            },
          },
          priceVariants: {
            include: {
              options: {
                include: {
                  option: true,
                },
              },
            },
          },
          category: true,
          collection: true,
        },
      });

      if (!product) return null;

      // Log the found product's price variants and their options for debugging
      if (product.priceVariants.length > 0) {
        console.log(
          `Found product ${product.name} with ${product.priceVariants.length} price variants`
        );

        for (const variant of product.priceVariants) {
          console.log(
            `Price variant ${variant.id}: price=${variant.price}, stock=${variant.stock}, with ${variant.options.length} options`
          );

          // Log each connected option
          variant.options.forEach((connection) => {
            console.log(
              `- Connected to option: ${connection.option.name} (ID: ${connection.option.id})`
            );
          });
        }
      } else {
        console.log(`Product ${product.name} has no price variants`);
      }

      return product as unknown as Product | null;
    } catch (error) {
      console.error(`Error fetching product by slug ${slug}:`, error);
      throw error;
    }
  },

  /**
   * Mengambil daftar produk dengan paginasi dan filter
   * @param options - Opsi filter dan paginasi
   * @returns Produk terpaginasi dan metadata
   */
  async getProducts(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      categoryId?: string;
      collectionId?: string;
      specialLabel?: string;
      sortBy?: string;
    } = {}
  ): Promise<PaginatedResult<Product>> {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      collectionId,
      specialLabel,
      sortBy = "newest",
    } = options;

    const skip = (page - 1) * limit;

    // Build query filters
    const where: any = {};

    // Add search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Add category filter
    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    // Add collection filter
    if (collectionId && collectionId !== "all") {
      where.collectionId = collectionId;
    }

    // Add special label filter
    if (specialLabel && specialLabel !== "all") {
      where.specialLabel = specialLabel;
    }

    // Determine sorting
    const orderBy: any = {};
    switch (sortBy) {
      case "newest":
        orderBy.createdAt = "desc";
        break;
      case "oldest":
        orderBy.createdAt = "asc";
        break;
      case "price-low":
        orderBy.basePrice = "asc";
        break;
      case "price-high":
        orderBy.basePrice = "desc";
        break;
      case "name-asc":
        orderBy.name = "asc";
        break;
      case "name-desc":
        orderBy.name = "desc";
        break;
      default:
        orderBy.createdAt = "desc";
    }

    // Get products with pagination and filtering
    const products = await db.product.findMany({
      where,
      include: {
        category: true,
        collection: true,
      },
      take: limit,
      skip,
      orderBy,
    });

    // Get total count for pagination
    const total = await db.product.count({ where });

    return {
      data: products as unknown as Product[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Helper untuk memproses field JSON dengan nilai null
   * @param value - Nilai yang mungkin null
   * @returns Nilai yang diformat untuk Prisma JSON
   */
  _processJsonField<T>(
    value: T | null | undefined
  ): T | typeof Prisma.JsonNull | undefined {
    if (value === null) {
      return Prisma.JsonNull;
    }
    return value;
  },

  /**
   * Membuat produk baru
   * @param data - Data produk
   * @returns Produk yang dibuat
   */
  async createProduct(data: CreateProductInput): Promise<Product> {
    // Generate slug if not provided
    const slug = data.slug || slugify(data.name);

    // Check if slug already exists
    const existingProduct = await db.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      throw new Error(`Produk dengan slug '${slug}' sudah ada`);
    }

    // Process JSON fields using the converter functions
    const featuredImage = this._toPrismaJson(data.featuredImage);
    const additionalImages = this._toPrismaJsonArray(
      data.additionalImages || []
    );
    const dimensions = this._toPrismaJson(data.dimensions);
    const meta = this._toPrismaJson(data.meta);

    // For products with variations, ensure basePrice and baseStock are set to null
    // This fixes the inconsistency when creating products with variations
    let basePrice = data.basePrice;
    let baseStock = data.baseStock;

    if (data.hasVariations) {
      basePrice = null;
      baseStock = null;
    }

    try {
      // Create the product
      const product = await db.product.create({
        data: {
          name: data.name,
          slug: slug,
          description: data.description || null,
          featuredImage,
          additionalImages,
          basePrice,
          baseStock,
          hasVariations: data.hasVariations,
          specialLabel: data.specialLabel || null,
          weight: data.weight || null,
          dimensions,
          meta,
          categoryId: data.categoryId || null,
          collectionId: data.collectionId || null,
        },
      });

      console.log(
        `Created product with ID: ${product.id}, slug: ${product.slug}`
      );

      // Create variations if they exist
      if (data.hasVariations && data.variations && data.variations.length > 0) {
        const variationOptionsMap = new Map<string, string>(); // Map to store temp ID -> actual DB ID

        // Process each variation
        for (const variation of data.variations) {
          console.log(`Creating variation: ${variation.name}`);

          const createdVariation = await db.productVariation.create({
            data: {
              productId: product.id,
              name: variation.name,
            },
          });

          // Create options for this variation
          if (variation.options && variation.options.length > 0) {
            for (const option of variation.options) {
              const createdOption = await db.productVariationOption.create({
                data: {
                  variationId: createdVariation.id,
                  name: option.name,
                  imageUrl: option.imageUrl,
                },
              });

              // Store both the optionId directly and with temp prefixes
              // This ensures we catch all possible formats from frontend
              if (option.id) {
                variationOptionsMap.set(option.id, createdOption.id);
              }

              // Also store with temp prefix for cases where it comes from the store
              variationOptionsMap.set(
                `temp-${variation.name}-${option.name}`,
                createdOption.id
              );

              // And store direct mapping
              variationOptionsMap.set(
                `${variation.name}-${option.name}`,
                createdOption.id
              );
            }
          }
        }

        // Create price variants if they exist
        if (data.priceVariants && data.priceVariants.length > 0) {
          for (const priceVariant of data.priceVariants) {
            // Skip if missing required data
            if (
              priceVariant.price === null ||
              priceVariant.stock === null ||
              !priceVariant.optionCombination ||
              priceVariant.optionCombination.length === 0
            ) {
              continue;
            }

            // Create the price variant
            const createdPriceVariant = await db.priceVariant.create({
              data: {
                productId: product.id,
                price: priceVariant.price || 0,
                stock: priceVariant.stock || 0,
                sku: priceVariant.sku,
              },
            });

            // This array will collect options that need linking
            const optionsToLink: string[] = [];

            // Try to map each option to its real ID
            for (let i = 0; i < priceVariant.optionCombination.length; i++) {
              const optionKey = priceVariant.optionCombination[i];
              let realOptionId = variationOptionsMap.get(optionKey);

              // If we can't find it directly, try other formats
              if (
                !realOptionId &&
                priceVariant.optionLabels &&
                priceVariant.optionLabels[i]
              ) {
                // Format: "Variation: Option"
                const label = priceVariant.optionLabels[i];
                const parts = label.split(":").map((p) => p.trim());

                if (parts.length === 2) {
                  const variationName = parts[0];
                  const optionName = parts[1];

                  // Try to find by combined key
                  realOptionId = variationOptionsMap.get(
                    `${variationName}-${optionName}`
                  );

                  // Or by templatized key
                  if (!realOptionId) {
                    realOptionId = variationOptionsMap.get(
                      `temp-${variationName}-${optionName}`
                    );
                  }
                }
              }

              // If we found a valid ID, add it to our list
              if (realOptionId) {
                optionsToLink.push(realOptionId);
              }
            }

            // Now create connections for all options that were successfully mapped
            for (const realOptionId of optionsToLink) {
              try {
                await db.priceVariantToOption.create({
                  data: {
                    priceVariantId: createdPriceVariant.id,
                    optionId: realOptionId,
                  },
                });
              } catch (error) {
                console.error(
                  `Failed to link option ${realOptionId} to price variant:`,
                  error
                );
              }
            }
          }
        }
      }

      // Return the created product with relationships
      return this.getProductBySlug(slug) as Promise<Product>;
    } catch (error) {
      console.error("Error in createProduct:", error);
      throw error;
    }
  },

  /**
   * Memperbarui produk yang sudah ada
   * @param slug - Slug produk
   * @param data - Data produk yang diperbarui
   * @returns Produk yang diperbarui
   */
  async updateProduct(
    slug: string,
    data: Partial<CreateProductInput>
  ): Promise<Product> {
    const product = await this.getProductBySlug(slug);

    if (!product) {
      throw new Error(`Produk dengan slug '${slug}' tidak ditemukan`);
    }

    // Process JSON fields for Prisma using the new converter functions
    let updateData: any = { ...data };

    // Handle any JSON fields
    if ("featuredImage" in data) {
      updateData.featuredImage = this._toPrismaJson(data.featuredImage);
    }

    if ("additionalImages" in data && data.additionalImages) {
      updateData.additionalImages = this._toPrismaJsonArray(
        data.additionalImages
      );
    }

    if ("dimensions" in data) {
      updateData.dimensions = this._toPrismaJson(data.dimensions);
    }

    if ("meta" in data) {
      updateData.meta = this._toPrismaJson(data.meta);
    }

    // Handle featured image changes - cleanup old image if changed
    if (
      data.featuredImage &&
      product.featuredImage &&
      product.featuredImage.url !== data.featuredImage.url
    ) {
      try {
        if (product.featuredImage.url) {
          await CloudinaryService.deleteImageByUrl(product.featuredImage.url);
        }
      } catch (error) {
        // Log but continue with update
        console.error("Failed to delete old featured image:", error);
      }
    }

    // Handle additional images changes
    if (data.additionalImages) {
      try {
        // Find images that are in the old set but not in the new set
        const oldUrls = (product.additionalImages || [])
          .map((img) => img?.url)
          .filter(Boolean);
        const newUrls = (data.additionalImages || [])
          .map((img) => img?.url)
          .filter(Boolean);

        // Determine images to delete
        const urlsToDelete = oldUrls.filter((url) => !newUrls.includes(url));

        // Delete removed images
        for (const url of urlsToDelete) {
          await CloudinaryService.deleteImageByUrl(url);
        }
      } catch (error) {
        // Log but continue with update
        console.error("Error cleaning up additional images:", error);
      }
    }

    // If slug is changing, check for uniqueness
    if (data.slug && data.slug !== slug) {
      const existingWithSlug = await db.product.findUnique({
        where: { slug: data.slug },
      });

      if (existingWithSlug && existingWithSlug.id !== product.id) {
        throw new Error(`Slug '${data.slug}' sudah digunakan oleh produk lain`);
      }
    }

    // Update the base product
    const updatedProduct = await db.product.update({
      where: { id: product.id },
      data: updateData,
    });

    // Handle variation updates
    if (data.hasVariations && data.variations) {
      // Complex variation updates would go here
      // This would involve comparing old vs new variations and updating accordingly
    }

    return this.getProductBySlug(updatedProduct.slug) as Promise<Product>;
  },

  /**
   * Menghapus produk dan gambar terkait
   * @param slug - Slug produk
   */
  async deleteProduct(
    slug: string
  ): Promise<{ success: boolean; message?: string }> {
    const product = await this.getProductBySlug(slug);

    if (!product) {
      throw new Error(`Produk dengan slug '${slug}' tidak ditemukan`);
    }

    try {
      // Delete the product from database first
      await db.product.delete({
        where: { id: product.id },
      });

      // Clean up images
      try {
        // Delete featured image
        if (product.featuredImage?.url) {
          await CloudinaryService.deleteImageByUrl(product.featuredImage.url);
        }

        // Delete additional images
        if (
          product.additionalImages &&
          Array.isArray(product.additionalImages)
        ) {
          for (const image of product.additionalImages) {
            if (image?.url) {
              await CloudinaryService.deleteImageByUrl(image.url);
            }
          }
        }
      } catch (error) {
        // Log but continue (product is already deleted from DB)
        console.error("Error cleaning up product images:", error);
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting product:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unknown error deleting product",
      };
    }
  },
};
