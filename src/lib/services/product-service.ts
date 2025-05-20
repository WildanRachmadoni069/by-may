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
      includePriceVariants?: boolean; // Tambahkan parameter ini
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
      includePriceVariants = false, // Default false untuk performa
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

    try {
      // Perbarui produk dasar dalam transaksi
      // Gunakan transaksi untuk memastikan semua perubahan berhasil atau gagal bersama-sama
      const updatedProduct = await db.$transaction(async (tx) => {
        // Salin data variasi dan varian harga sebelum menghapus dari updateData
        const variations = updateData.variations;
        const priceVariants = updateData.priceVariants;

        // Hapus data variasi dan varian harga dari updateData karena akan diproses secara terpisah
        delete updateData.variations;
        delete updateData.priceVariants;

        // 1. Perbarui produk
        const updatedProduct = await tx.product.update({
          where: { id: product.id },
          data: updateData,
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

        // 2. Perbarui varian harga jika produk memiliki variasi
        if (data.hasVariations && priceVariants && priceVariants.length > 0) {
          // Ambil daftar varian harga yang ada
          const existingPriceVariants = await tx.priceVariant.findMany({
            where: { productId: product.id },
            include: {
              options: {
                include: {
                  option: true,
                },
              },
            },
          });

          // Bangun peta opsi variasi untuk membantu pencarian
          const optionIdMap = new Map<string, string>();

          // Jika ada variasi yang diberikan, gunakan itu untuk membangun peta
          if (variations && variations.length > 0) {
            for (const variation of variations) {
              if (variation.options) {
                for (const option of variation.options) {
                  if (option.id) {
                    // Gunakan ID yang sudah ada
                    optionIdMap.set(option.id, option.id);
                  }
                }
              }
            }
          }

          // Jika tidak ada variasi yang diberikan, gunakan variasi yang ada pada produk
          else if (updatedProduct.variations.length > 0) {
            for (const variation of updatedProduct.variations) {
              for (const option of variation.options) {
                optionIdMap.set(option.id, option.id);
              }
            }
          }

          // Update atau buat varian harga baru
          for (const priceVariant of priceVariants) {
            // Jika tidak ada kombinasi opsi atau harga/stok null, lewati
            if (
              !priceVariant.optionCombination ||
              priceVariant.optionCombination.length === 0 ||
              priceVariant.price === null ||
              priceVariant.stock === null
            ) {
              continue;
            }

            // Pastikan harga dan stok adalah angka valid
            const price =
              typeof priceVariant.price === "number" ? priceVariant.price : 0;
            const stock =
              typeof priceVariant.stock === "number" ? priceVariant.stock : 0;

            // Cari apakah varian harga ini sudah ada berdasarkan ID atau kombinasi opsi
            let existingPriceVariant = priceVariant.id
              ? existingPriceVariants.find((pv) => pv.id === priceVariant.id)
              : null;

            // Persiapkan data untuk perbarui atau buat baru
            const priceVariantData = {
              productId: updatedProduct.id,
              price, // Gunakan nilai yang sudah divalidasi
              stock, // Gunakan nilai yang sudah divalidasi
              sku: priceVariant.sku || undefined,
            };

            if (existingPriceVariant) {
              // Perbarui varian harga yang ada
              await tx.priceVariant.update({
                where: { id: existingPriceVariant.id },
                data: priceVariantData,
              });
            } else {
              // Buat varian harga baru
              const newPriceVariant = await tx.priceVariant.create({
                data: priceVariantData,
              });

              // Hubungkan opsi ke varian harga yang baru
              for (const optionId of priceVariant.optionCombination) {
                // Periksa apakah ID opsi ini valid (ada dalam peta)
                const validOptionId = optionIdMap.get(optionId);
                if (validOptionId) {
                  await tx.priceVariantToOption.create({
                    data: {
                      priceVariantId: newPriceVariant.id,
                      optionId: validOptionId,
                    },
                  });
                }
              }
            }
          }
        }

        return updatedProduct;
      });

      return updatedProduct as unknown as Product;
    } catch (error) {
      console.error("Error dalam updateProduct:", error);
      throw error;
    }
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
      // Kumpulkan semua URL gambar yang perlu dihapus
      const imagesToDelete: string[] = [];

      // 1. Tambahkan gambar utama jika ada
      if (product.featuredImage?.url) {
        imagesToDelete.push(product.featuredImage.url);
      }

      // 2. Tambahkan semua gambar tambahan
      if (product.additionalImages && Array.isArray(product.additionalImages)) {
        for (const image of product.additionalImages) {
          if (image?.url) {
            imagesToDelete.push(image.url);
          }
        }
      }

      // 3. Tambahkan gambar opsi variasi jika ada
      if (product.variations && Array.isArray(product.variations)) {
        for (const variation of product.variations) {
          if (variation.options && Array.isArray(variation.options)) {
            for (const option of variation.options) {
              if (option.imageUrl) {
                imagesToDelete.push(option.imageUrl);
              }
            }
          }
        }
      }

      // Proses penghapusan dalam transaksi agar atomic
      let imagesDeletionResult: { success: boolean; failed: string[] } = {
        success: true,
        failed: [],
      };

      // Coba hapus gambar-gambar terlebih dahulu
      if (imagesToDelete.length > 0) {
        const results = await Promise.allSettled(
          imagesToDelete.map((url) => CloudinaryService.deleteImageByUrl(url))
        );

        // Periksa hasil penghapusan gambar
        const failedImages = results
          .map((result, index) => {
            if (
              result.status === "rejected" ||
              (result.status === "fulfilled" && !result.value)
            ) {
              return imagesToDelete[index];
            }
            return null;
          })
          .filter(Boolean) as string[];

        if (failedImages.length > 0) {
          imagesDeletionResult = {
            success: false,
            failed: failedImages,
          };
        }
      }

      // Jika ada gambar yang gagal dihapus, batalkan seluruh operasi
      if (!imagesDeletionResult.success) {
        return {
          success: false,
          message: `Gagal menghapus ${imagesDeletionResult.failed.length} gambar produk. Penghapusan produk dibatalkan untuk menjaga konsistensi data.`,
        };
      }

      // Jika penghapusan gambar sukses, lanjutkan dengan penghapusan produk dari database
      await db.product.delete({
        where: { id: product.id },
      });

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
