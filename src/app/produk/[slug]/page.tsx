/**
 * Halaman Detail Produk
 * @module ProductDetailPage
 * @description Menampilkan halaman detail produk dengan fitur:
 * - Galeri gambar produk dengan thumbnail
 * - Pilihan variasi produk (jika ada)
 * - Pengaturan jumlah produk
 * - Tombol tambah ke keranjang
 * - Deskripsi produk yang dapat diperluas
 * - Produk terkait
 * - Structured data dan optimasi SEO
 */
"use client";

import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "@/hooks/use-toast";
import RelatedProducts from "@/components/productpage/RelatedProducts";
import Footer from "@/components/landingpage/Footer";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Image as ProductImage, PriceVariant } from "@/types/product";
import useAuthStore from "@/store/useAuthStore";
import { getProductPriceDisplay } from "@/utils/product";
import { useProduct } from "@/hooks/useProduct"; // Import useProduct hook

export default function ProductDetail() {
  // Get slug from URL params
  const { slug } = useParams();
  const stringSlug =
    typeof slug === "string" ? slug : Array.isArray(slug) ? slug[0] : "";

  // Use the useProduct hook instead of direct API call
  const { product, isLoading, error } = useProduct(stringSlug);

  // Local UI state
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [firstCarouselApi, setFirstCarouselApi] = useState<CarouselApi>();
  const [secondCarouselApi, setSecondCarouselApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [currentStock, setCurrentStock] = useState<number | null>(null);

  // Images state
  const [variationImageMap, setVariationImageMap] = useState<
    Record<string, number>
  >({});
  const [allImages, setAllImages] = useState<ProductImage[]>([]);

  // Auth and cart state from stores
  const { currentUser } = useAuthStore();
  const [selectedPriceVariant, setSelectedPriceVariant] =
    useState<PriceVariant | null>(null);
  const { addItem } = useCartStore();

  // Initialize price and stock when product data is loaded - if product has no variations
  useEffect(() => {
    if (product && !product.hasVariations) {
      setCurrentPrice(product.basePrice || 0);
      setCurrentStock(product.baseStock || 0);
    }
  }, [product]);

  // Setup images when product data is loaded
  useEffect(() => {
    if (!product) return;

    // Start with product images
    const productImages: ProductImage[] = [
      product.featuredImage,
      ...(product.additionalImages || []),
    ].filter((img): img is ProductImage => Boolean(img));

    // Check if first variation has images
    let optionImageMap: Record<string, number> = {};

    if (product.variations.length > 0) {
      let currentIndex = productImages.length;
      const firstVariation = product.variations[0];

      // Add images from first variation options
      firstVariation.options.forEach((option) => {
        if (option.imageUrl) {
          // Store the index of this variation image
          optionImageMap[`${firstVariation.id}-${option.id}`] = currentIndex;
          currentIndex++;
        }
      });

      // Get all variation images with proper format
      const variationImages = firstVariation.options
        .filter((option) => option.imageUrl)
        .map((option) => ({
          url: option.imageUrl as string,
          alt: option.name,
        }));

      // Combine all images
      const combined = [...productImages, ...variationImages];
      setAllImages(combined);
      setVariationImageMap(optionImageMap);
    } else {
      setAllImages(productImages);
      setVariationImageMap({});
    }
  }, [product]);

  // Setup carousel sync
  useEffect(() => {
    if (!firstCarouselApi || !secondCarouselApi) return;

    firstCarouselApi.on("select", () => {
      const newIndex = firstCarouselApi.selectedScrollSnap();
      setCurrent(newIndex);

      // Scroll thumbnail carousel to keep active thumbnail visible
      const thumbnailsPerView = 5; // Adjust based on your layout
      const targetPage = Math.floor(newIndex / thumbnailsPerView);
      secondCarouselApi.scrollTo(targetPage * thumbnailsPerView);
    });
  }, [firstCarouselApi, secondCarouselApi]);

  // Helper function to generate variation key
  const generateVariationKey = (
    selectedOpts: Record<string, string>
  ): string => {
    if (!product?.variations.length) return "";

    // For double variations, we need to combine both variation IDs
    if (product.variations.length === 2) {
      const firstVariation = product.variations[0];
      const secondVariation = product.variations[1];

      const firstOptionId = selectedOpts[firstVariation.id];
      const secondOptionId = selectedOpts[secondVariation.id];

      if (!firstOptionId || !secondOptionId) return "";

      return `${firstVariation.id}-${firstOptionId}-${secondVariation.id}-${secondOptionId}`;
    }

    // Single variation case
    const selectedVariation = product.variations[0];
    const selectedOptionId = selectedOpts[selectedVariation.id];

    if (!selectedOptionId) return "";
    return `${selectedVariation.id}-${selectedOptionId}`;
  };
  /**
   * Mencari variant harga berdasarkan kombinasi opsi yang dipilih
   * @param selectedOpts - Object berisi ID variasi dan opsi yang dipilih
   * @returns PriceVariant yang sesuai atau null jika tidak ditemukan
   */
  const findPriceVariant = (selectedOpts: Record<string, string>) => {
    if (!product || !product.priceVariants.length) return null;

    // Extract all selected option IDs
    const selectedOptionIds = Object.values(selectedOpts);
    if (selectedOptionIds.length === 0) return null;

    // Find a price variant where all options match the selected options
    return product.priceVariants.find((priceVariant) => {
      const variantOptionIds = priceVariant.options.map((o) => o.option.id);

      // Check if this price variant contains all selected options
      // and doesn't contain any non-selected options
      return (
        variantOptionIds.length === selectedOptionIds.length &&
        variantOptionIds.every((id) => selectedOptionIds.includes(id)) &&
        selectedOptionIds.every((id) => variantOptionIds.includes(id))
      );
    });
  };

  // Update price and stock based on selected options
  const updatePriceAndStock = (selectedOpts: Record<string, string>) => {
    if (!product) return;

    if (!product.hasVariations) {
      setCurrentPrice(product.basePrice || 0);
      setCurrentStock(product.baseStock || 0);
      return;
    }

    // Check if all required variations are selected
    const allVariationsSelected = product.variations.every(
      (variation) => selectedOpts[variation.id]
    );

    if (allVariationsSelected) {
      const priceVariant = findPriceVariant(selectedOpts);

      if (priceVariant) {
        setCurrentPrice(priceVariant.price);
        setCurrentStock(priceVariant.stock);
        setSelectedPriceVariant(priceVariant);
      } else {
        // Reset to show price range if no matching price variant found
        setCurrentPrice(null);
        setCurrentStock(null);
        setSelectedPriceVariant(null);
      }
    } else {
      // If not all variations are selected, show price range
      setCurrentPrice(null);
      setCurrentStock(null);
      setSelectedPriceVariant(null);
    }
  };

  // Update price and stock when selected options change
  useEffect(() => {
    updatePriceAndStock(selectedOptions);
  }, [selectedOptions]);
  /**
   * Menangani pemilihan opsi variasi produk
   * @param variationId - ID variasi yang dipilih (warna, ukuran, dll)
   * @param optionId - ID opsi yang dipilih dalam variasi tersebut
   *
   * Fitur:
   * - Toggle pilihan jika opsi yang sama dipilih
   * - Update tampilan gambar jika opsi memiliki gambar
   * - Sinkronisasi dengan carousel gambar
   * - Update harga dan stok berdasarkan kombinasi variasi
   */
  const handleOptionSelect = (variationId: string, optionId: string) => {
    const newSelectedOptions = { ...selectedOptions };

    // If clicking the same option, deselect it
    if (selectedOptions[variationId] === optionId) {
      delete newSelectedOptions[variationId];
    } else {
      // Otherwise select the new option
      newSelectedOptions[variationId] = optionId;

      // If this is the first variation and it has an image, scroll to it
      const imageMapKey = `${variationId}-${optionId}`;
      if (
        product?.variations[0]?.id === variationId &&
        variationImageMap[imageMapKey] !== undefined
      ) {
        const imageIndex = variationImageMap[imageMapKey];
        firstCarouselApi?.scrollTo(imageIndex);
      }
    }

    setSelectedOptions(newSelectedOptions);
  };
  /**
   * Mengubah jumlah produk yang akan dibeli
   * @param value - Jumlah produk baru
   *
   * Validasi:
   * - Minimal 1 produk
   * - Tidak melebihi stok yang tersedia
   * - Update UI secara responsif
   */
  const handleQuantityChange = (value: number) => {
    if (value >= 1 && (currentStock === null || value <= currentStock)) {
      setQuantity(value);
    }
  };
  /**
   * Menangani penambahan produk ke keranjang
   *
   * Validasi:
   * 1. Status login pengguna
   * 2. Ketersediaan produk
   * 3. Pemilihan variasi lengkap
   * 4. Stok mencukupi
   *
   * Fitur:
   * - Feedback visual melalui toast notification
   * - Validasi stok realtime
   * - Penanganan error
   */
  const handleAddToCart = async () => {
    try {
      // Check if user is logged in
      if (!currentUser) {
        toast({
          title: "Login Diperlukan",
          description: "Silakan login untuk menambahkan produk ke keranjang.",
        });
        return;
      }

      // Check if product is loaded
      if (!product) {
        toast({
          variant: "destructive",
          title: "Produk tidak tersedia",
          description: "Produk tidak dapat ditambahkan ke keranjang.",
        });
        return;
      }

      // Check if all required variations are selected
      if (
        product.hasVariations &&
        Object.keys(selectedOptions).length !== product.variations.length
      ) {
        toast({
          variant: "destructive",
          title: "Pilih variasi",
          description: "Silakan pilih semua variasi produk terlebih dahulu.",
        });
        return;
      }

      // Check if there's enough stock
      if (currentStock !== null && quantity > currentStock) {
        toast({
          variant: "destructive",
          title: "Stok tidak cukup",
          description: `Hanya tersedia ${currentStock} item.`,
        });
        return;
      }

      await addItem({
        productId: product.id,
        priceVariantId: selectedPriceVariant?.id,
        quantity,
      });

      toast({
        title: "Produk ditambahkan",
        description: "Produk telah ditambahkan ke keranjang.",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        variant: "destructive",
        title: "Gagal menambahkan ke keranjang",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menambahkan produk ke keranjang.",
      });
    }
  };

  // Helper to render price range - already properly handling equal min/max prices
  const renderPrice = () => {
    if (!product?.hasVariations) {
      return formatRupiah(product?.basePrice || 0);
    }

    if (currentPrice !== null) {
      return formatRupiah(currentPrice);
    }

    // Get all possible prices based on current selection
    const allPrices = product.priceVariants.map((variant) => variant.price);

    if (allPrices.length === 0) return formatRupiah(0);

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);

    // If min and max prices are the same, show only one price
    if (minPrice === maxPrice) {
      return formatRupiah(minPrice);
    } else {
      // Otherwise show price range
      return `${formatRupiah(minPrice)} - ${formatRupiah(maxPrice)}`;
    }
  };

  // Display product price using our utility function
  const displayPrice = product ? getProductPriceDisplay(product) : "";

  // Error handling
  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-lg font-medium">Produk Tidak Ditemukan</h3>
          <p className="text-muted-foreground mt-2">{error.message}</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/produk">Kembali ke Produk</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // No product data
  if (!product) {
    return <div className="container mx-auto p-6">Product not found</div>;
  }

  // Main render with product data
  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Beranda</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/produk">Produk</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Main Product Section */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image Carousel Section - Using allImages */}
        <div className="w-full md:w-[400px] md:flex-shrink-0">
          <div className="sticky top-6">
            <Card className="p-3 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <Carousel className="w-full" setApi={setFirstCarouselApi}>
                <CarouselContent>
                  {allImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-square">
                        <Image
                          src={image.url}
                          alt={
                            image.alt ||
                            `${product.name || "Product"} - ${index + 1}`
                          }
                          fill
                          className="object-cover rounded-lg"
                          sizes="450px"
                          priority={index === 0}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="absolute top-1/2 left-[1px] flex items-center justify-center">
                  <CarouselPrevious className="relative left-0 translate-x-0 hover:translate-x-0 size-10" />
                </div>
                <div className="absolute top-1/2 right-[1px] flex items-center justify-center">
                  <CarouselNext className="relative right-0 translate-x-0 hover:translate-x-0 size-10" />
                </div>
              </Carousel>

              {/* Thumbnails with variation images */}
              <div className="mt-3">
                <Carousel
                  opts={{
                    align: "start",
                  }}
                  setApi={setSecondCarouselApi}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2">
                    {allImages.map((image, index) => {
                      // Create a label for the thumbnail
                      let thumbnailLabel = `Thumbnail ${index + 1}`;

                      // Check if this is a variation image
                      const isVariationImage = Object.entries(
                        variationImageMap
                      ).find(([key, idx]) => idx === index);

                      if (isVariationImage) {
                        const [variationOptionKey] = isVariationImage;
                        const [variationId, optionId] =
                          variationOptionKey.split("-");
                        const variation = product?.variations.find(
                          (v) => v.id === variationId
                        );
                        const option = variation?.options.find(
                          (o) => o.id === optionId
                        );

                        if (option) {
                          thumbnailLabel = `Variasi: ${option.name}`;
                        }
                      }

                      return (
                        <CarouselItem className="basis-1/5 pl-2" key={index}>
                          <button
                            onClick={() => firstCarouselApi?.scrollTo(index)}
                            className={cn(
                              "relative m-1 w-16 h-16 flex-shrink-0 rounded-md overflow-hidden",
                              current === index
                                ? "ring-2 ring-primary"
                                : "ring-1 ring-muted hover:ring-primary/50",
                              // Add visual indicator for variation images
                              isVariationImage
                                ? "border-dashed border-2 border-primary/50"
                                : ""
                            )}
                            title={thumbnailLabel}
                          >
                            <Image
                              src={image.url}
                              alt={thumbnailLabel}
                              fill
                              className="object-cover"
                            />
                          </button>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                </Carousel>
              </div>
            </Card>
          </div>
        </div>

        {/* Product Info Section */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Product Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{product.name}</h1>
              {product.specialLabel && (
                <Badge variant="secondary">{product.specialLabel}</Badge>
              )}
            </div>
            <div className="text-2xl font-semibold text-primary">
              {renderPrice()}
            </div>
          </div>

          <Separator className="my-3" />

          {/* Product Options */}
          {product.hasVariations && (
            <div
              className={cn(
                "space-y-4",
                product.variations.length === 1 && "space-y-3"
              )}
            >
              {product.variations.map((variation) => (
                <div key={variation.id} className="space-y-2">
                  <h3 className="font-medium">{variation.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {variation.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() =>
                          handleOptionSelect(variation.id, option.id)
                        }
                        className={cn(
                          "flex flex-col items-center border rounded-lg p-2 transition-colors min-w-[5rem]",
                          selectedOptions[variation.id] === option.id
                            ? "border-primary bg-primary/5"
                            : "border-input hover:border-primary",
                          "focus:outline-none focus:ring-2 focus:ring-primary/20"
                        )}
                        aria-label={`Option: ${option.name}`}
                      >
                        {option.imageUrl && (
                          <div className="relative w-14 h-14 mb-1">
                            <Image
                              src={option.imageUrl}
                              alt={option.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        )}
                        <span className="text-sm">{option.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-2">
            <h3 className="font-medium">Jumlah</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={
                    quantity <= 1 ||
                    (currentStock !== null && quantity > currentStock)
                  }
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    handleQuantityChange(parseInt(e.target.value) || 1)
                  }
                  className="w-20 text-center mx-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="1"
                  max={currentStock || undefined}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={currentStock !== null && quantity >= currentStock}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                Stok: {currentStock !== null ? currentStock : "Pilih variasi"}
              </span>
            </div>
          </div>

          {/* Add to Cart */}
          <Button
            className="w-full sm:w-auto mt-4"
            size="lg"
            onClick={handleAddToCart}
            disabled={
              (product.hasVariations &&
                Object.keys(selectedOptions).length !==
                  product.variations.length) ||
              !currentStock ||
              quantity > (currentStock || 0)
            }
          >
            <ShoppingCartIcon className="mr-2 h-5 w-5" />
            {product.hasVariations &&
            Object.keys(selectedOptions).length !== product.variations.length
              ? "Pilih Variasi"
              : "Tambah ke Keranjang"}
          </Button>
        </div>
      </div>

      {/* Description Section */}
      <Card>
        <div className="px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Deskripsi Produk</h2>
        </div>
        <div className="p-4">
          <div
            className={cn(
              "prose max-w-none relative",
              !isDescriptionExpanded && "max-h-[300px] overflow-hidden"
            )}
          >
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description || "" }}
            />
            {!isDescriptionExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
            )}
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          >
            {isDescriptionExpanded ? "Tutup" : "Baca Selengkapnya"}
          </Button>
        </div>
      </Card>

      {/* Related Products Section */}
      <RelatedProducts
        currentProductId={product.id || ""}
        categoryId={product.categoryId}
        collectionId={product.collectionId}
      />

      <Footer />
    </div>
  );
}
