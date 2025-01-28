import { useState, useEffect } from "react";
import { ProductFormValues } from "@/types/product";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, SPECIAL_LABELS } from "@/constants/product";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Check } from "lucide-react";

interface ProductPreviewProps {
  data: ProductFormValues;
  className?: string;
}

export function ProductPreview({ data, className }: ProductPreviewProps) {
  const [selectedVariations, setSelectedVariations] = useState<
    Record<string, string>
  >({});
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();

  // Images array including main and additional images
  const images = [data.mainImage, ...(data.additionalImages || [])].filter(
    (img): img is string => Boolean(img)
  );

  // Find category and special label
  const category = CATEGORIES.find((c) => c.value === data.category);
  const specialLabel = SPECIAL_LABELS.find(
    (l) => l.value === data.specialLabel
  );

  // Get selected variation image if available
  const selectedFirstVariationOption = data.variations[0]?.options.find(
    (opt) => opt.id === selectedVariations[data.variations[0]?.id]
  );

  // Handle variation selection
  const handleVariationSelect = (variationId: string, optionId: string) => {
    setSelectedVariations((prev) => {
      const newVariations = { ...prev };

      // If option is already selected, unselect it
      if (prev[variationId] === optionId) {
        delete newVariations[variationId];
      } else {
        // Otherwise select it
        newVariations[variationId] = optionId;
      }

      return newVariations;
    });

    // Only scroll to first image if selecting an option with image
    if (variationId === data.variations[0]?.id) {
      mainApi?.scrollTo(0);
      setCurrent(0);
    }
  };

  // Get price based on selected variations
  const getSelectedPrice = () => {
    if (!data.hasVariations) return formatRupiah(data.basePrice || 0);

    const allVariationsSelected = data.variations.every(
      (v) => selectedVariations[v.id]
    );

    if (!allVariationsSelected) {
      return `${formatRupiah(
        Math.min(...Object.values(data.variationPrices).map((v) => v.price))
      )} - ${formatRupiah(
        Math.max(...Object.values(data.variationPrices).map((v) => v.price))
      )}`;
    }

    const combinationId = data.variations
      .map((v) => `${v.id}-${selectedVariations[v.id]}`)
      .join("-");
    return formatRupiah(data.variationPrices[combinationId]?.price || 0);
  };

  // Separate product images and variation image
  const productImages = [
    data.mainImage,
    ...(data.additionalImages || []),
  ].filter((img): img is string => Boolean(img));

  // Get variation image if exists
  const variationImage = selectedFirstVariationOption?.imageUrl;

  // Sync carousels
  useEffect(() => {
    if (!mainApi || !thumbApi) return;

    mainApi.on("select", () => {
      setCurrent(mainApi.selectedScrollSnap());
      thumbApi.scrollTo(mainApi.selectedScrollSnap());
    });

    // Reset current index when images change
    setCurrent(0);
  }, [mainApi, thumbApi, selectedFirstVariationOption]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Preview Produk</CardTitle>
        <CardDescription>Tampilan produk setelah dipublish</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Gallery with Thumbnails */}
          <div className="space-y-2">
            {" "}
            {/* Reduced space between carousels */}
            {productImages.length > 0 ? (
              <>
                {/* Main Carousel - Show both product and variation images */}
                <div className="overflow-hidden rounded-lg">
                  <Carousel
                    setApi={setMainApi}
                    className="w-full"
                    opts={{
                      startIndex: current,
                    }}
                  >
                    <CarouselContent>
                      {/* Show variation image first if exists */}
                      {variationImage && (
                        <CarouselItem key="variation-image">
                          <div className="relative aspect-square">
                            <img
                              src={variationImage}
                              alt="Variation view"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        </CarouselItem>
                      )}
                      {/* Then show product images */}
                      {productImages.map((image, index) => (
                        <CarouselItem key={`main-${index}-${image}`}>
                          <div className="relative aspect-square">
                            <img
                              src={image}
                              alt={`Product view ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </div>

                {/* Thumbnail Carousel - Only show product images */}
                <div className="overflow-hidden">
                  <Carousel
                    setApi={setThumbApi}
                    opts={{
                      align: "start",
                      dragFree: true,
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-1">
                      {productImages.map((image, index) => (
                        <CarouselItem
                          key={`thumb-${index}-${image}`}
                          className="basis-1/5 pl-1"
                        >
                          {" "}
                          {/* Changed to 1/5 for smaller thumbnails */}
                          <div
                            role="button"
                            onClick={() => {
                              // Adjust index if variation image exists
                              const targetIndex = variationImage
                                ? index + 1
                                : index;
                              mainApi?.scrollTo(targetIndex);
                              setCurrent(targetIndex);
                            }}
                            className={cn(
                              "relative aspect-square rounded-md overflow-hidden cursor-pointer",
                              "hover:opacity-80 transition-all duration-200",
                              "ring-offset-2",
                              // Adjust current check if variation image exists
                              current === (variationImage ? index + 1 : index)
                                ? "ring-2 ring-primary opacity-100"
                                : "opacity-60 hover:ring-2 hover:ring-primary/50"
                            )}
                          >
                            <img
                              src={image}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div
                              className={cn(
                                "absolute inset-0 bg-black/20 transition-opacity",
                                current === (variationImage ? index + 1 : index)
                                  ? "opacity-0"
                                  : "opacity-100"
                              )}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
              </>
            ) : (
              <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No images</p>
              </div>
            )}
          </div>

          {/* Product Details with Interactive Variations */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex gap-2">
                {specialLabel && (
                  <Badge variant="secondary">{specialLabel.label}</Badge>
                )}
                {category && <Badge variant="outline">{category.label}</Badge>}
              </div>
              <h3 className="text-2xl font-semibold">{data.name}</h3>
              <div className="text-xl font-bold">{getSelectedPrice()}</div>
            </div>

            {data.hasVariations && data.variations.length > 0 && (
              <div className="space-y-4">
                {data.variations.map((variation, index) => (
                  <div key={variation.id} className="space-y-2">
                    <p className="font-medium">{variation.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {variation.options.map((option) => (
                        <Button
                          key={option.id}
                          variant="outline"
                          className={cn(
                            "relative h-auto min-h-[2.5rem] px-3 py-2",
                            selectedVariations[variation.id] === option.id && [
                              "border-primary",
                              "ring-1",
                              "ring-primary",
                            ]
                          )}
                          onClick={() =>
                            handleVariationSelect(variation.id, option.id)
                          }
                        >
                          <div className="flex items-center gap-2">
                            {index === 0 && option.imageUrl && (
                              <img
                                src={option.imageUrl}
                                alt={option.name}
                                className="w-6 h-6 rounded object-cover"
                              />
                            )}
                            <span>{option.name}</span>
                          </div>
                          {selectedVariations[variation.id] === option.id && (
                            <Check className="absolute top-1 right-1 h-3 w-3 text-primary" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <p className="font-medium">Stock</p>
              <p>
                {data.hasVariations
                  ? Object.values(data.variationPrices).reduce(
                      (acc, curr) => acc + curr.stock,
                      0
                    )
                  : data.baseStock}{" "}
                unit
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Product Description and Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h4 className="font-medium mb-2">Deskripsi Produk</h4>
            <ScrollArea className="h-[200px]">
              <div className="whitespace-pre-wrap">{data.description}</div>
            </ScrollArea>
          </div>
          <div>
            <h4 className="font-medium mb-2">Informasi Pengiriman</h4>
            <div className="space-y-1 text-sm">
              <p>Berat: {data.weight} gram</p>
              <p>Dimensi:</p>
              <ul className="list-disc list-inside pl-2">
                <li>Panjang: {data.dimensions.length} cm</li>
                <li>Lebar: {data.dimensions.width} cm</li>
                <li>Tinggi: {data.dimensions.height} cm</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
