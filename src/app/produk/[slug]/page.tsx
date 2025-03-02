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
import { useCartStore } from "@/store/useCartStore";
import { toast } from "@/hooks/use-toast";
import { isLegacyTimestampId } from "@/lib/utils";

export default function ProductDetail() {
  const [product, setProduct] = useState<ProductFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();
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
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const q = query(collection(db, "products"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          // Include document ID in the product data
          const productData = {
            ...doc.data(),
            id: doc.id,
          } as ProductFormValues & { id: string };

          setProduct(productData);

          // Initialize with default price and stock if no variations
          if (!productData.hasVariations) {
            setCurrentPrice(productData.basePrice || 0);
            setCurrentStock(productData.baseStock || 0);
          }
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

      return `${firstVariation.id}-${firstOptionId}-${secondOptionId}`;
    }

    // Single variation case
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

  const handleAddToCart = async () => {
    if (!product) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Product tidak ditemukan",
      });
      return;
    }

    // Validate product has an ID
    if (!product.id) {
      console.error("Product ID missing:", product);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Product ID tidak ditemukan",
      });
      return;
    }

    // For products with variations, ensure a variation is selected
    if (product.hasVariations) {
      const allVariationsSelected = product.variations.every(
        (variation) => selectedOptions[variation.id]
      );

      if (!allVariationsSelected || !currentPrice) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Silakan pilih variasi produk terlebih dahulu",
        });
        return;
      }
    }

    const variationKey = product.hasVariations
      ? generateVariationKey(selectedOptions)
      : undefined;

    // Get variation image if available
    let variationImage: string | undefined;
    if (product.hasVariations && product.variations.length > 0) {
      const firstVariation = product.variations[0];
      const selectedOptionId = selectedOptions[firstVariation.id];
      if (selectedOptionId) {
        const selectedOption = firstVariation.options.find(
          (option) => option.id === selectedOptionId
        );
        variationImage = selectedOption?.imageUrl;
      }
    }

    // Create a valid cart item
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: currentPrice || product.basePrice || 0,
      quantity: quantity,
      image: product.mainImage || "",
      variationImage, // Add variation image if available
      selectedOptions: product.hasVariations
        ? Object.entries(selectedOptions).reduce((acc, [varId, optId]) => {
            // Map variation IDs to names for better display
            const variation = product.variations.find((v) => v.id === varId);
            if (!variation) return acc;

            const option = variation.options.find((o) => o.id === optId);
            if (!option) return acc;

            return { ...acc, [variation.name]: option.name };
          }, {})
        : undefined,
      variationKey,
    };

    try {
      console.log("Adding to cart:", cartItem);
      await addToCart(cartItem);
      toast({
        title: "Berhasil",
        description: "Produk berhasil ditambahkan ke keranjang",
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menambahkan produk ke keranjang",
      });
    }
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
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      {/* Main Product Section */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image Carousel Section - Slightly reduced width */}
        <div className="w-full md:w-[400px] md:flex-shrink-0">
          <div className="sticky top-6">
            <Card className="p-3 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <Carousel className="w-full" setApi={setFirstCarouselApi}>
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
                  <CarouselPrevious className="relative left-0 translate-x-0 hover:translate-x-0 size-10" />
                </div>
                <div className="absolute top-1/2 right-[1px] flex items-center justify-center">
                  <CarouselNext className="relative right-0 translate-x-0 hover:translate-x-0 size-10" />
                </div>
              </Carousel>
              {/* Thumbnails with reduced margin */}
              <div className="mt-3">
                <Carousel
                  opts={{
                    align: "start",
                  }}
                  setApi={setSecondCarouselApi}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2">
                    {images.map((image, index) => (
                      <CarouselItem className="basis-1/5 pl-2" key={index}>
                        <button
                          key={index}
                          onClick={() => firstCarouselApi?.scrollTo(index)}
                          className={cn(
                            "relative m-1 w-16 h-16 flex-shrink-0 rounded-md overflow-hidden", // Reduce thumbnail size
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
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            </Card>
          </div>
        </div>

        {/* Product Info Section - Optimized spacing */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Product Header - Reduced spacing */}
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

          {/* Product Options - Added better labeling for variation options */}
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

          {/* Quantity Selector - Simplified */}
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

          {/* Add to Cart - Simplified */}
          <Button
            className="w-full sm:w-auto mt-4"
            size="lg"
            onClick={handleAddToCart}
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
        </div>
      </div>

      {/* Description Section - More compact */}
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
