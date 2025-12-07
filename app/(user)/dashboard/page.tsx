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

  // STATE UNTUK MODAL CANCEL (Dari kode sebelumnya)
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);

  const ADMIN_WA_NUMBER = "6281234567890"; 

  const fetchData = async () => {
    try {
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

  // --- LOGIC CANCEL ---
  const openCancelModal = (petId: number) => {
    setSelectedPetId(petId);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
        toast.error("Wajib isi alasan pembatalan.");
        return;
    }
    setIsCanceling(true);
    const loadingToast = toast.loading("Memproses pembatalan...");
    try {
        await api.post(`/pets/${selectedPetId}/cancel`, { reason: cancelReason });
        toast.dismiss(loadingToast);
        toast.success("Donasi berhasil dibatalkan.");
        setCancelModalOpen(false);
        fetchData(); 
    } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Gagal membatalkan donasi.");
    } finally {
        setIsCanceling(false);
    }
  };

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
      case 'canceled':
        return <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-300">Dibatalkan Pemilik</span>;
      default:
        return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  // --- SKELETON LOADING UI (PENGGANTI SPINNER) ---
  if (isLoading) {
    return (
        <div className="space-y-12 animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="space-y-3 w-full">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
                    <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
                </div>
            </div>

            {/* Donasi Skeleton */}
            <section>
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-64 flex flex-col justify-between">
                            <div className="flex justify-between">
                                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                                <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="h-12 bg-gray-100 rounded mt-4"></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Adopsi Skeleton */}
            <section>
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center h-24">
                            <div className="flex items-center gap-4 w-1/2">
                                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                <div className="space-y-2 w-full">
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </div>
                            <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
  }

  return (
    <div className="space-y-12">
      
      {/* 1. HEADER & PROFILE (DENGAN ORNAMEN BACKGROUND) */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
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

      {/* 2. TABEL DONASI SAYA */}
      <section>
        <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2 border-b pb-2">
            📤 Hewan yang Saya Donasikan
        </h2>
        
        {donations.length === 0 ? (
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
                        
                        <div className="mt-4 pt-4 border-t border-gray-100 grow">
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
                                <div className="bg-red-50 p-3 rounded border border-red-100">
                                    <p className="text-xs text-red-700 font-bold mb-1">❌ Donasi Ditolak</p>
                                    <p className="text-xs text-gray-600 italic">"{pet.admin_note || 'Tidak ada alasan spesifik.'}"</p>
                                </div>
                            )}
                            {pet.status === 'canceled' && (
                                <div className="bg-gray-100 p-3 rounded border border-gray-200">
                                    <p className="text-xs text-gray-500 font-bold mb-1">⚠️ Donasi Dibatalkan</p>
                                    <p className="text-xs text-gray-400 italic">"{pet.cancellation_reason}"</p>
                                </div>
                            )}
                        </div>

                         {/* TOMBOL BATALKAN (Hanya jika Pending atau Available) */}
                        {(pet.status === 'pending_review' || pet.status === 'available') && (
                            <button 
                                onClick={() => openCancelModal(pet.id)}
                                className="mt-3 w-full border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold py-2 rounded-lg transition"
                            >
                                🚫 Batalkan Donasi
                            </button>
                        )}

                        <div className="mt-3 text-xs text-gray-400 text-right">
                            Diajukan: {new Date(pet.created_at).toLocaleDateString("id-ID")}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </section>

      {/* 3. TABEL ADOPSI SAYA */}
      <section>
        <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2 border-b pb-2">
            🏠 Riwayat Pengajuan Adopsi
        </h2>

        {adoptions.length === 0 ? (
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
                             <div className="w-12 h-12 bg-accent/20 text-accent rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                                ?
                             </div>
                             <div>
                                <h3 className="font-bold text-dark">Pengajuan untuk: <span className="text-primary">{adoption.pet?.name || 'Hewan'}</span></h3>
                                <p className="text-sm text-gray-500 italic line-clamp-1">"{adoption.reason}"</p>
                             </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 w-full md:w-auto text-right">
                            {getStatusBadge(adoption.status)}
                            
                            {/* TOMBOL WA (Jika Approved) */}
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
                                <div className="bg-red-50 px-3 py-2 rounded-lg max-w-xs text-left">
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

      {/* --- MODAL BATALKAN DONASI --- */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                <button onClick={() => setCancelModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-dark font-bold text-xl">✕</button>
                
                <h3 className="text-xl font-bold text-dark mb-2">Batalkan Donasi?</h3>
                <p className="text-gray-500 text-sm mb-4">Hewan ini akan dihapus dari daftar tersedia. Tindakan ini tidak dapat dibatalkan.</p>
                
                <form onSubmit={handleCancelSubmit}>
                    <label className="block text-sm font-bold text-dark mb-2">Alasan Pembatalan <span className="text-danger">*</span></label>
                    <textarea 
                        className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none mb-4"
                        rows={3}
                        placeholder="Contoh: Sudah diadopsi oleh saudara, atau memutuskan merawat sendiri..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        required
                    />
                    
                    <div className="flex gap-3">
                        <button 
                            type="button"
                            onClick={() => setCancelModalOpen(false)} 
                            className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition"
                        >
                            Kembali
                        </button>
                        <button 
                            type="submit"
                            disabled={isCanceling}
                            className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition shadow-md disabled:opacity-50"
                        >
                            {isCanceling ? "Memproses..." : "Ya, Batalkan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}