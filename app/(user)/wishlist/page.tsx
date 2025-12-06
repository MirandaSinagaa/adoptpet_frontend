"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Modal Hapus
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const fetchWishlist = async () => {
    try {
      const response = await api.get("/wishlist");
      setWishlists(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat wishlist.");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Modal
  const confirmRemove = (petId: number) => {
    setItemToDelete(petId);
  };

  // Eksekusi Hapus
  const executeRemove = async () => {
    if (!itemToDelete) return;

    try {
        await api.post("/wishlist/toggle", { pet_id: itemToDelete });
        toast.success("Dihapus dari favorit.");
        setItemToDelete(null); // Tutup modal
        fetchWishlist(); // Refresh list
    } catch (error) {
        toast.error("Gagal menghapus.");
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-primary">Favorit Saya ❤️</h1>
        <p className="text-gray-500 mt-1">Daftar hewan yang Anda sukai dan pertimbangkan untuk diadopsi.</p>
      </div>

      {wishlists.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-6xl mb-4 grayscale opacity-50">💔</div>
          <h3 className="text-xl font-bold text-dark">Belum ada hewan favorit.</h3>
          <Link href="/gallery" className="text-primary hover:underline mt-2 inline-block">
            Cari hewan di Galeri &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlists.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group relative">
                    
                    {/* Tombol Hapus Cepat (Trigger Modal) */}
                    <button 
                        onClick={() => confirmRemove(item.pet.id)}
                        className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-danger hover:bg-red-50 shadow-md z-10 hover:scale-110 transition"
                        title="Hapus dari Favorit"
                    >
                        ✕
                    </button>

                    <div className="relative h-56 overflow-hidden bg-gray-100">
                        {item.pet.image_url ? (
                            <img src={item.pet.image_url} alt={item.pet.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>
                        )}
                    </div>

                    <div className="p-5">
                        <h3 className="text-lg font-bold text-dark">{item.pet.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{item.pet.breed || 'Campuran'} • {item.pet.age} Bulan</p>
                        <Link 
                            href={`/gallery/${item.pet.id}`} 
                            className="block w-full text-center bg-primary text-white py-2 rounded-xl font-bold hover:bg-[#6b7c40] transition"
                        >
                            Lihat Detail
                        </Link>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* --- MODAL KONFIRMASI HAPUS --- */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
                <div className="text-4xl mb-4">🗑️</div>
                <h3 className="text-xl font-bold text-dark mb-2">Hapus dari Favorit?</h3>
                <p className="text-gray-500 text-sm mb-6">
                    Hewan ini akan dihapus dari daftar favorit Anda.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setItemToDelete(null)} 
                        className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={executeRemove}
                        className="flex-1 bg-danger text-white py-2 rounded-lg font-bold hover:bg-red-700 transition"
                    >
                        Ya, Hapus
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}