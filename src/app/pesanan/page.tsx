import { Metadata } from "next";
import { Construction } from "lucide-react";

export const metadata: Metadata = {
  title: "Pesanan Saya - bymayscarf",
  description: "Halaman pesanan saya sedang dalam tahap pengembangan.",
};

export default function OrdersPage() {
  return (
    <div className="min-h-[50vh] container px-4 py-16 mx-auto flex flex-col items-center justify-center text-center">
      <Construction className="w-16 h-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-semibold mb-2">Dalam Pengembangan</h1>
      <p className="text-muted-foreground max-w-md">
        Fitur ini sedang dalam tahap pengembangan. Silakan kembali lagi nanti.
      </p>
    </div>
  );
}
