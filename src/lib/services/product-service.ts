/**
 * Layanan Produk (Product Service)
 *
 * Layanan ini bertanggung jawab untuk menangani semua operasi terkait produk
 * termasuk operasi CRUD, pengambilan data dengan paginasi dan filter,
 * serta pengelolaan gambar produk.
 */

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
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

      // Catat varian harga produk dan opsinya untuk debugging
      if (product.priceVariants.length > 0) {
        console.log(
          `Produk ditemukan ${product.name} dengan ${product.priceVariants.length} varian harga`
        );

        for (const variant of product.priceVariants) {
          console.log(
            `Varian harga ${variant.id}: harga=${variant.price}, stok=${variant.stock}, dengan ${variant.options.length} opsi`
          );

          // Catat setiap opsi yang terhubung
          variant.options.forEach((connection) => {
            console.log(
              `- Terhubung ke opsi: ${connection.option.name} (ID: ${connection.option.id})`
            );
          });
        }
      } else {
        console.log(`Produk ${product.name} tidak memiliki varian harga`);
      }

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

    // Bangun filter query
    const where: any = {};

    // Tambahkan pencarian
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Tambahkan filter kategori
    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    // Tambahkan filter koleksi
    if (collectionId && collectionId !== "all") {
      where.collectionId = collectionId;
    }

    // Tambahkan filter label khusus
    if (specialLabel && specialLabel !== "all") {
      where.specialLabel = specialLabel;
    }

    // Tentukan pengurutan
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

    // Ambil produk dengan paginasi dan filter
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
    // Hasilkan slug jika tidak disediakan
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

      console.log(
        `Produk berhasil dibuat dengan ID: ${product.id}, slug: ${product.slug}`
      );

      // Buat variasi jika ada
      if (data.hasVariations && data.variations && data.variations.length > 0) {
        const variationOptionsMap = new Map<string, string>(); // Map untuk menyimpan ID temporer -> ID database sebenarnya

        // Proses setiap variasi
        for (const variation of data.variations) {
          console.log(`Membuat variasi: ${variation.name}`);

          const createdVariation = await db.productVariation.create({
            data: {
              productId: product.id,
              name: variation.name,
            },
          });

          console.log(
            `Variasi berhasil dibuat dengan ID: ${createdVariation.id}`
          );

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

              console.log(
                `Opsi dibuat: ${option.name} dengan ID: ${createdOption.id}`
              );

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
          for (const priceVariant of data.priceVariants) {
            // Lewati jika data yang diperlukan tidak ada
            if (
              priceVariant.price === null ||
              priceVariant.stock === null ||
              !priceVariant.optionCombination ||
              priceVariant.optionCombination.length === 0
            ) {
              continue;
            }

            // Buat varian harga
            const createdPriceVariant = await db.priceVariant.create({
              data: {
                productId: product.id,
                price: priceVariant.price || 0,
                stock: priceVariant.stock || 0,
                sku: priceVariant.sku,
              },
            });

            // Array ini akan mengumpulkan opsi yang perlu dihubungkan
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
                // Format: "Variasi: Opsi"
                const label = priceVariant.optionLabels[i];
                const parts = label.split(":").map((p) => p.trim());

                if (parts.length === 2) {
                  const variationName = parts[0];
                  const optionName = parts[1];

                  // Coba temukan berdasarkan key gabungan
                  realOptionId = variationOptionsMap.get(
                    `${variationName}-${optionName}`
                  );

                  // Atau dengan key template
                  if (!realOptionId) {
                    realOptionId = variationOptionsMap.get(
                      `temp-${variationName}-${optionName}`
                    );
                  }
                }
              }

              // Jika ditemukan ID yang valid, tambahkan ke daftar
              if (realOptionId) {
                optionsToLink.push(realOptionId);
              }
            }

            // Sekarang buat koneksi untuk semua opsi yang berhasil dipetakan
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
                  `Gagal menghubungkan opsi ${realOptionId} ke varian harga:`,
                  error
                );
              }
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
    const product = await this.getProductBySlug(slug);

    if (!product) {
      throw new Error(`Produk dengan slug '${slug}' tidak ditemukan`);
    }

    // Proses field JSON untuk Prisma menggunakan fungsi konverter
    let updateData: any = { ...data };

    // Tangani field JSON
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

    // Tangani perubahan gambar utama - bersihkan gambar lama jika berubah
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
        // Catat tapi lanjutkan dengan pembaruan
        console.error("Gagal menghapus gambar utama lama:", error);
      }
    }

    // Tangani perubahan gambar tambahan
    if (data.additionalImages) {
      try {
        // Temukan gambar yang ada di set lama tapi tidak ada di set baru
        const oldUrls = (product.additionalImages || [])
          .map((img) => img?.url)
          .filter(Boolean);
        const newUrls = (data.additionalImages || [])
          .map((img) => img?.url)
          .filter(Boolean);

        // Tentukan gambar yang akan dihapus
        const urlsToDelete = oldUrls.filter((url) => !newUrls.includes(url));

        // Hapus gambar yang dihapus
        for (const url of urlsToDelete) {
          await CloudinaryService.deleteImageByUrl(url);
        }
      } catch (error) {
        // Catat tapi lanjutkan dengan pembaruan
        console.error("Error membersihkan gambar tambahan:", error);
      }
    }

    // Jika slug berubah, periksa keunikannya
    if (data.slug && data.slug !== slug) {
      const existingWithSlug = await db.product.findUnique({
        where: { slug: data.slug },
      });

      if (existingWithSlug && existingWithSlug.id !== product.id) {
        throw new Error(`Slug '${data.slug}' sudah digunakan oleh produk lain`);
      }
    }

    // Perbarui produk dasar
    const updatedProduct = await db.product.update({
      where: { id: product.id },
      data: updateData,
    });

    // Tangani pembaruan variasi
    if (data.hasVariations && data.variations) {
      // Pembaruan variasi yang kompleks akan di sini
      // Ini akan melibatkan perbandingan variasi lama vs baru dan memperbarui sesuai
    }

    return this.getProductBySlug(updatedProduct.slug) as Promise<Product>;
  },

  /**
   * Menghapus produk dan gambar terkait
   * @param slug - Slug produk
   * @returns Status keberhasilan dan pesan opsional
   */
  async deleteProduct(
    slug: string
  ): Promise<{ success: boolean; message?: string }> {
    const product = await this.getProductBySlug(slug);

    if (!product) {
      throw new Error(`Produk dengan slug '${slug}' tidak ditemukan`);
    }

    try {
      // Hapus produk dari database terlebih dahulu
      await db.product.delete({
        where: { id: product.id },
      });

      // Bersihkan gambar
      try {
        // Hapus gambar utama
        if (product.featuredImage?.url) {
          await CloudinaryService.deleteImageByUrl(product.featuredImage.url);
        }

        // Hapus gambar tambahan
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
        // Catat tapi lanjutkan (produk sudah dihapus dari DB)
        console.error("Error membersihkan gambar produk:", error);
      }

      return { success: true };
    } catch (error) {
      console.error("Error menghapus produk:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error tidak diketahui saat menghapus produk",
      };
    }
  },
};
