/**
 * Layanan Produk (Product Service)
 *
 * Layanan ini bertanggung jawab untuk menangani semua operasi terkait produk
 * termasuk operasi CRUD, pengambilan data dengan paginasi dan filter,
 * serta pengelolaan variasi dan gambar produk.
 */

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { CloudinaryService } from "./cloudinary-service";
import {
  Product,
  ProductCreateInput,
  ProductFormValues,
  ProductUpdateInput,
  ProductsFilter,
  ProductsResponse,
} from "@/types/product";
import { PaginatedResult } from "@/types/common";

export const ProductService = {
  /**
   * Mengambil produk berdasarkan slug
   * @param slug - Slug produk
   * @returns Produk yang ditemukan atau null jika tidak ada
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    const product = await db.product.findUnique({
      where: { slug },
      include: {
        variations: {
          include: {
            options: true,
          },
        },
        priceVariants: true,
      },
    });

    if (!product) return null;

    return this._formatProductResponse(product);
  },

  /**
   * Mengambil produk berdasarkan ID
   * @param id - ID produk
   * @returns Produk yang ditemukan atau null jika tidak ada
   */
  async getProductById(id: string): Promise<Product | null> {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        variations: {
          include: {
            options: true,
          },
        },
        priceVariants: true,
      },
    });

    if (!product) return null;

    return this._formatProductResponse(product);
  },

  /**
   * Mengambil daftar produk dengan paginasi dan filter
   * @param options - Opsi filter dan paginasi
   * @returns Produk terpaginasi dan metadata
   */
  async getProducts(
    options: ProductsFilter = {}
  ): Promise<PaginatedResult<Product>> {
    const {
      category = "all",
      collection = "all",
      sortBy = "newest",
      searchQuery = "",
      page = 1,
      limit = 10,
    } = options;

    // Build where clause based on filters
    const whereClause: any = {};

    // Category filter
    if (category !== "all") {
      whereClause.categoryId = category;
    }

    // Collection filter
    if (collection === "none") {
      whereClause.collectionId = null;
    } else if (collection !== "all") {
      whereClause.collectionId = collection;
    }

    // Search filter
    if (searchQuery) {
      whereClause.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    // Determine sorting
    let orderBy: any = {};
    if (sortBy === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sortBy === "price-asc") {
      orderBy = { basePrice: "asc" };
    } else if (sortBy === "price-desc") {
      orderBy = { basePrice: "desc" };
    }

    // Count total products matching filter
    const total = await db.product.count({ where: whereClause });

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Fetch products
    const products = await db.product.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit,
      include: {
        variations: {
          include: {
            options: true,
          },
        },
        priceVariants: true,
      },
    });

    // Format products to match expected client structure
    const formattedProducts = products.map(this._formatProductResponse);

    return {
      data: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  /**
   * Mengambil produk berdasarkan label khusus (featured, new, dll)
   * @param label - Label produk (featured, new, dll)
   * @param limit - Batas jumlah produk yang diambil
   * @returns Daftar produk sesuai label
   */
  async getProductsByLabel(
    label: string,
    limit: number = 8
  ): Promise<Product[]> {
    try {
      const products = await db.product.findMany({
        where: {
          specialLabel: label,
        },
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          variations: {
            include: {
              options: true,
            },
          },
          priceVariants: true,
        },
      });

      return products.map(this._formatProductResponse);
    } catch (error) {
      console.error(`Error fetching products by label ${label}:`, error);
      return [];
    }
  },

  /**
   * Mengambil produk terkait berdasarkan kategori/koleksi
   * @param options - Opsi untuk mencari produk terkait
   */
  async getRelatedProducts(options: {
    productId: string;
    categoryId?: string;
    collectionId?: string;
    limit?: number;
  }): Promise<Product[]> {
    const { productId, categoryId, collectionId, limit = 4 } = options;

    // Build where clause for related products
    const whereClause: any = {
      id: { not: productId }, // Exclude current product
    };

    // If we have both category and collection, use OR condition
    if (categoryId && collectionId) {
      whereClause.OR = [{ categoryId }, { collectionId }];
    } else if (categoryId) {
      whereClause.categoryId = categoryId;
    } else if (collectionId) {
      whereClause.collectionId = collectionId;
    }

    try {
      const products = await db.product.findMany({
        where: whereClause,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          variations: {
            include: {
              options: true,
            },
          },
          priceVariants: true,
        },
      });

      return products.map(this._formatProductResponse);
    } catch (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
  },

  /**
   * Helper untuk memproses field JSON
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
  async createProduct(data: ProductCreateInput): Promise<Product> {
    try {
      // Prepare data for database
      const preparedData = this._prepareProductData(data);

      // Create base product
      const product = await db.product.create({
        data: {
          name: preparedData.name || "Untitled Product",
          slug: preparedData.slug || `untitled-${Date.now()}`,
          description: preparedData.description || "",
          featuredImage: preparedData.featuredImage,
          additionalImages: preparedData.additionalImages,
          basePrice: preparedData.basePrice,
          baseStock: preparedData.baseStock,
          hasVariations: preparedData.hasVariations,
          specialLabel: preparedData.specialLabel,
          weight: preparedData.weight,
          dimensions: preparedData.dimensions,
          meta: preparedData.meta,
          categoryId: preparedData.category || null,
          collectionId:
            preparedData.collection === "none"
              ? null
              : preparedData.collection || null,
        },
      });

      // Create variations and options if the product has variations
      if (
        preparedData.hasVariations &&
        (preparedData.variations?.length ?? 0) > 0
      ) {
        for (const variation of preparedData.variations ?? []) {
          const createdVariation = await db.productVariation.create({
            data: {
              name: variation.name,
              productId: product.id,
              options: {
                create: variation.options.map(
                  (option: { name: string; imageUrl?: string | null }) => ({
                    name: option.name,
                    imageUrl: option.imageUrl || null,
                  })
                ),
              },
            },
          });
        }

        // Create price variants
        if (Object.keys(preparedData.variationPrices || {}).length > 0) {
          for (const [combinationKey, { price, stock }] of Object.entries(
            preparedData.variationPrices || {}
          )) {
            await db.priceVariant.create({
              data: {
                productId: product.id,
                price,
                stock,
                combinationKey,
              },
            });
          }
        }
      }

      // Retrieve the complete product with relationships
      const createdProduct = await db.product.findUnique({
        where: { id: product.id },
        include: {
          variations: {
            include: {
              options: true,
            },
          },
          priceVariants: true,
        },
      });

      if (!createdProduct) {
        throw new Error("Failed to retrieve created product");
      }

      return this._formatProductResponse(createdProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  /**
   * Memperbarui produk yang sudah ada
   * @param id - ID produk yang akan diperbarui
   * @param data - Data produk yang diperbarui
   * @returns Produk yang telah diperbarui
   */
  async updateProduct(id: string, data: ProductUpdateInput): Promise<Product> {
    try {
      // Get existing product to compare images for deletion
      const existingProduct = await db.product.findUnique({
        where: { id },
        include: {
          variations: {
            include: {
              options: true,
            },
          },
          priceVariants: true,
        },
      });

      if (!existingProduct) {
        throw new Error("Product not found");
      }

      // Prepare data for database update
      const preparedData = this._prepareProductData(data);

      // Update the base product
      const product = await db.product.update({
        where: { id },
        data: {
          name: preparedData.name || "Untitled Product",
          slug: preparedData.slug || `untitled-${Date.now()}`,
          description: preparedData.description || "",
          featuredImage: preparedData.featuredImage,
          additionalImages: preparedData.additionalImages,
          basePrice: preparedData.basePrice,
          baseStock: preparedData.baseStock,
          hasVariations: preparedData.hasVariations,
          specialLabel: preparedData.specialLabel,
          weight: preparedData.weight,
          dimensions: preparedData.dimensions,
          meta: preparedData.meta,
          categoryId: preparedData.category || null,
          collectionId:
            preparedData.collection === "none"
              ? null
              : preparedData.collection || null,
        },
      });

      // Delete existing variations, options and price variants to replace with new ones
      await db.productVariation.deleteMany({
        where: { productId: id },
      });

      await db.priceVariant.deleteMany({
        where: { productId: id },
      });

      // Create new variations and options if the product has variations
      if (
        preparedData.hasVariations &&
        (preparedData.variations?.length ?? 0) > 0
      ) {
        for (const variation of preparedData.variations ?? []) {
          const createdVariation = await db.productVariation.create({
            data: {
              name: variation.name,
              productId: product.id,
              options: {
                create: variation.options.map(
                  (option: { name: string; imageUrl?: string | null }) => ({
                    name: option.name,
                    imageUrl: option.imageUrl || null,
                  })
                ),
              },
            },
          });
        }

        // Create new price variants
        if (Object.keys(preparedData.variationPrices || {}).length > 0) {
          for (const [combinationKey, { price, stock }] of Object.entries(
            preparedData.variationPrices || {}
          )) {
            await db.priceVariant.create({
              data: {
                productId: product.id,
                price,
                stock,
                combinationKey,
              },
            });
          }
        }
      }

      // Retrieve the complete updated product with relationships
      const updatedProduct = await db.product.findUnique({
        where: { id: product.id },
        include: {
          variations: {
            include: {
              options: true,
            },
          },
          priceVariants: true,
        },
      });

      if (!updatedProduct) {
        throw new Error("Failed to retrieve updated product");
      }

      // Clean up old images that are no longer used
      this._cleanupUnusedImages(existingProduct, updatedProduct);

      return this._formatProductResponse(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  /**
   * Memperbarui produk yang sudah ada berdasarkan slug
   * @param slug - Slug produk yang akan diperbarui
   * @param data - Data produk yang diperbarui
   * @returns Produk yang telah diperbarui
   */
  async updateProductBySlug(
    slug: string,
    data: ProductUpdateInput
  ): Promise<Product> {
    try {
      // Get existing product by slug
      const existingProduct = await db.product.findUnique({
        where: { slug },
        include: {
          variations: {
            include: {
              options: true,
            },
          },
          priceVariants: true,
        },
      });

      if (!existingProduct) {
        throw new Error("Product not found");
      }

      // Prepare data for database update
      const preparedData = this._prepareProductData(data);

      // Update the base product
      const product = await db.product.update({
        where: { slug },
        data: {
          name: preparedData.name || "Untitled Product",
          slug: preparedData.slug || `untitled-${Date.now()}`,
          description: preparedData.description || "",
          featuredImage: preparedData.featuredImage,
          additionalImages: preparedData.additionalImages,
          basePrice: preparedData.basePrice,
          baseStock: preparedData.baseStock,
          hasVariations: preparedData.hasVariations,
          specialLabel: preparedData.specialLabel,
          weight: preparedData.weight,
          dimensions: preparedData.dimensions,
          meta: preparedData.meta,
          categoryId: preparedData.category || null,
          collectionId:
            preparedData.collection === "none"
              ? null
              : preparedData.collection || null,
        },
      });

      // Delete existing variations, options and price variants to replace with new ones
      await db.productVariation.deleteMany({
        where: { productId: product.id },
      });

      await db.priceVariant.deleteMany({
        where: { productId: product.id },
      });

      // Create new variations and options if the product has variations
      if (
        preparedData.hasVariations &&
        (preparedData.variations?.length ?? 0) > 0
      ) {
        for (const variation of preparedData.variations ?? []) {
          const createdVariation = await db.productVariation.create({
            data: {
              name: variation.name,
              productId: product.id,
              options: {
                create: variation.options.map(
                  (option: { name: string; imageUrl?: string | null }) => ({
                    name: option.name,
                    imageUrl: option.imageUrl || null,
                  })
                ),
              },
            },
          });
        }

        // Create new price variants
        if (Object.keys(preparedData.variationPrices || {}).length > 0) {
          for (const [combinationKey, { price, stock }] of Object.entries(
            preparedData.variationPrices || {}
          )) {
            await db.priceVariant.create({
              data: {
                productId: product.id,
                price,
                stock,
                combinationKey,
              },
            });
          }
        }
      }

      // Retrieve the complete updated product with relationships
      const updatedProduct = await db.product.findUnique({
        where: { id: product.id },
        include: {
          variations: {
            include: {
              options: true,
            },
          },
          priceVariants: true,
        },
      });

      if (!updatedProduct) {
        throw new Error("Failed to retrieve updated product");
      }

      // Clean up old images that are no longer used
      this._cleanupUnusedImages(existingProduct, updatedProduct);

      return this._formatProductResponse(updatedProduct);
    } catch (error) {
      console.error("Error updating product by slug:", error);
      throw error;
    }
  },

  /**
   * Menghapus produk dan gambar terkait
   * @param id - ID produk yang akan dihapus
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      // Get product details to delete associated images
      const product = await db.product.findUnique({
        where: { id },
        include: {
          variations: {
            include: {
              options: true,
            },
          },
        },
      });

      if (!product) {
        throw new Error("Produk tidak ditemukan");
      }

      // Delete from database
      await db.product.delete({
        where: { id },
      });

      // Delete images
      await this._deleteProductImages(product);

      return true;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Menghapus produk dan gambar terkait berdasarkan slug
   * @param slug - Slug produk yang akan dihapus
   */
  async deleteProductBySlug(slug: string): Promise<boolean> {
    try {
      // Get product details to delete associated images
      const product = await db.product.findUnique({
        where: { slug },
        include: {
          variations: {
            include: {
              options: true,
            },
          },
        },
      });

      if (!product) {
        throw new Error("Produk tidak ditemukan");
      }

      // Collect all image URLs that need to be deleted
      const imagesToDelete: string[] = [];

      // Add featured image
      if (product.featuredImage) {
        try {
          const featuredImage = product.featuredImage as any;
          if (featuredImage && featuredImage.url) {
            imagesToDelete.push(featuredImage.url);
          }
        } catch (err) {
          // Ignore extraction errors
        }
      }

      // Add additional images
      if (product.additionalImages && Array.isArray(product.additionalImages)) {
        try {
          product.additionalImages.forEach((img: any) => {
            if (img && img.url) imagesToDelete.push(img.url);
          });
        } catch (err) {
          // Ignore extraction errors
        }
      }

      // Add variation images
      if (product.variations && Array.isArray(product.variations)) {
        try {
          product.variations.forEach((variation: any) => {
            if (variation.options && Array.isArray(variation.options)) {
              variation.options.forEach((option: any) => {
                if (option.imageUrl) imagesToDelete.push(option.imageUrl);
              });
            }
          });
        } catch (err) {
          // Ignore extraction errors
        }
      }

      // First, delete the product from the database to ensure data consistency
      try {
        await db.product.delete({
          where: { slug },
        });
      } catch (dbError) {
        throw new Error(
          `Gagal menghapus produk dari database: ${
            dbError instanceof Error ? dbError.message : String(dbError)
          }`
        );
      }

      // Now attempt to delete images using the API endpoint
      if (imagesToDelete.length > 0) {
        try {
          // Delete images in sequence with small delay to avoid rate limits
          for (const imageUrl of imagesToDelete) {
            try {
              // Use the CloudinaryService helper to delete via API
              await CloudinaryService.deleteImageByUrl(imageUrl);

              // Small delay to avoid overwhelming API
              await new Promise((resolve) => setTimeout(resolve, 100));
            } catch (imgError) {
              // Continue with other images even if one fails
              console.error("Failed to delete image:", imgError);
            }
          }
        } catch (cloudinaryError) {
          // Don't fail the overall operation if image deletion fails
          console.error("Error during image cleanup:", cloudinaryError);
        }
      }

      return true;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Helper untuk mempersiapkan data produk untuk operasi database
   */
  _prepareProductData(productData: Partial<ProductCreateInput>): {
    name?: string;
    slug?: string;
    description?: string;
    featuredImage: any;
    additionalImages: any[];
    basePrice?: number;
    baseStock?: number;
    hasVariations?: boolean;
    specialLabel?: string;
    weight?: number;
    dimensions?: any;
    meta?: any;
    category?: string;
    collection?: string;
    variations?: any[];
    variationPrices?: Record<string, { price: number; stock: number }>;
  } {
    // Create a working copy
    const preparedData = { ...productData } as any;

    // Transform featuredImage to expected format if it's a string
    if (typeof productData.featuredImage === "string") {
      preparedData.featuredImage = {
        url: productData.featuredImage,
        alt: productData.name || "Product image",
      };
    } else if (productData.featuredImage === null) {
      preparedData.featuredImage = null;
    }

    // Transform additionalImages to the expected format if they exist
    if (
      productData.additionalImages &&
      Array.isArray(productData.additionalImages)
    ) {
      // Filter out null/undefined values and transform to object format
      const processedImages = productData.additionalImages
        .filter((img): img is string => Boolean(img))
        .map((url) => ({
          url,
          alt: productData.name || "Product image",
        }));

      preparedData.additionalImages = processedImages;
    } else {
      preparedData.additionalImages = [];
    }

    // If product has variations, ensure basePrice and baseStock are set to 0
    if (productData.hasVariations) {
      preparedData.basePrice = 0;
      preparedData.baseStock = 0;
    }

    return preparedData;
  },

  /**
   * Helper untuk menghapus gambar produk saat produk dihapus
   */
  async _deleteProductImages(product: any): Promise<void> {
    try {
      // Collect all images to delete
      const imagesToDelete: string[] = [];

      // Featured image
      if (product.featuredImage && product.featuredImage.url) {
        imagesToDelete.push(product.featuredImage.url);
      }

      // Additional images
      if (product.additionalImages && Array.isArray(product.additionalImages)) {
        product.additionalImages.forEach((img: any) => {
          if (img && img.url) imagesToDelete.push(img.url);
        });
      }

      // Variation images
      if (product.variations && Array.isArray(product.variations)) {
        product.variations.forEach((variation: any) => {
          if (variation.options && Array.isArray(variation.options)) {
            variation.options.forEach((option: any) => {
              if (option.imageUrl) imagesToDelete.push(option.imageUrl);
            });
          }
        });
      }

      // Delete images from Cloudinary using our API endpoint
      await Promise.allSettled(
        imagesToDelete.map(async (imageUrl) => {
          try {
            await CloudinaryService.deleteImageByUrl(imageUrl);
          } catch (error) {
            // Ignore individual image deletion errors
          }
        })
      );
    } catch (error) {
      // Log but don't throw to prevent blocking operations
    }
  },

  /**
   * Helper untuk membersihkan gambar yang tidak digunakan lagi setelah update
   */
  async _cleanupUnusedImages(oldProduct: any, newProduct: any): Promise<void> {
    try {
      // Helper to extract image URLs from a product
      const extractImages = (product: any) => {
        const images: Set<string> = new Set();

        // Featured image
        if (product.featuredImage && product.featuredImage.url) {
          images.add(product.featuredImage.url);
        }

        // Additional images
        if (
          product.additionalImages &&
          Array.isArray(product.additionalImages)
        ) {
          product.additionalImages.forEach((img: any) => {
            if (img && img.url) images.add(img.url);
          });
        }

        // Variation images
        if (product.variations && Array.isArray(product.variations)) {
          product.variations.forEach((variation: any) => {
            if (variation.options && Array.isArray(variation.options)) {
              variation.options.forEach((option: any) => {
                if (option.imageUrl) images.add(option.imageUrl);
              });
            }
          });
        }

        return images;
      };

      const oldImages = extractImages(oldProduct);
      const newImages = extractImages(newProduct);

      // Find images that are in old but not in new
      const imagesToDelete = [...oldImages].filter(
        (url) => !newImages.has(url)
      );

      // Delete unused images using API
      await Promise.allSettled(
        imagesToDelete.map(async (imageUrl) => {
          try {
            await CloudinaryService.deleteImageByUrl(imageUrl);
          } catch (error) {
            // Ignore individual image deletion errors
          }
        })
      );
    } catch (error) {
      // Log but don't throw to prevent blocking operations
    }
  },

  /**
   * Helper untuk memformat response produk
   */
  _formatProductResponse(dbProduct: any): Product {
    // Convert Prisma JSON fields to proper objects
    const featuredImage = dbProduct.featuredImage || undefined;
    const additionalImages = Array.isArray(dbProduct.additionalImages)
      ? dbProduct.additionalImages
      : [];
    const meta = dbProduct.meta || undefined;
    const dimensions = dbProduct.dimensions || undefined;

    // Format variations with safety checks
    const variations = Array.isArray(dbProduct.variations)
      ? dbProduct.variations.map((v: any) => ({
          id: v.id,
          name: v.name,
          options: Array.isArray(v.options)
            ? v.options.map((o: any) => ({
                id: o.id,
                name: o.name,
                imageUrl: o.imageUrl,
              }))
            : [],
        }))
      : [];

    // Format price variants with safety checks
    const priceVariants = Array.isArray(dbProduct.priceVariants)
      ? dbProduct.priceVariants.map((pv: any) => ({
          id: pv.id,
          price: pv.price,
          stock: pv.stock,
          combinationKey: pv.combinationKey,
          descriptiveName: pv.descriptiveName || undefined,
        }))
      : [];

    // Create a variationPrices object for client compatibility with safety
    const variationPrices: Record<string, { price: number; stock: number }> =
      {};
    if (Array.isArray(priceVariants)) {
      priceVariants.forEach((pv: any) => {
        if (pv && pv.combinationKey) {
          variationPrices[pv.combinationKey] = {
            price: Number(pv.price) || 0,
            stock: Number(pv.stock) || 0,
          };
        }
      });
    }

    // Build the complete product object with proper type handling
    return {
      id: dbProduct.id,
      name: dbProduct.name || "",
      slug: dbProduct.slug || "",
      description: dbProduct.description || "",
      featuredImage,
      additionalImages,
      basePrice: dbProduct.basePrice !== null ? dbProduct.basePrice : null,
      baseStock: dbProduct.baseStock !== null ? dbProduct.baseStock : null,
      hasVariations: Boolean(dbProduct.hasVariations),
      specialLabel: dbProduct.specialLabel || "",
      weight: dbProduct.weight || 0,
      dimensions,
      meta,
      categoryId: dbProduct.categoryId || undefined,
      collectionId: dbProduct.collectionId || undefined,
      variations,
      priceVariants,
      variationPrices,
      mainImage: featuredImage?.url || null, // For client compatibility
      createdAt: dbProduct.createdAt,
      updatedAt: dbProduct.updatedAt,
    };
  },

  /**
   * Helper untuk transformasi antara Product API dan ProductFormValues
   */
  transformToFormValues(product: Product): ProductFormValues & { id: string } {
    // Get the existing additional images and pad to exactly 8 slots
    const existingImages =
      product.additionalImages?.map((img) => img.url) || [];

    // Make sure we have exactly 8 slots by padding with nulls or trimming if needed
    const paddedAdditionalImages = [
      ...existingImages,
      ...Array(8).fill(null),
    ].slice(0, 8);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      featuredImage: product.featuredImage?.url || null,
      additionalImages: paddedAdditionalImages,
      basePrice: product.basePrice !== null ? product.basePrice : undefined,
      baseStock: product.baseStock !== null ? product.baseStock : undefined,
      hasVariations: product.hasVariations,
      specialLabel: product.specialLabel || "",
      weight: product.weight || 0,
      dimensions: product.dimensions || { width: 0, length: 0, height: 0 },
      meta: product.meta || {
        title: product.name,
        description: product.description || "",
        keywords: [],
      },
      category: product.categoryId || "",
      collection: product.collectionId || "none",
      variations: product.variations || [],
      variationPrices: product.variationPrices || {},
    };
  },
};
