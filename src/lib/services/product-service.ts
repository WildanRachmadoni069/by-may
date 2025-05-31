/**
 * Layanan Produk (Product Service)
 *
 * Layanan ini bertanggung jawab untuk menangani semua operasi terkait produk
 * termasuk operasi CRUD, pengambilan data dengan paginasi dan filter,
 * serta pengelolaan gambar produk.
 */

import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
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
import { slugify } from "@/lib/utils";

/**
 * Tipe pembantu untuk field JSON Prisma untuk memastikan kompatibilitas
 * Ini memungkinkan key string dengan nilai apapun
 */
type PrismaJsonObject = { [key: string]: any };

export const ProductService = {
  /**
   * Mengkonversi objek bertipe ke objek JSON yang kompatibel dengan Prisma
   * @param obj - Objek bertipe yang akan dikonversi
   * @returns Objek JSON yang kompatibel dengan Prisma
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

    // Konversi objek bertipe ke objek biasa yang dapat ditangani Prisma
    return JSON.parse(JSON.stringify(obj)) as PrismaJsonObject;
  },

  /**
   * Pembantu untuk mengkonversi array objek bertipe ke array JSON Prisma
   * @param array - Array objek bertipe
   * @returns Array JSON yang kompatibel dengan Prisma
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

      return product as unknown as Product | null;
    } catch (error) {
      console.error(`Error mengambil produk dengan slug ${slug}:`, error);
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
      categorySlug?: string;
      collectionId?: string;
      specialLabel?: string;
      sortBy?: string;
      includePriceVariants?: boolean;
    } = {}
  ): Promise<PaginatedResult<Product>> {
    const {
      page = 1,
      limit = 10,
      search,
      categorySlug,
      collectionId,
      specialLabel,
      sortBy = "newest",
      includePriceVariants = false,
    } = options;

    const skip = (page - 1) * limit;

    // Bangun filter query
    const where: any = {};

    // Perbaikan implementasi pencarian
    if (search && search.trim() !== "") {
      const searchTerm = search.trim();

      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ];
    } // Tambahkan filter kategori berdasarkan slug
    if (categorySlug && categorySlug !== "all") {
      where.category = {
        slug: categorySlug,
      };
    }

    // Tambahkan filter koleksi
    if (collectionId && collectionId !== "all") {
      where.collectionId = collectionId;
    }

    // Tambahkan filter label khusus
    if (specialLabel && specialLabel !== "all") {
      where.specialLabel = specialLabel;
    }

    // Tentukan pengurutan default
    const orderBy: any = {};

    // Perlu pengurutan khusus untuk harga
    const needsPriceOrder = sortBy === "price-low" || sortBy === "price-high";

    // Pengurutan non-harga
    if (!needsPriceOrder) {
      switch (sortBy) {
        case "newest":
          orderBy.createdAt = "desc";
          break;
        case "oldest":
          orderBy.createdAt = "asc";
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
    }

    try {
      // Tentukan apa yang akan disertakan dalam query
      const include: any = {
        category: true,
        collection: true,
      };

      // Sertakan priceVariants jika diminta atau jika melakukan pengurutan berdasarkan harga
      const shouldIncludePriceVariants =
        includePriceVariants || needsPriceOrder;

      if (shouldIncludePriceVariants) {
        include.priceVariants = {
          include: {
            options: {
              include: {
                option: true,
              },
            },
          },
        };
      }

      // Ambil produk dengan paginasi dan filter
      let products = await db.product.findMany({
        where,
        include,
        take: limit,
        skip,
        orderBy: !needsPriceOrder ? orderBy : undefined,
      });

      // Jika perlu pengurutan berdasarkan harga, lakukan pengurutan manual berdasarkan harga minimal
      if (needsPriceOrder) {
        products = products.sort((a, b) => {
          // Fungsi untuk mendapatkan harga minimal dari produk
          const getMinPrice = (product: any) => {
            if (!product.hasVariations) {
              return product.basePrice || 0;
            }

            if (product.priceVariants && product.priceVariants.length > 0) {
              // Ambil semua harga dari varian-varian
              const prices = product.priceVariants
                .map((variant: any) => variant.price)
                .filter(Boolean);

              // Jika ada harga, ambil yang terendah, jika tidak kembalikan 0
              return prices.length > 0 ? Math.min(...prices) : 0;
            }

            return product.basePrice || 0;
          };

          // Dapatkan harga minimal dari produk A dan B
          const minPriceA = getMinPrice(a);
          const minPriceB = getMinPrice(b);

          // Urutkan berdasarkan sortBy
          if (sortBy === "price-low") {
            return minPriceA - minPriceB; // Ascending (terendah ke tertinggi)
          } else {
            return minPriceB - minPriceA; // Descending (tertinggi ke terendah)
          }
        });
      }
      // Dapatkan jumlah total untuk paginasi
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
    } catch (error) {
      console.error("Database error during product search:", error);
      throw error;
    }
  },

  /**
   * Pembantu untuk memproses field JSON dengan nilai null
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
    const slug = data.slug || slugify(data.name);

    // Periksa apakah slug sudah ada
    const existingProduct = await db.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      throw new Error(`Produk dengan slug '${slug}' sudah ada`);
    }

    // Proses field JSON menggunakan fungsi konverter
    const featuredImage = this._toPrismaJson(data.featuredImage);
    const additionalImages = this._toPrismaJsonArray(
      data.additionalImages || []
    );
    const dimensions = this._toPrismaJson(data.dimensions);
    const meta = this._toPrismaJson(data.meta);

    // Untuk produk dengan variasi, pastikan basePrice dan baseStock diatur ke null
    // Ini memperbaiki inkonsistensi saat membuat produk dengan variasi
    let basePrice = data.basePrice;
    let baseStock = data.baseStock;

    if (data.hasVariations) {
      basePrice = null;
      baseStock = null;
    }

    try {
      // Buat produk
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

      // Buat variasi jika ada
      if (data.hasVariations && data.variations && data.variations.length > 0) {
        const variationOptionsMap = new Map<string, string>(); // Map untuk menyimpan ID temporer -> ID database sebenarnya

        // Proses setiap variasi
        for (const variation of data.variations) {
          const createdVariation = await db.productVariation.create({
            data: {
              productId: product.id,
              name: variation.name,
            },
          });

          // Buat opsi untuk variasi ini
          if (variation.options && variation.options.length > 0) {
            for (const option of variation.options) {
              const createdOption = await db.productVariationOption.create({
                data: {
                  variationId: createdVariation.id,
                  name: option.name,
                  imageUrl: option.imageUrl,
                },
              });

              // Simpan pemetaan ID dari ID temporer ke ID database sebenarnya
              if (option.id) {
                variationOptionsMap.set(option.id, createdOption.id);
              }

              // Simpan dengan prefiks temporer untuk kasus dari store
              variationOptionsMap.set(
                `temp-${variation.name}-${option.name}`,
                createdOption.id
              );

              // Simpan pemetaan langsung
              variationOptionsMap.set(
                `${variation.name}-${option.name}`,
                createdOption.id
              );
            }
          }
        }

        // Buat varian harga jika ada
        if (data.priceVariants && data.priceVariants.length > 0) {
          console.log("Processing price variants:", data.priceVariants);

          for (const priceVariant of data.priceVariants) {
            // Log setiap price variant sebelum validasi
            console.log("Processing variant:", {
              combination: priceVariant.optionCombination,
              price: priceVariant.price,
              stock: priceVariant.stock,
            });

            // Validasi data yang diperlukan
            if (
              !priceVariant.optionCombination ||
              priceVariant.optionCombination.length === 0
            ) {
              console.warn(
                "Skipping variant - invalid option combination:",
                priceVariant
              );
              continue;
            }

            // Gunakan default 0 untuk price/stock yang null
            const price = priceVariant.price ?? 0;
            const stock = priceVariant.stock ?? 0;

            try {
              // Buat varian harga
              const createdPriceVariant = await db.priceVariant.create({
                data: {
                  productId: product.id,
                  price: price,
                  stock: stock,
                  sku: priceVariant.sku,
                },
              });

              console.log("Created price variant:", createdPriceVariant);

              // Array untuk mengumpulkan opsi yang perlu dihubungkan
              const optionsToLink: string[] = [];

              // Coba mapkan setiap opsi ke ID sebenarnya
              for (let i = 0; i < priceVariant.optionCombination.length; i++) {
                const optionKey = priceVariant.optionCombination[i];
                let realOptionId = variationOptionsMap.get(optionKey);

                // Jika tidak dapat menemukannya secara langsung, coba format lain
                if (
                  !realOptionId &&
                  priceVariant.optionLabels &&
                  priceVariant.optionLabels[i]
                ) {
                  const label = priceVariant.optionLabels[i];
                  const parts = label.split(":").map((p) => p.trim());

                  if (parts.length === 2) {
                    const variationName = parts[0];
                    const optionName = parts[1];

                    // Coba berbagai format key untuk menemukan ID yang benar
                    realOptionId =
                      variationOptionsMap.get(
                        `${variationName}-${optionName}`
                      ) ||
                      variationOptionsMap.get(
                        `temp-${variationName}-${optionName}`
                      );
                  }
                }

                if (realOptionId) {
                  optionsToLink.push(realOptionId);
                } else {
                  console.warn("Could not find real option ID for:", {
                    optionKey,
                    label: priceVariant.optionLabels?.[i],
                    mapKeys: Array.from(variationOptionsMap.keys()),
                  });
                }
              }

              // Buat koneksi untuk semua opsi yang berhasil dipetakan
              for (const realOptionId of optionsToLink) {
                try {
                  await db.priceVariantToOption.create({
                    data: {
                      priceVariantId: createdPriceVariant.id,
                      optionId: realOptionId,
                    },
                  });
                } catch (error) {
                  console.error("Failed to link option to price variant:", {
                    variantId: createdPriceVariant.id,
                    optionId: realOptionId,
                    error,
                  });
                }
              }
            } catch (error) {
              console.error("Failed to create price variant:", {
                variant: priceVariant,
                error,
              });
            }
          }
        }
      }

      // Kembalikan produk yang dibuat dengan relasi
      return this.getProductBySlug(slug) as Promise<Product>;
    } catch (error) {
      console.error("Error dalam createProduct:", error);
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
    const existingProduct = await this.getProductBySlug(slug);

    if (!existingProduct) {
      throw new Error(`Product with slug '${slug}' not found`);
    }

    // Validate slug uniqueness outside transaction
    if (data.slug && data.slug !== existingProduct.slug) {
      const productWithSlug = await db.product.findUnique({
        where: { slug: data.slug },
      });
      if (productWithSlug && productWithSlug.id !== existingProduct.id) {
        throw new Error(
          `Slug '${data.slug}' is already used by another product`
        );
      }
    }

    // Build relationship updates
    const categoryUpdate =
      data.categoryId !== undefined
        ? data.categoryId === null
          ? { category: { disconnect: true } }
          : { category: { connect: { id: data.categoryId } } }
        : {};

    const collectionUpdate =
      data.collectionId !== undefined
        ? data.collectionId === null
          ? { collection: { disconnect: true } }
          : { collection: { connect: { id: data.collectionId } } }
        : {};

    // Process JSON fields
    const updateData: Prisma.ProductUpdateInput = {
      name: data.name,
      slug: data.slug,
      description:
        data.description !== undefined ? data.description : undefined,
      featuredImage:
        data.featuredImage !== undefined
          ? this._toPrismaJson(data.featuredImage)
          : undefined,
      additionalImages:
        data.additionalImages !== undefined
          ? this._toPrismaJsonArray(data.additionalImages)
          : undefined,
      basePrice: data.basePrice !== undefined ? data.basePrice : undefined,
      baseStock: data.baseStock !== undefined ? data.baseStock : undefined,
      hasVariations:
        data.hasVariations !== undefined ? data.hasVariations : undefined,
      specialLabel:
        data.specialLabel !== undefined ? data.specialLabel : undefined,
      weight: data.weight !== undefined ? data.weight : undefined,
      dimensions:
        data.dimensions !== undefined
          ? this._toPrismaJson(data.dimensions)
          : undefined,
      meta: data.meta !== undefined ? this._toPrismaJson(data.meta) : undefined,
    };

    // Handle category relationship
    if (data.categoryId !== undefined) {
      updateData.category =
        data.categoryId === null
          ? { disconnect: true }
          : { connect: { id: data.categoryId } };
    }

    // Handle collection relationship
    if (data.collectionId !== undefined) {
      updateData.collection =
        data.collectionId === null
          ? { disconnect: true }
          : { connect: { id: data.collectionId } };
    }

    // Remove variations and priceVariants from updateData as they'll be handled separately
    delete updateData.variations;
    delete updateData.priceVariants;

    try {
      // Handle everything in a single transaction
      const updatedProduct = await db.$transaction(
        async (tx) => {
          // 1. Update basic product info
          const basicUpdate = await tx.product.update({
            where: { id: existingProduct.id },
            data: updateData,
          });

          // 2. Handle variations if needed
          if (data.hasVariations && Array.isArray(data.variations)) {
            // Delete existing variations and their options
            await tx.productVariationOption.deleteMany({
              where: {
                variation: {
                  productId: existingProduct.id,
                },
              },
            });
            await tx.productVariation.deleteMany({
              where: { productId: existingProduct.id },
            });

            // Create new variations and build option map
            const optionMap = new Map<string, string>();

            for (const variation of data.variations) {
              const newVariation = await tx.productVariation.create({
                data: {
                  productId: basicUpdate.id,
                  name: variation.name,
                },
              });

              if (variation.options) {
                for (const option of variation.options) {
                  const newOption = await tx.productVariationOption.create({
                    data: {
                      variationId: newVariation.id,
                      name: option.name,
                      imageUrl: option.imageUrl,
                    },
                  });

                  // Map both ID and name combination
                  if (option.id) {
                    optionMap.set(option.id, newOption.id);
                  }
                  optionMap.set(
                    `${variation.name}-${option.name}`,
                    newOption.id
                  );
                  optionMap.set(
                    `temp-${variation.name}-${option.name}`,
                    newOption.id
                  );
                }
              }
            }

            // 3. Handle price variants if they exist
            if (Array.isArray(data.priceVariants)) {
              // Delete all existing price variants
              await tx.priceVariantToOption.deleteMany({
                where: {
                  priceVariant: {
                    productId: existingProduct.id,
                  },
                },
              });
              await tx.priceVariant.deleteMany({
                where: { productId: existingProduct.id },
              });

              // Create new price variants
              for (const variant of data.priceVariants) {
                if (!variant.optionCombination?.length) continue;

                const newPriceVariant = await tx.priceVariant.create({
                  data: {
                    productId: basicUpdate.id,
                    price: Number(variant.price) || 0,
                    stock: Number(variant.stock) || 0,
                    sku: variant.sku || undefined,
                  },
                });

                // Connect options to price variant
                for (const optionId of variant.optionCombination) {
                  const realOptionId = optionMap.get(optionId);
                  if (realOptionId) {
                    await tx.priceVariantToOption.create({
                      data: {
                        priceVariantId: newPriceVariant.id,
                        optionId: realOptionId,
                      },
                    });
                  }
                }
              }
            }
          }

          // Return the fully updated product with all relations
          return tx.product.findUnique({
            where: { id: basicUpdate.id },
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
        },
        {
          timeout: 30000, // Increase timeout to 30 seconds
          maxWait: 35000, // Maximum time to wait for transaction
          isolationLevel: "Serializable", // Highest isolation level to prevent race conditions
        }
      );

      if (!updatedProduct) {
        throw new Error("Failed to update product");
      }

      // Clean up old images after successful transaction
      await this._cleanupProductImages(existingProduct, data);

      return updatedProduct as unknown as Product;
    } catch (error) {
      console.error("Error dalam updateProduct:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to update product: ${error.message}`);
      }
      throw new Error(
        "An unexpected error occurred while updating the product"
      );
    }
  },

  /**
   * Menghapus produk dan semua data terkait
   * @param slug - Slug produk yang akan dihapus
   * @returns Status keberhasilan dan pesan opsional
   */
  async deleteProduct(
    slug: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const product = await this.getProductBySlug(slug);
      if (!product) {
        return {
          success: false,
          message: `Product dengan slug '${slug}' tidak ditemukan`,
        };
      }

      // Hapus produk dan semua relasinya dalam satu transaksi
      await db.$transaction(async (tx) => {
        // 1. Hapus semua price variant options
        await tx.priceVariantToOption.deleteMany({
          where: {
            priceVariant: {
              productId: product.id,
            },
          },
        });

        // 2. Hapus semua price variants
        await tx.priceVariant.deleteMany({
          where: { productId: product.id },
        });

        // 3. Hapus semua variation options
        await tx.productVariationOption.deleteMany({
          where: {
            variation: {
              productId: product.id,
            },
          },
        });

        // 4. Hapus semua variations
        await tx.productVariation.deleteMany({
          where: { productId: product.id },
        });

        // 5. Hapus produk utama
        await tx.product.delete({
          where: { id: product.id },
        });
      });

      // Setelah transaksi berhasil, hapus gambar dari Cloudinary
      try {
        // Hapus featured image
        if (product.featuredImage?.url) {
          await CloudinaryService.deleteImageByUrl(product.featuredImage.url);
        }

        // Hapus additional images
        if (product.additionalImages?.length) {
          for (const image of product.additionalImages) {
            if (image?.url) {
              await CloudinaryService.deleteImageByUrl(image.url);
            }
          }
        }
      } catch (error) {
        console.error("Error menghapus gambar dari Cloudinary:", error);
        // Lanjutkan meskipun ada error dalam penghapusan gambar
        // karena produk sudah terhapus dari database
      }

      return {
        success: true,
        message: `Product '${product.name}' berhasil dihapus`,
      };
    } catch (error) {
      console.error("Error dalam deleteProduct:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error tidak terduga saat menghapus produk",
      };
    }
  },

  // Helper methods for updateProduct
  async _cleanupProductImages(
    product: Product,
    data: Partial<CreateProductInput>
  ) {
    // Cleanup featured image
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
        console.error("Gagal menghapus gambar utama lama:", error);
      }
    }

    // Cleanup additional images
    if (data.additionalImages) {
      try {
        const oldUrls = (product.additionalImages || [])
          .map((img) => img?.url)
          .filter(Boolean);
        const newUrls = (data.additionalImages || [])
          .map((img) => img?.url)
          .filter(Boolean);

        const urlsToDelete = oldUrls.filter((url) => !newUrls.includes(url));

        for (const url of urlsToDelete) {
          await CloudinaryService.deleteImageByUrl(url);
        }
      } catch (error) {
        console.error("Error membersihkan gambar tambahan:", error);
      }
    }
  },

  async _validateSlugUniqueness(
    product: Product,
    data: Partial<CreateProductInput>
  ) {
    if (data.slug && data.slug !== product.slug) {
      const existingWithSlug = await db.product.findUnique({
        where: { slug: data.slug },
      });

      if (existingWithSlug && existingWithSlug.id !== product.id) {
        throw new Error(`Slug '${data.slug}' sudah digunakan oleh produk lain`);
      }
    }
  },

  async _buildOptionIdMap(
    tx: any,
    variations: any[] | undefined,
    product: any
  ): Promise<Map<string, string>> {
    const optionIdMap = new Map<string, string>();

    if (Array.isArray(variations) && variations.length > 0) {
      for (const variation of variations) {
        if (variation.options) {
          for (const option of variation.options) {
            if (option.id) {
              optionIdMap.set(option.id, option.id);
            }
          }
        }
      }
    } else if (product.variations.length > 0) {
      for (const variation of product.variations) {
        for (const option of variation.options) {
          optionIdMap.set(option.id, option.id);
        }
      }
    }

    return optionIdMap;
  },

  _isValidPriceVariant(priceVariant: any): boolean {
    return (
      priceVariant.optionCombination &&
      Array.isArray(priceVariant.optionCombination) &&
      priceVariant.optionCombination.length > 0 &&
      priceVariant.price !== null &&
      priceVariant.stock !== null
    );
  },

  _getValidOptionConnections(
    optionCombination: string[],
    optionIdMap: Map<string, string>
  ): { optionId: string }[] {
    return optionCombination
      .map((optionId) => {
        const validOptionId = optionIdMap.get(optionId);
        return validOptionId ? { optionId: validOptionId } : null;
      })
      .filter(
        (connection): connection is { optionId: string } => connection !== null
      );
  },
};
