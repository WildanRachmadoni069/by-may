"use client";
import React from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

function ProductSidebar() {
  const [sortBy, setSortBy] = React.useState("a-z");
  const [categories, setCategories] = React.useState("all");
  const [priceSort, setPriceSort] = React.useState("highest");
  return (
    <aside>
      <h3 className="font-bold text-lg mb-4">Filter & Urutkan</h3>
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Urutkan</h4>
        <RadioGroup value={sortBy} onValueChange={setSortBy}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="a-z" id="sort-a-z" />
            <Label htmlFor="sort-a-z">A-Z</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="z-a" id="sort-z-a" />
            <Label htmlFor="sort-z-a">Z-A</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="newest" id="sort-newest" />
            <Label htmlFor="sort-newest">Terbaru</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="oldest" id="sort-oldest" />
            <Label htmlFor="sort-oldest">Terlama</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-2">Kategori</h4>
        <RadioGroup value={categories} onValueChange={setCategories}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="categorie-all" />
            <Label htmlFor="categorie-all">Semua</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="may quran" id="categorie-quran" />
            <Label htmlFor="categorie-quran">May Quran</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="may gift" id="categorie-gift" />
            <Label htmlFor="categorie-gift">May Gift</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="may prayer" id="categorie-prayer" />
            <Label htmlFor="categorie-prayer">May Prayer</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-2">Harga</h4>
        <RadioGroup value={priceSort} onValueChange={setPriceSort}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="highest" id="price-highest" />
            <Label htmlFor="price-highest">Termahal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="lowest" id="price-lowest" />
            <Label htmlFor="price-lowest">Termurah</Label>
          </div>
        </RadioGroup>
      </div>

      <Button className="w-full">Terapkan Filter</Button>
    </aside>
  );
}

export default ProductSidebar;
