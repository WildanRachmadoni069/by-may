"use client";

import { FaqForm } from "@/components/admin/faq/FaqForm";
import { Separator } from "@/components/ui/separator";

export default function AddFaqPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Tambah FAQ Baru</h3>
        <p className="text-sm text-muted-foreground">
          Tambahkan pertanyaan yang sering diajukan dan jawabannya untuk
          membantu pelanggan.
        </p>
      </div>
      <Separator />
      <FaqForm />
    </div>
  );
}
