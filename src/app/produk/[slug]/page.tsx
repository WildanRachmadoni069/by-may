"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ProductFormValues } from "@/types/product";
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
import { MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ProductDetail() {
  const [product, setProduct] = useState<ProductFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [currentStock, setCurrentStock] = useState<number | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const q = query(collection(db, "products"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const productData = querySnapshot.docs[0].data() as ProductFormValues;
          setProduct(productData);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const generateVariationKey = (
    selectedOpts: Record<string, string>
  ): string => {
    if (!product?.variations.length) return "";

    // For double variations, we need to combine both variation IDs
    // Format: "variation1Id-option1Id-option2Id"
    if (product.variations.length === 2) {
      const firstVariation = product.variations[0];
      const secondVariation = product.variations[1];

      const firstOptionId = selectedOpts[firstVariation.id];
      const secondOptionId = selectedOpts[secondVariation.id];

      if (!firstOptionId || !secondOptionId) return "";

      return `${firstVariation.id}-${firstOptionId}-${secondOptionId}`;
    }

    // Single variation case (existing logic)
    const selectedVariation = product.variations[0];
    const selectedOptionId = selectedOpts[selectedVariation.id];

    if (!selectedOptionId) return "";
    return `${selectedVariation.id}-${selectedOptionId}`;
  };

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
      const key = generateVariationKey(selectedOpts);
      console.log("Generated variation key:", key);

      const variation = product.variationPrices[key];
      if (variation) {
        setCurrentPrice(variation.price);
        setCurrentStock(variation.stock);
        console.log("Found variation price:", variation);
      } else {
        setCurrentPrice(null);
        setCurrentStock(null);
        console.log("No matching variation found for key:", key);
      }
    } else {
      // If not all variations are selected, show price range
      setCurrentPrice(null);
      setCurrentStock(null);
      console.log("Not all variations selected:", selectedOpts);
    }
  };

  useEffect(() => {
    updatePriceAndStock(selectedOptions);
    // Debug logs
    console.log("Selected Options:", selectedOptions);
    console.log("Current Price:", currentPrice);
    console.log("Available Variations:", product?.variationPrices);
  }, [selectedOptions]);

  const handleOptionSelect = (variationId: string, optionId: string) => {
    const newSelectedOptions = { ...selectedOptions };

    // If clicking the same option, deselect it
    if (selectedOptions[variationId] === optionId) {
      delete newSelectedOptions[variationId];
    } else {
      // Otherwise select the new option
      newSelectedOptions[variationId] = optionId;
    }

    setSelectedOptions(newSelectedOptions);
  };

  const handleQuantityChange = (value: number) => {
    if (value >= 1) setQuantity(value);
  };

  const renderPrice = () => {
    if (!product?.hasVariations) {
      return formatRupiah(product?.basePrice || 0);
    }

    if (currentPrice !== null) {
      return formatRupiah(currentPrice);
    }

    // Get all possible prices based on current selection
    const allPrices = Object.entries(product.variationPrices).map(
      ([key, value]) => value.price
    );

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);

    return `${formatRupiah(minPrice)} - ${formatRupiah(maxPrice)}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!product) {
    return <div className="container mx-auto p-6">Product not found</div>;
  }

  const images = [
    product.mainImage,
    ...(product.additionalImages?.filter(Boolean) || []),
  ].filter((img): img is string => Boolean(img));

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Main Product Section - Updated Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Image Carousel Section - Fixed Width */}
        <div className="w-full md:w-[450px] md:flex-shrink-0">
          <div className="sticky top-6">
            <Card className="p-4 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <Carousel className="w-full" setApi={setApi}>
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-square">
                        <Image
                          src={image}
                          alt={`${product.name} - ${index + 1}`}
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
                  <CarouselPrevious className="relative left-0 translate-x-0 hover:translate-x-0" />
                </div>
                <div className="absolute top-1/2 right-[1px] flex items-center justify-center">
                  <CarouselNext className="relative right-0 translate-x-0 hover:translate-x-0" />
                </div>
              </Carousel>

              {/* Thumbnails */}
              <div className="mt-4">
                <div className="flex space-x-2 overflow-x-auto py-2 px-1">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => api?.scrollTo(index)}
                      className={cn(
                        "relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden", // Reduce thumbnail size
                        current === index
                          ? "ring-2 ring-primary"
                          : "ring-1 ring-muted hover:ring-primary/50"
                      )}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Updated Product Info Section */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Product Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              {product.specialLabel && (
                <Badge variant="secondary">{product.specialLabel}</Badge>
              )}
            </div>
            <div className="text-3xl font-semibold text-primary">
              {renderPrice()}
            </div>
          </div>

          <Separator />

          {/* Product Options */}
          {product.hasVariations && (
            <div className="space-y-6">
              {product.variations.map((variation) => (
                <div key={variation.id} className="space-y-3">
                  <h3 className="font-medium text-lg">{variation.name}</h3>
                  <div className="flex flex-wrap gap-3">
                    {variation.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() =>
                          handleOptionSelect(variation.id, option.id)
                        }
                        className={cn(
                          "flex flex-col items-center border rounded-lg p-3 transition-colors",
                          selectedOptions[variation.id] === option.id
                            ? "border-primary bg-primary/5"
                            : "border-input hover:border-primary",
                          "focus:outline-none focus:ring-2 focus:ring-primary/20" // Menambah fokus indikator
                        )}
                      >
                        {option.imageUrl && (
                          <div className="relative w-16 h-16 mb-2">
                            <Image
                              src={option.imageUrl}
                              alt={option.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        )}
                        <span className="text-sm font-medium">
                          {option.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Jumlah</h3>
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
              <span className="text-muted-foreground text-sm">
                Stok:{" "}
                {currentStock !== null
                  ? currentStock
                  : product.baseStock || "Pilih variasi"}
              </span>
            </div>
          </div>

          {/* Add to Cart Section */}
          <div className="space-y-4 pt-4">
            <Button
              className="w-full"
              size="lg"
              disabled={
                (product.hasVariations &&
                  Object.keys(selectedOptions).length !==
                    product.variations.length) ||
                !currentStock ||
                quantity > currentStock
              }
            >
              <ShoppingCartIcon className="mr-2 h-5 w-5" />
              {product.hasVariations &&
              Object.keys(selectedOptions).length !== product.variations.length
                ? "Pilih Variasi"
                : "Tambah ke Keranjang"}
            </Button>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Pengiriman</h4>
                <p className="text-muted-foreground">
                  Berat: {product.weight} gram
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Dimensi</h4>
                <p className="text-muted-foreground">
                  {product.dimensions.length} × {product.dimensions.width} ×{" "}
                  {product.dimensions.height} cm
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Updated Description Section */}
      <Card className="mt-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Deskripsi Produk</h2>
        </div>
        <div className="p-6">
          <div
            className={cn(
              "prose max-w-none relative",
              !isDescriptionExpanded && "max-h-[300px] overflow-hidden"
            )}
          >
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
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
    </div>
  );
}
