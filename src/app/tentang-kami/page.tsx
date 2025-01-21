import Image from "next/image";

export default function TentangKami() {
  return (
    <main className="container px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Tentang Kami</h1>

      <section className="grid md:grid-cols-2 gap-8 items-center mb-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">CV Faza Mega Berlian</h2>
          <p className="text-gray-600 mb-4">
            Sejak 2019, CV Faza Mega Berlian telah menjadi pionir dalam
            menyediakan Al-Qur'an custom cover dan perlengkapan ibadah
            berkualitas dengan harga terjangkau di Surabaya. Kami memahami
            pentingnya memiliki Al-Qur'an yang tidak hanya indah secara visual,
            tetapi juga memiliki makna mendalam bagi setiap individu.
          </p>
          <p className="text-gray-600 mb-4">
            Berlokasi di jantung kota Surabaya, kami telah melayani ribuan
            pelanggan dengan produk-produk unggulan kami, termasuk Al-Qur'an
            custom cover, sajadah premium, tasbih berkualitas, dan hampers
            islami yang menginspirasi. Setiap produk kami dirancang dengan penuh
            perhatian terhadap detail dan kualitas, memastikan bahwa setiap
            pelanggan mendapatkan yang terbaik untuk meningkatkan pengalaman
            ibadah mereka.
          </p>
        </div>
        <div className="relative h-[300px] rounded-lg overflow-hidden">
          <Image
            src="https://placehold.co/400x300"
            alt="Kantor CV Faza Mega Berlian"
            layout="fill"
            objectFit="cover"
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Visi Kami</h2>
        <p className="text-gray-600 mb-4">
          Menjadi perusahaan terdepan dalam menyediakan Al-Qur'an custom dan
          perlengkapan ibadah berkualitas yang terjangkau, serta menjadi mitra
          utama dalam meningkatkan spiritualitas masyarakat Indonesia, khususnya
          di Surabaya dan sekitarnya.
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-4">
          <li>
            Menjangkau setiap rumah dengan Al-Qur'an yang indah dan bermakna
          </li>
          <li>
            Memfasilitasi ibadah yang nyaman melalui perlengkapan berkualitas
          </li>
          <li>
            Menjadi katalis dalam meningkatkan literasi Al-Qur'an di masyarakat
          </li>
          <li>Menciptakan lapangan kerja dan memberdayakan pengrajin lokal</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Misi Kami</h2>
        <ol className="list-decimal list-inside text-gray-600 mb-4">
          <li>
            Menyediakan Al-Qur'an custom cover dengan desain yang indah dan
            bermakna, memadukan seni kaligrafi dengan teknologi modern untuk
            menciptakan Al-Qur'an yang tidak hanya indah dipandang tetapi juga
            menginspirasi untuk dibaca.
          </li>
          <li>
            Menghadirkan perlengkapan ibadah berkualitas tinggi dengan harga
            yang terjangkau, memastikan setiap muslim di Surabaya dan sekitarnya
            dapat mengakses produk-produk yang meningkatkan kualitas ibadah
            mereka.
          </li>
          <li>
            Melakukan inovasi berkelanjutan dalam desain dan produksi, mengikuti
            perkembangan tren dan kebutuhan pasar tanpa mengesampingkan
            nilai-nilai islami.
          </li>
          <li>
            Memberikan edukasi kepada masyarakat tentang pentingnya membaca
            Al-Qur'an dan menjaga kualitas ibadah melalui berbagai program dan
            kegiatan sosial.
          </li>
          <li>
            Membangun kemitraan yang kuat dengan pengrajin lokal dan supplier,
            mendukung ekonomi lokal sambil memastikan kualitas produk yang
            konsisten.
          </li>
          <li>
            Menyediakan layanan pelanggan yang prima, memastikan setiap
            interaksi dengan pelanggan mencerminkan nilai-nilai islami seperti
            kejujuran, keramahan, dan profesionalisme.
          </li>
        </ol>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="text-center">
          <div className="relative h-[300px] rounded-lg overflow-hidden mb-4">
            <Image
              src="https://placehold.co/300x300"
              alt="Al-Qur'an Custom Cover"
              layout="fill"
              objectFit="cover"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Al-Qur'an Custom Cover</h3>
          <p className="text-gray-600">
            Desain unik yang mencerminkan kepribadian Anda
          </p>
        </div>
        <div className="text-center">
          <div className="relative h-[300px] rounded-lg overflow-hidden mb-4">
            <Image
              src="https://placehold.co/300x300"
              alt="Sajadah Premium"
              layout="fill"
              objectFit="cover"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Sajadah Premium</h3>
          <p className="text-gray-600">Kenyamanan dalam setiap sujud</p>
        </div>
        <div className="text-center">
          <div className="relative h-[300px] rounded-lg overflow-hidden mb-4">
            <Image
              src="https://placehold.co/300x300"
              alt="Hampers Islami"
              layout="fill"
              objectFit="cover"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Hampers Islami</h3>
          <p className="text-gray-600">Hadiah bermakna untuk orang tersayang</p>
        </div>
      </section>

      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Komitmen Kami</h2>
        <p className="text-gray-600 mb-4">
          Di CV Faza Mega Berlian, kami berkomitmen untuk terus berinovasi dan
          meningkatkan kualitas produk kami. Kami percaya bahwa dengan
          menyediakan Al-Qur'an custom cover dan perlengkapan ibadah berkualitas
          dengan harga terjangkau di Surabaya, kami tidak hanya menjalankan
          bisnis, tetapi juga berkontribusi pada peningkatan spiritualitas
          masyarakat.
        </p>
        <p className="text-gray-600">
          Kami mengundang Anda untuk menjadi bagian dari perjalanan kami dalam
          menyebarkan keindahan Al-Qur'an dan meningkatkan kualitas ibadah di
          setiap rumah. Bersama-sama, mari kita wujudkan visi menjadikan
          Surabaya sebagai kota yang semakin dekat dengan Al-Qur'an dan
          nilai-nilai islami.
        </p>
      </div>
    </main>
  );
}
