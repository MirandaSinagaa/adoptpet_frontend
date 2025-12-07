"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Cek di browser apakah user sudah pernah setuju
    const consent = localStorage.getItem("cookie_consent");
    
    // Jika belum ada data consent, tampilkan banner
    if (!consent) {
      // Delay sedikit agar animasinya enak dilihat saat baru buka web
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookie = () => {
    // Simpan persetujuan di Local Storage browser user
    localStorage.setItem("cookie_consent", "true");
    setShowBanner(false);
  };

  const closeBanner = () => {
    // Opsional: Jika user menutup tanpa terima (tapi biasanya akan muncul lagi nanti)
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    // Container Fixed di Bawah
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 z-[100] animate-fadeIn">
      <div className="max-w-6xl mx-auto bg-[#1a202c] text-white p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-700">
        
        {/* Bagian Teks */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🍪</span>
            <h3 className="font-bold text-lg text-white">Privasi Anda Prioritas Kami</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Kami menggunakan cookie untuk meningkatkan pengalaman Anda dan menganalisis trafik website melalui Google Analytics. 
            Dengan melanjutkan, Anda menyetujui penggunaan cookie sesuai dengan kebijakan kami.
            <br />
            <Link href="/terms" className="text-primary font-bold hover:underline mt-2 inline-block">
                Lihat Syarat & Ketentuan
            </Link>
          </p>
        </div>

        {/* Bagian Tombol */}
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={closeBanner}
            className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 font-bold text-sm transition"
          >
            Tutup
          </button>
          
          <button 
            onClick={acceptCookie}
            className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-primary text-white hover:bg-[#6b7c40] font-bold text-sm shadow-lg transition transform hover:-translate-y-0.5"
          >
            Terima Semua
          </button>
        </div>

      </div>
    </div>
  );
}