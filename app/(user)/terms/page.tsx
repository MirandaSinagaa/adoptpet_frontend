"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-primary mb-2">Syarat & Ketentuan Adopsi</h1>
        <p className="text-gray-500 mb-8 border-b pb-6">
          Harap membaca dengan seksama sebelum mengajukan adopsi di AdoptPet.
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-dark mb-3">1. Komitmen Seumur Hidup</h2>
            <p>
              Mengadopsi hewan adalah komitmen jangka panjang (10-15 tahun). Adopter wajib merawat hewan dengan penuh kasih sayang, menyediakan pakan yang layak, tempat tinggal yang aman, dan perawatan medis (vaksin/steril) jika diperlukan. Dilarang keras menelantarkan hewan kembali ke jalanan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-3">2. Larangan Pindah Tangan & Jual Beli</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Hewan yang diadopsi <strong>TIDAK BOLEH</strong> diperjualbelikan kembali dalam kondisi apapun.</li>
              <li>Hewan tidak boleh dipindahtangankan ke pihak ketiga tanpa sepengetahuan Admin atau Donatur awal.</li>
              <li>Jika Adopter sudah tidak sanggup merawat, hewan wajib dikembalikan ke Donatur atau dicarikan adopter baru melalui platform ini.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-3">3. Kesiapan Finansial & Lingkungan</h2>
            <p>
              Adopter harus memiliki penghasilan yang cukup untuk menanggung biaya hidup hewan (makan, pasir, obat). Lingkungan rumah harus aman (disarankan berpagar) dan mendapatkan izin dari seluruh anggota keluarga atau pemilik kost/kontrakan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-3">4. Monitoring Berkala</h2>
            <p>
              Admin atau Donatur berhak meminta update kondisi hewan berupa foto/video secara berkala (misal: 1 bulan sekali pada 3 bulan pertama). Admin juga berhak melakukan kunjungan rumah (survey) jika dirasa perlu sebelum menyetujui adopsi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-3">5. Konsekuensi Pelanggaran</h2>
            <p className="bg-red-50 p-4 rounded-xl border border-red-100 text-danger font-medium">
              Apabila terbukti melakukan kekerasan, penelantaran, atau penjualan hewan adopsi, Admin berhak mengambil paksa hewan tersebut dan memblokir akun Adopter permanen (Blacklist). Kasus kekerasan hewan dapat dilaporkan ke pihak berwajib sesuai Pasal 302 KUHP.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex justify-center">
          <Link href="/gallery" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-[#6b7c40] transition shadow-md">
            Saya Mengerti & Kembali ke Galeri
          </Link>
        </div>
      </div>
    </div>
  );
}