"use client";
import { ProductForm } from "@/components/admin/product/ProductForm";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from "react";

function Page() {
  return (
    <div>
      <h1>Add Product</h1>
      <ProductForm />
    </div>
  );
}

export default Page;
