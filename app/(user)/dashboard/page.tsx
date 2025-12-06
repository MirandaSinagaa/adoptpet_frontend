"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [adoptions, setAdoptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Nomor WA Admin (Ganti dengan nomor asli)
  const ADMIN_WA_NUMBER = "6281234567890"; 

  const fetchData = async () => {
    try {
      // Gunakan sessionStorage sesuai update terakhir
      const token = sessionStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Ambil User
      const resUser = await api.get("/user");
      setUser(resUser.data.data);

      // Ambil Donasi
      const resDonations = await api.get("/user/donations");
      setDonations(resDonations.data.data);

      // Ambil Adopsi
      const resAdoptions = await api.get("/user/adoptions");
      setAdoptions(resAdoptions.data.data);

    } catch (error) {
      console.error(error);
      toast.error("Sesi habis, silakan login ulang.");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper Badge Status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
      case 'approved':
        return <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">Disetujui & Tayang</span>;
      case 'pending_review':
      case 'pending':
        return <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-bold border border-accent/20">Menunggu Review</span>;
      case 'adopted':
        return <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">Teradopsi 🎉</span>;
      case 'rejected':
        return <span className="bg-danger/10 text-danger px-3 py-1 rounded-full text-xs font-bold border border-danger/20">Ditolak</span>;
      default:
        return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <div className="space-y-12">
      
      {/* 1. HEADER & PROFILE (DENGAN ORNAMEN BACKGROUND) */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
        {/* Ornamen Background */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>

        <div className="relative z-10">
            <h1 className="text-3xl font-bold text-primary">Dashboard Saya</h1>
            <p className="text-gray-500 mt-1">Selamat datang kembali, <span className="font-semibold text-dark">{user?.name}</span>!</p>
        </div>
        <div className="flex gap-3 relative z-10">
             <Link href="/donate" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#6b7c40] transition text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                + Donasi Baru
             </Link>
             <Link href="/gallery" className="bg-white text-primary border border-primary px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition text-sm">
                Cari Hewan
             </Link>
        </div>
      </div>

      {/* 2. TABEL DONASI SAYA (Status Hewan yang Anda Berikan) */}
      <section>
        <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2 border-b pb-2">
            📤 Hewan yang Saya Donasikan
        </h2>
        
        {donations.length === 0 ? (
            // EMPTY STATE DONASI (DENGAN ILUSTRASI ICONS)
            <div className="bg-white p-10 rounded-2xl text-center border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[200px]">
                <div className="text-6xl mb-4 grayscale opacity-30">📦</div>
                <h3 className="text-lg font-bold text-gray-400">Belum ada donasi</h3>
                <p className="text-gray-400 text-sm max-w-md mt-1">Anda belum pernah mendonasikan hewan. Yuk bantu carikan rumah baru untuk mereka!</p>
                <Link href="/donate" className="mt-4 text-primary font-bold text-sm hover:underline">Mulai Donasi &rarr;</Link>
            </div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {donations.map((pet) => (
                    <div key={pet.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col h-full group">
                        <div className="flex items-start justify-between mb-4">
                             <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200">
                                {pet.image_url ? (
                                    <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                ) : (
                                    <span className="flex items-center justify-center h-full text-2xl">🐾</span>
                                )}
                             </div>
                             {getStatusBadge(pet.status)}
                        </div>
                        
                        <h3 className="font-bold text-lg text-dark">{pet.name}</h3>
                        <p className="text-sm text-gray-500">{pet.species} • {pet.breed || 'Campuran'}</p>
                        
                        {/* PANDUAN STATUS DONASI (FITUR PENTING) */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex-grow">
                            {pet.status === 'pending_review' && (
                                <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                                    ⏳ Admin sedang memeriksa data. Pastikan HP Anda aktif jika admin menghubungi.
                                </p>
                            )}
                            {pet.status === 'available' && (
                                <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                                    ✅ Hewan sudah tayang di Galeri. Mohon rawat hewan sampai ada pengajuan adopsi masuk.
                                </p>
                            )}
                            {pet.status === 'adopted' && (
                                <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                                    🎉 Hewan telah menemukan pemilik baru. Terima kasih atas kebaikan Anda!
                                </p>
                            )}
                            {pet.status === 'rejected' && (
                                <p className="text-xs text-red-700 bg-red-50 p-2 rounded">
                                    ❌ Donasi ditolak. {pet.admin_note ? `Alasan: ${pet.admin_note}` : 'Data kurang jelas.'}
                                </p>
                            )}
                        </div>

                        <div className="mt-3 text-xs text-gray-400 text-right">
                            Diajukan: {new Date(pet.created_at).toLocaleDateString("id-ID")}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </section>

      {/* 3. TABEL RIWAYAT ADOPSI (Status Hewan yang Anda Minta) */}
      <section>
        <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2 border-b pb-2">
            🏠 Riwayat Pengajuan Adopsi
        </h2>

        {adoptions.length === 0 ? (
            // EMPTY STATE ADOPSI (DENGAN ILUSTRASI ICONS)
            <div className="bg-white p-10 rounded-2xl text-center border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[200px]">
                <div className="text-6xl mb-4 grayscale opacity-30">🏠</div>
                <h3 className="text-lg font-bold text-gray-400">Belum ada pengajuan</h3>
                <p className="text-gray-400 text-sm max-w-md mt-1">Temukan sahabat sejati Anda di galeri kami dan ajukan adopsi sekarang.</p>
                <Link href="/gallery" className="mt-4 text-primary font-bold text-sm hover:underline">Lihat Galeri &rarr;</Link>
            </div>
        ) : (
            <div className="space-y-4">
                {adoptions.map((adoption) => (
                    <div key={adoption.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                             <div className="w-12 h-12 bg-accent/20 text-accent rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                                ?
                             </div>
                             <div>
                                <h3 className="font-bold text-dark">Pengajuan untuk: <span className="text-primary">{adoption.pet?.name || 'Hewan'}</span></h3>
                                <p className="text-sm text-gray-500 italic line-clamp-1">"{adoption.reason}"</p>
                             </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 w-full md:w-auto text-right">
                            {getStatusBadge(adoption.status)}
                            
                            {/* FITUR BARU: TOMBOL WA JIKA DISETUJUI */}
                            {adoption.status === 'approved' && (
                                <div className="flex flex-col items-end gap-1">
                                    <p className="text-xs text-green-600 font-bold">Permintaan disetujui!</p>
                                    <a 
                                        href={`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo Admin AdoptPet, saya ${user?.name}. Pengajuan adopsi saya untuk hewan ${adoption.pet?.name} (ID: ${adoption.pet?.id}) telah disetujui. Bagaimana prosedur penjemputannya?`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 flex items-center gap-1 transition shadow-sm animate-pulse"
                                    >
                                        📞 Hubungi Admin untuk Penjemputan
                                    </a>
                                </div>
                            )}

                            {adoption.status === 'rejected' && adoption.admin_note && (
                                <div className="bg-red-50 px-3 py-2 rounded-lg max-w-xs">
                                    <p className="text-xs text-danger font-bold">Alasan Penolakan:</p>
                                    <p className="text-xs text-gray-600">{adoption.admin_note}</p>
                                </div>
                            )}
                            
                            <span className="text-xs text-gray-400 mt-1">
                                {new Date(adoption.created_at).toLocaleDateString("id-ID")}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </section>

    </div>
  );
}