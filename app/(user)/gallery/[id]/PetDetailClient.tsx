"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface PetImage {
    id: number;
    image_url: string;
}

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  description: string;
  health_status: string;
  image_url: string;
  status: string;
  user?: { name: string };
  images?: PetImage[]; 
}

export default function PetDetailClient({ initialData, id }: { initialData: any, id: string }) {
  const router = useRouter();
  
  // Menggunakan data awal dari server
  const [pet, setPet] = useState<Pet | null>(initialData);
  const [activeImage, setActiveImage] = useState<string>(initialData?.image_url || ""); 
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk Dropdown Share
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [screening, setScreening] = useState({
    job: "", salary_range: "Di bawah 3 Juta", housing_type: "Rumah Pribadi", has_fence: "Ya", other_pets: "Tidak Ada", family_permission: "Ya", reason_detail: "", terms_agreed: false
  });

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
        api.get(`/wishlist/check/${id}`)
           .then(res => setIsWishlisted(res.data.is_wishlisted))
           .catch(err => console.error(err));
    }
  }, [id]);

  const handleWishlistToggle = async () => {
    if (!isLoggedIn) {
        toast.error("Silakan login dulu.");
        router.push("/login");
        return;
    }
    try {
        const response = await api.post("/wishlist/toggle", { pet_id: id });
        setIsWishlisted(response.data.is_wishlisted);
        toast.success(response.data.message);
    } catch (error) { toast.error("Gagal update favorit."); }
  };

  // --- FITUR BARU: SHARE FUNCTION ---
  const handleShare = (platform: 'copy' | 'wa' | 'twitter') => {
    const url = window.location.href; // Ambil URL halaman saat ini
    const text = `Ayo adopsi ${pet?.name}, si ${pet?.species} lucu ini di AdoptPet! 🐾`;

    if (platform === 'copy') {
        navigator.clipboard.writeText(url);
        toast.success("Link berhasil disalin!");
    } else if (platform === 'wa') {
        window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank');
    } else if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }
    setIsShareOpen(false); // Tutup dropdown setelah klik
  };

  const handleAdoptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screening.terms_agreed) { toast.error("Wajib menyetujui syarat & ketentuan."); return; }
    setIsSubmitting(true);
    
    const envDesc = `[DATA LINGKUNGAN]\nPekerjaan: ${screening.job}\nGaji: ${screening.salary_range}\nRumah: ${screening.housing_type}\nPagar: ${screening.has_fence}\nHewan Lain: ${screening.other_pets}\nIzin: ${screening.family_permission}`;

    try {
      await api.post("/adoptions", { pet_id: id, reason: screening.reason_detail, environment_desc: envDesc });
      toast.success("Berhasil diajukan!");
      setIsModalOpen(false); 
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengajukan.");
    } finally { setIsSubmitting(false); }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setScreening({ ...screening, [name]: type === 'checkbox' ? checked : value });
  };

  if (!pet) return <div className="text-center p-10">Data tidak ditemukan.</div>;

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* HEADER: KEMBALI, SHARE & FAVORIT */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/gallery" className="text-gray-500 hover:text-primary font-medium">&larr; Galeri</Link>
        
        <div className="flex gap-2">
            {/* TOMBOL SHARE (BARU) */}
            <div className="relative">
                <button 
                    onClick={() => setIsShareOpen(!isShareOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-bold border bg-white text-gray-500 border-gray-200 hover:bg-gray-50 transition"
                >
                    <span>📢</span> Bagikan
                </button>

                {/* DROPDOWN MENU SHARE */}
                {isShareOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-fadeIn">
                        <button onClick={() => handleShare('copy')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium flex items-center gap-2">
                            🔗 Salin Link
                        </button>
                        <button onClick={() => handleShare('wa')} className="w-full text-left px-4 py-2 hover:bg-green-50 text-green-600 text-sm font-medium flex items-center gap-2">
                            📱 WhatsApp
                        </button>
                        <button onClick={() => handleShare('twitter')} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-500 text-sm font-medium flex items-center gap-2">
                            🐦 Twitter / X
                        </button>
                    </div>
                )}
            </div>

            {/* TOMBOL FAVORIT */}
            <button onClick={handleWishlistToggle} className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold border transition ${isWishlisted ? "bg-red-50 text-danger border-red-200" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
                <span>{isWishlisted ? "❤️" : "🤍"}</span> {isWishlisted ? "Favorit" : "Favorit"}
            </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* KOLOM FOTO */}
        <div className="md:w-1/2 bg-gray-50 p-6 flex flex-col gap-4">
            <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-sm bg-white">
                {activeImage ? (
                    <img src={activeImage} alt="Main" className="absolute inset-0 w-full h-full object-contain" />
                ) : (
                    <div className="flex items-center justify-center h-full text-6xl">🐾</div>
                )}
            </div>
            {pet.images && pet.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    <button onClick={() => setActiveImage(pet.image_url)} className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${activeImage === pet.image_url ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-gray-300'}`}>
                        <img src={pet.image_url} className="w-full h-full object-cover" />
                    </button>
                    {pet.images.map((img: any) => (
                        <button key={img.id} onClick={() => setActiveImage(img.image_url)} className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${activeImage === img.image_url ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-gray-300'}`}>
                            <img src={img.image_url} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* KOLOM DETAIL */}
        <div className="md:w-1/2 p-8 md:p-12">
            <div className="flex justify-between">
                <h1 className="text-4xl font-bold text-dark">{pet.name}</h1>
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-bold text-sm h-fit">
                    {pet.gender === 'male' ? 'Jantan ♂️' : 'Betina ♀️'}
                </span>
            </div>
            <p className="text-gray-500 font-medium mt-1">{pet.breed || 'Campuran'} • {pet.age} Bulan</p>
            
            <div className="mt-6 space-y-4">
                <div className="bg-secondary/10 p-3 rounded-xl border border-secondary/20">
                    <p className="text-xs font-bold text-gray-500 uppercase">Kesehatan</p>
                    <p className="font-semibold text-dark">{pet.health_status}</p>
                </div>
                <div>
                    <h3 className="font-bold text-gray-400 text-sm uppercase mb-1">Cerita</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{pet.description}</p>
                </div>
                <div>
                    <h3 className="font-bold text-gray-400 text-sm uppercase mb-1">Donatur</h3>
                    <p className="font-bold text-dark flex items-center gap-2">
                        <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">👤</span>
                        {pet.user?.name}
                    </p>
                </div>
            </div>

            <div className="mt-8">
                {isLoggedIn ? (
                    <button onClick={() => setIsModalOpen(true)} className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-[#6b7c40] shadow-lg transition transform active:scale-95">
                        🏠 Ajukan Adopsi
                    </button>
                ) : (
                    <Link href="/login" className="block text-center w-full bg-dark text-white py-4 rounded-xl font-bold">Login untuk Adopsi</Link>
                )}
            </div>
        </div>
      </div>

      {/* MODAL ADOPSI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-2xl my-10 p-8 relative">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-danger">✕</button>
                <h2 className="text-2xl font-bold text-primary mb-6">Formulir Adopsi</h2>
                <form onSubmit={handleAdoptSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <input name="job" placeholder="Pekerjaan" className="border p-2 rounded w-full" onChange={handleChange} required />
                        <select name="salary_range" className="border p-2 rounded w-full" onChange={handleChange}><option value="< 3 Juta">Gaji &lt; 3 Juta</option><option value="> 3 Juta">Gaji &gt; 3 Juta</option></select>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <select name="housing_type" className="border p-2 rounded w-full" onChange={handleChange}><option value="Rumah">Rumah</option><option value="Kost">Kost</option></select>
                        <select name="has_fence" className="border p-2 rounded w-full" onChange={handleChange}><option value="Ya">Pagar: Ya</option><option value="Tidak">Pagar: Tidak</option></select>
                    </div>
                    <input name="other_pets" placeholder="Hewan lain..." className="border p-2 rounded w-full" onChange={handleChange} required />
                    <textarea name="reason_detail" placeholder="Alasan adopsi..." rows={3} className="border p-2 rounded w-full" onChange={handleChange} required />
                    
                    <label className="flex gap-2 items-center bg-yellow-50 p-3 rounded border border-yellow-200 cursor-pointer">
                        <input type="checkbox" name="terms_agreed" onChange={handleChange} className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" />
                        <span className="text-sm">
                            Saya setuju dengan <Link href="/terms" target="_blank" className="font-bold text-blue-600 underline hover:text-blue-800">Syarat & Ketentuan</Link>.
                        </span>
                    </label>

                    <button type="submit" disabled={isSubmitting} className="w-full bg-accent py-3 rounded font-bold hover:bg-yellow-400 mt-4">
                        {isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}