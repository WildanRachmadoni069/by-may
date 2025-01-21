"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Apa itu Al-Qur'an custom cover dari Bymay?",
    answer:
      "Al-Qur'an custom cover dari Bymay adalah Al-Qur'an dengan desain sampul yang dapat disesuaikan sesuai keinginan Anda. Kami menawarkan berbagai pilihan desain, warna, dan bahan untuk membuat Al-Qur'an Anda menjadi unik dan bermakna. Setiap Al-Qur'an custom kami diproduksi dengan standar kualitas tinggi namun tetap dengan harga terjangkau di Surabaya dan sekitarnya.",
  },
  {
    question: "Bagaimana cara memesan Al-Qur'an custom cover di website Bymay?",
    answer:
      "Untuk memesan Al-Qur'an custom cover di website Bymay, ikuti langkah-langkah berikut: 1) Pilih produk Al-Qur'an custom di halaman produk kami. 2) Klik 'Customisasi' dan pilih desain, warna, dan bahan yang Anda inginkan. 3) Tambahkan ke keranjang dan lanjutkan ke pembayaran. 4) Isi detail pengiriman dan pilih metode pembayaran. 5) Selesaikan pesanan dan tunggu konfirmasi dari tim kami. Kami akan mengirimkan proof desain untuk persetujuan Anda sebelum produksi dimulai.",
  },
  {
    question: "Berapa lama waktu pengerjaan untuk Al-Qur'an custom cover?",
    answer:
      "Waktu pengerjaan Al-Qur'an custom cover kami biasanya memakan waktu 7-14 hari kerja, tergantung pada kompleksitas desain dan volume pesanan saat itu. Kami selalu berusaha untuk menyelesaikan pesanan secepat mungkin tanpa mengorbankan kualitas. Untuk pengiriman di area Surabaya, biasanya membutuhkan waktu tambahan 1-2 hari kerja.",
  },
  {
    question: "Apakah Bymay menyediakan layanan pengiriman ke luar Surabaya?",
    answer:
      "Ya, Bymay menyediakan layanan pengiriman ke seluruh Indonesia. Meskipun kami berbasis di Surabaya dan menawarkan harga terjangkau untuk area ini, kami juga melayani pengiriman ke kota-kota lain dengan biaya tambahan sesuai jarak dan berat paket. Kami bekerja sama dengan beberapa jasa ekspedisi terpercaya untuk memastikan produk Anda sampai dengan aman dan tepat waktu.",
  },
  {
    question:
      "Apa saja jenis perlengkapan ibadah yang tersedia di Bymay selain Al-Qur'an?",
    answer:
      "Selain Al-Qur'an custom cover, Bymay menyediakan berbagai perlengkapan ibadah berkualitas dengan harga terjangkau, termasuk: 1) Sajadah premium dengan berbagai motif dan ukuran. 2) Tasbih dari berbagai bahan seperti kayu, batu, dan kristal. 3) Hampers Islami untuk berbagai kesempatan seperti Ramadhan, Hari Raya, pernikahan, dan aqiqah. 4) Buku-buku Islami dan alat bantu belajar mengaji. 5) Perlengkapan sholat lainnya seperti mukena dan peci. Semua produk kami dipilih dengan teliti untuk memastikan kualitas terbaik bagi pelanggan kami di Surabaya dan seluruh Indonesia.",
  },
  {
    question: "Bagaimana cara merawat Al-Qur'an custom cover agar tetap awet?",
    answer:
      "Untuk merawat Al-Qur'an custom cover agar tetap awet, ikuti tips berikut: 1) Simpan di tempat yang sejuk dan kering, jauh dari sinar matahari langsung. 2) Gunakan tangan yang bersih saat memegang Al-Qur'an. 3) Hindari meletakkan benda berat di atasnya. 4) Bersihkan cover secara berkala dengan kain lembut yang sedikit dibasahi. 5) Gunakan pembatas buku yang tipis untuk menandai halaman. 6) Jika tidak digunakan, simpan dalam kotak atau sarung Al-Qur'an yang kami sediakan. Dengan perawatan yang baik, Al-Qur'an custom cover Anda akan tetap indah dan tahan lama.",
  },
  {
    question:
      "Apakah Bymay menerima pesanan dalam jumlah besar untuk acara atau lembaga?",
    answer:
      "Ya, Bymay menerima pesanan dalam jumlah besar untuk berbagai keperluan seperti acara pernikahan, aqiqah, corporate gift, atau lembaga pendidikan dan masjid. Kami menawarkan harga khusus yang lebih terjangkau untuk pemesanan dalam jumlah besar. Tim kami siap membantu Anda merancang Al-Qur'an custom cover atau perlengkapan ibadah lainnya sesuai dengan tema acara atau kebutuhan lembaga Anda. Hubungi kami untuk mendapatkan penawaran khusus dan konsultasi gratis.",
  },
  {
    question: "Bagaimana kebijakan pengembalian dan garansi produk Bymay?",
    answer:
      "Bymay berkomitmen untuk memberikan produk berkualitas dan kepuasan pelanggan. Kebijakan kami meliputi: 1) Garansi 7 hari untuk cacat produksi pada semua produk. 2) Pengembalian dana penuh atau penggantian produk jika terjadi kesalahan dari pihak kami. 3) Untuk Al-Qur'an custom cover, kami akan mengirimkan proof desain sebelum produksi untuk memastikan kepuasan Anda. 4) Produk yang rusak dalam pengiriman akan kami ganti dengan yang baru. Syarat dan ketentuan berlaku, dan kami selalu berusaha untuk menyelesaikan setiap masalah dengan solusi terbaik bagi pelanggan kami di Surabaya dan seluruh Indonesia.",
  },
];

export default function FAQPage() {
  return (
    <main className="container px-4 py-8">
      <h1 className="text-4xl font-bold mb-4 text-center">
        Pertanyaan yang Sering Diajukan (FAQ)
      </h1>
      <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
        Temukan jawaban atas pertanyaan umum seputar produk Al-Qur'an custom
        cover, perlengkapan ibadah, dan layanan Bymay. Kami berkomitmen untuk
        memberikan informasi yang jelas dan membantu Anda mendapatkan produk
        berkualitas dengan harga terjangkau di Surabaya dan seluruh Indonesia.
      </p>

      <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">
          Masih punya pertanyaan? Jangan ragu untuk menghubungi kami.
        </p>
        <a
          href="mailto:info@bymay.com"
          className="text-blue-600 hover:underline"
        >
          info@bymay.com
        </a>
      </div>
    </main>
  );
}
