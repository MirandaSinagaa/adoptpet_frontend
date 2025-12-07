"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  // --- LOGIKA ANIMASI GAMBAR HERO ---
  const heroImages = [
    "/images/hero-dog.png",    // 1. Anjing
    "/images/hero-cat.png",    // 2. Kucing
    "/images/hero-rabbit.png", // 3. Kelinci
    "/images/hero-bird.png"    // 4. Burung (Baru)
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Mulai efek menghilang (fade out)
      setIsFading(true);

      // 2. Tunggu 0.5 detik, lalu ganti gambar
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        // 3. Munculkan kembali (fade in)
        setIsFading(false);
      }, 500); 

    }, 4000); // Ganti setiap 4 detik

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="space-y-20">
      
      {/* 1. HERO SECTION (ANIMATED) */}
      <section className="relative bg-secondary rounded-3xl overflow-hidden p-8 md:p-16 flex flex-col md:flex-row items-center justify-between shadow-lg">
        <div className="max-w-xl space-y-6 z-10">
          <span className="inline-block bg-white/60 text-primary px-4 py-1 rounded-full text-sm font-semibold tracking-wide">
            🐾 Platform Adopsi Terpercaya
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-dark leading-tight">
            Temukan Sahabat <br />
            <span className="text-primary">Sejati Anda</span> Di Sini
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            Ribuan hewan terlantar menunggu rumah baru. Berikan mereka kesempatan kedua untuk hidup bahagia bersama Anda.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link 
              href="/gallery" 
              className="bg-primary text-white hover:bg-[#6b7c40] px-8 py-3 rounded-xl font-bold transition duration-300 shadow-md transform hover:-translate-y-1"
            >
              Cari Hewan
            </Link>
            <Link 
              href="/donate" 
              className="bg-white text-primary border-2 border-primary hover:bg-gray-50 px-8 py-3 rounded-xl font-bold transition duration-300 transform hover:-translate-y-1"
            >
              Donasi Hewan
            </Link>
          </div>
        </div>
        
        {/* Dekorasi Visual (ANIMASI GAMBAR 4 HEWAN) */}
        <div className="mt-10 md:mt-0 relative flex justify-center items-center w-full md:w-1/2">
          {/* Background Blur */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-accent/20 rounded-full blur-3xl -z-10"></div>
          
          {/* Gambar Berubah-ubah */}
          <img 
             src={heroImages[currentImageIndex]} 
             alt="Hewan Peliharaan" 
             className={`w-[280px] md:w-[450px] object-contain drop-shadow-2xl transform transition-all duration-500 ease-in-out ${isFading ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}
          />
        </div>
      </section>

      {/* 2. STATISTIK */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-y border-gray-200 py-12">
        <div>
          <h3 className="text-4xl font-bold text-accent">50+</h3>
          <p className="text-gray-500 font-medium">Hewan Tersedia</p>
        </div>
        <div>
          <h3 className="text-4xl font-bold text-primary">120+</h3>
          <p className="text-gray-500 font-medium">Berhasil Diadopsi</p>
        </div>
        <div>
          <h3 className="text-4xl font-bold text-danger">24/7</h3>
          <p className="text-gray-500 font-medium">Layanan Bantuan</p>
        </div>
        <div>
          <h3 className="text-4xl font-bold text-dark">100%</h3>
          <p className="text-gray-500 font-medium">Gratis Biaya</p>
        </div>
      </section>

      {/* 3. CARA KERJA (STEPS) */}
      <section className="text-center py-8">
        <h2 className="text-3xl font-bold text-dark mb-12">Langkah Mudah Adopsi</h2>
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
            <div className="w-16 h-16 bg-secondary text-primary flex items-center justify-center rounded-full text-2xl font-bold mx-auto mb-6">
              1
            </div>
            <h3 className="text-xl font-bold mb-3">Pilih Hewan</h3>
            <p className="text-gray-600">
              Lihat galeri kami dan temukan hewan yang cocok dengan kepribadian & lingkungan Anda.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
            <div className="w-16 h-16 bg-secondary text-primary flex items-center justify-center rounded-full text-2xl font-bold mx-auto mb-6">
              2
            </div>
            <h3 className="text-xl font-bold mb-3">Isi Formulir</h3>
            <p className="text-gray-600">
              Ajukan permohonan adopsi dan ceritakan sedikit tentang kondisi rumah Anda.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
            <div className="w-16 h-16 bg-secondary text-primary flex items-center justify-center rounded-full text-2xl font-bold mx-auto mb-6">
              3
            </div>
            <h3 className="text-xl font-bold mb-3">Bawa Pulang</h3>
            <p className="text-gray-600">
              Setelah disetujui Admin, Anda bisa menjemput sahabat baru Anda ke rumah.
            </p>
          </div>

        </div>
      </section>

      {/* 4. CTA DONASI */}
      <section className="bg-primary rounded-3xl p-12 text-center text-white relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFFFFF" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.3C87.4,-33.5,90.1,-18,88.5,-3.3C86.9,11.4,81,25.3,71.5,36.4C62,47.5,48.9,55.7,35.6,63.5C22.3,71.3,8.9,78.7,-3.6,84.9C-16.1,91.1,-27.7,96.1,-38.3,90.3C-48.9,84.5,-58.5,67.9,-66.6,51.1C-74.7,34.3,-81.3,17.3,-80.7,0.7C-80.1,-15.9,-72.3,-32.1,-61.6,-44.8C-50.9,-57.5,-37.3,-66.7,-23.5,-74.2C-9.7,-81.7,4.3,-87.5,18.8,-88.8C33.3,-90.1,48.3,-86.9,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Punya Hewan yang Butuh Rumah Baru?</h2>
          <p className="text-white/90 text-lg">
            Jangan biarkan mereka terlantar. Kami siap membantu mencarikan pemilik baru yang penyayang melalui platform kami.
          </p>
          <Link 
            href="/donate" 
            className="inline-block bg-accent text-dark hover:bg-yellow-400 px-8 py-3 rounded-full font-bold text-lg transition shadow-lg mt-4"
          >
            Donasi Sekarang
          </Link>
        </div>
      </section>

    </div>
  );
}