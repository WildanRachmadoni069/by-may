/**
 * Halaman Tentang Kami
 * @module AboutPage
 * @description Menampilkan halaman tentang kami dengan:
 * - Profil dan sejarah perusahaan
 * - Visi dan misi
 * - Informasi lokasi dan kontak
 * - Gambar dan media pendukung
 * - Breadcrumb navigation
 */
import Image from "next/image";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Footer from "@/components/landingpage/Footer";

export default function TentangKami() {
  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0">
            <div className="absolute right-0 w-1/3 h-full bg-primary/5" />
            <div className="absolute right-0 w-1/3 h-full bg-[linear-gradient(to_left,transparent_0%,white_100%)]" />
          </div>

          {/* Breadcrumb */}
          <div className="container px-4 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Beranda</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Tentang Kami</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Content */}
          <div className="container px-4 py-8 lg:py-16">
            <div className="max-w-xl mx-auto text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary">
                Tentang Kami
              </h1>
            </div>

            <section className="relative grid md:grid-cols-2 gap-12 items-center mb-16">
              <div className="relative z-10">
                {/* Company story */}
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold mb-6 text-primary">
                    CV Faza Mega Berlian
                  </h2>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      Berawal dari sebuah pertemanan di bangku perkuliahan dan
                      kesamaan minat dalam dunia investasi melalui organisasi
                      mahasiswa, kami memulai perjalanan bisnis kami pada tahun
                      2021. Setelah mencoba berbagai bidang usaha mulai dari F&B
                      hingga fashion scarf (yang menginspirasi nama brand
                      ByMayScarf), kami menemukan peluang unik di industri
                      percetakan Al-Qur'an custom.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Kami menyadari bahwa produk custom umumnya diidentikkan
                      dengan harga premium. Namun, melalui inovasi operasional,
                      kami berhasil menciptakan produk Al-Qur'an custom yang
                      terjangkau namun tetap berkualitas premium. Bermula dari
                      Shopee, kini kami hadir di empat marketplace besar
                      Indonesia: Shopee, TikTokShop, Lazada, dan Tokopedia.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Pada tahun 2022, kami resmi mendirikan CV Faza Mega
                      Berlian dan memperluas lini produk kami. Tidak hanya
                      Al-Qur'an custom dengan berbagai varian ukuran dan desain,
                      kami juga mengembangkan produk packaging, hardbox,
                      softbox, serta perlengkapan ibadah lainnya seperti sajadah
                      custom, tasbih, dan hampers untuk berbagai kesempatan
                      seperti lebaran dan pernikahan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative rounded-xl overflow-hidden shadow-xl border-2 border-primary/20 group">
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Image
                    src="/img/about-us/about-us.webp"
                    alt="Kantor CV Faza Mega Berlian"
                    width={800}
                    height={800}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
        {/* Timeline Section */}
        <section className="py-16">
          <div className="container px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-primary">
              Perjalanan Kami
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="relative p-6 rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  2021
                </div>
                <p className="text-primary/80 text-center mt-4">
                  Awal mula brand ByMayScarf
                </p>
              </div>
              <div className="relative p-6 rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  2022
                </div>
                <p className="text-primary/80 text-center mt-4">
                  Pendirian CV Faza Mega Berlian
                </p>
              </div>
              <div className="relative p-6 rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  4
                </div>
                <p className="text-primary/80 text-center mt-4">
                  Marketplace Besar
                </p>
              </div>
              <div className="relative p-6 rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  100+
                </div>
                <p className="text-primary/80 text-center mt-4">
                  Varian Produk
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Vision & Mission Section */}
        <section className="py-16">
          <div className="container px-4">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="p-8 rounded-2xl border-2 border-primary/20">
                <h2 className="text-2xl font-bold mb-6 text-primary">
                  Visi Kami
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Menjadi pemimpin pasar Al-Qur'an dan kebutuhan ibadah muslim
                  dan muslimah yang memainstreamkan Al-Qur'an dan peralatan
                  ibadah custom di dunia. Kami berkomitmen untuk berkolaborasi,
                  memberdayakan, dan menyejahterakan orang-orang kurang
                  beruntung sambil memberikan pelayanan dan kualitas produk yang
                  terbaik.
                </p>
              </div>
              <div className="p-8 rounded-2xl border-2 border-primary/20">
                <h2 className="text-2xl font-bold mb-6 text-primary">
                  Misi Kami
                </h2>
                <ol className="list-decimal list-inside text-gray-700 space-y-4">
                  <li>
                    Aktif melakukan riset-riset untuk mengembangkan
                    produk-produk yang revolusioner dalam industri Al-Qur'an
                    custom dan perlengkapan ibadah.
                  </li>
                  <li>
                    Menciptakan ekosistem yang berkelanjutan dengan
                    berkolaborasi bersama para stakeholder perusahaan.
                  </li>
                  <li>
                    Menciptakan kondisi kerja terbaik bagi karyawan sebagai
                    wadah mereka untuk berkarya dan berprestasi.
                  </li>
                  <li>
                    Meningkatkan tanggung jawab kepada lingkungan dan komunitas
                    sebagai bentuk kontribusi sosial perusahaan.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>
        {/* Products Section */}
        <section className="py-16">
          <div className="container px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="relative h-[300px] rounded-lg overflow-hidden mb-4 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                  <Image
                    src="/img/about-us/al-quran-custom-cover.webp"
                    alt="Al-Qur'an Custom Cover"
                    layout="fill"
                    objectFit="cover"
                    className="hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">
                  Al-Qur'an Custom Cover
                </h3>
                <p className="text-primary/80">
                  Desain unik yang mencerminkan kepribadian Anda
                </p>
              </div>
              <div className="text-center">
                <div className="relative h-[300px] rounded-lg overflow-hidden mb-4 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                  <Image
                    src="/img/about-us/sajadah-premium.webp"
                    alt="Sajadah Premium"
                    layout="fill"
                    objectFit="cover"
                    className="hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">
                  Sajadah Premium
                </h3>
                <p className="text-primary/80">Kenyamanan dalam setiap sujud</p>
              </div>
              <div className="text-center">
                <div className="relative h-[300px] rounded-lg overflow-hidden mb-4 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                  <Image
                    src="/img/about-us/hampers-islami.webp"
                    alt="Hampers Islami"
                    layout="fill"
                    objectFit="cover"
                    className="hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">
                  Hampers Islami
                </h3>
                <p className="text-primary/80">
                  Hadiah bermakna untuk orang tersayang
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Testimonials Section */}
        <section className="py-16">
          <div className="container px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-primary">
              Apa Kata Pelanggan Kami
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-6">
                  {/* Star Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">
                    "Suka banget sama Al-Quran dari BY.MAYSCARF. Aku udah beli 3
                    kali di sini dan kualitas Al-Qurannya bagus, covernya nggak
                    mudah memudar, desainnya juga gak ngebosenin."
                  </p>
                  <p className="font-semibold text-gray-900">- Stefy</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-6">
                  {/* Star Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">
                    "Saya sangat puas dengan hampers yang saya pesan.
                    Packagingnya rapi dan isinya lengkap sesuai pesanan. Admin
                    juga sangat baik. Sangat direkomendasikan untuk kado nikahan
                    atau untuk seserahan."
                  </p>
                  <p className="font-semibold text-gray-900">
                    - Wijipriyantini
                  </p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-6">
                  {/* Star Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">
                    "Lucu dan bagus sekali sajadahnya, bentuk travel, kain
                    lembut, bisa dibawa kemana. Pouchnya lucu dan unik
                    bordirannya."
                  </p>
                  <p className="font-semibold text-gray-900">- Azizah</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Commitment & CTA Section */}
        <section className="py-16">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8 text-primary">
                Komitmen Kami
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Di CV Faza Mega Berlian, kami berkomitmen untuk terus berinovasi
                dalam menghadirkan produk-produk berkualitas yang terjangkau.
                Melalui pendekatan yang unik dalam customisasi produk, kami
                berhasil membuktikan bahwa produk custom tidak harus mahal untuk
                tetap berkualitas premium.
              </p>
              <p className="text-gray-700 mb-12 leading-relaxed">
                Kami percaya bahwa setiap muslim berhak memiliki Al-Qur'an dan
                perlengkapan ibadah yang personal dan berkualitas. Dengan
                dukungan dari berbagai stakeholder dan kepercayaan pelanggan
                kami di seluruh Indonesia, kami terus berkomitmen untuk
                memberikan yang terbaik sambil memberdayakan komunitas di
                sekitar kami.
              </p>
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-4 text-primary">
                  Mulai Perjalanan Anda Bersama Kami
                </h3>
                <p className="text-gray-700 mb-8">
                  Temukan koleksi Al-Qur'an custom dan perlengkapan ibadah
                  berkualitas kami
                </p>
                <Link
                  href="/produk"
                  className="inline-flex items-center px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                >
                  Lihat Koleksi Kami
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
