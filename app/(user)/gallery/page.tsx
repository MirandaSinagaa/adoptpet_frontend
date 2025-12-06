"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function GalleryPage() {
  const [pets, setPets] = useState<any[]>([]);
  const [filteredPets, setFilteredPets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Filter
  const [filterSpecies, setFilterSpecies] = useState("all"); // all, cat, dog
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPets = async () => {
    try {
      // Ambil data public (hanya status 'available')
      const response = await api.get("/pets");
      setPets(response.data.data);
      setFilteredPets(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat galeri hewan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  // Logic Filtering (Jalan setiap kali pets, filter, atau search berubah)
  useEffect(() => {
    let result = pets;

    // 1. Filter by Species
    if (filterSpecies !== "all") {
      result = result.filter((pet) => pet.species === filterSpecies);
    }

    // 2. Filter by Search (Name / Breed)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (pet) =>
          pet.name.toLowerCase().includes(lowerQuery) ||
          (pet.breed && pet.breed.toLowerCase().includes(lowerQuery))
      );
    }

    setFilteredPets(result);
  }, [pets, filterSpecies, searchQuery]);

  return (
    <div className="space-y-8">
      
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-primary">Galeri Hewan</h1>
          <p className="text-gray-500 mt-1">Temukan sahabat sejati Anda di sini.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Box */}
          <input 
            type="text" 
            placeholder="Cari nama atau ras..." 
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Filter Buttons */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setFilterSpecies("all")}
              className={`px-4 py-2 rounded-md text-sm font-bold transition ${filterSpecies === 'all' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-dark'}`}
            >
              Semua
            </button>
            <button 
              onClick={() => setFilterSpecies("cat")}
              className={`px-4 py-2 rounded-md text-sm font-bold transition ${filterSpecies === 'cat' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-dark'}`}
            >
              Kucing 🐱
            </button>
            <button 
              onClick={() => setFilterSpecies("dog")}
              className={`px-4 py-2 rounded-md text-sm font-bold transition ${filterSpecies === 'dog' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-dark'}`}
            >
              Anjing 🐶
            </button>
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && filteredPets.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-dark">Tidak ada hewan ditemukan.</h3>
          <p className="text-gray-500">Coba ubah kata kunci pencarian atau filter Anda.</p>
        </div>
      )}

      {/* GRID HEWAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPets.map((pet) => (
          <div key={pet.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
            
            {/* Image Container */}
            <div className="relative h-64 overflow-hidden bg-gray-100">
              {pet.image_url ? (
                <img 
                  src={pet.image_url} 
                  alt={pet.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>
              )}
              
              {/* Badge Gender */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                {pet.gender === 'male' ? '♂️ Jantan' : '♀️ Betina'}
              </div>
            </div>

            {/* Info Container */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-dark">{pet.name}</h3>
                <span className="text-xs bg-secondary/30 text-dark px-2 py-1 rounded-md font-semibold">
                    {pet.age ? `${pet.age} Bulan` : 'Dewasa'}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                {pet.breed || 'Campuran'} • {pet.species === 'cat' ? 'Kucing' : pet.species === 'dog' ? 'Anjing' : 'Lainnya'}
              </p>

              {/* Tombol Detail (Nanti diarahkan ke Detail Page) */}
              <Link 
                href={`/gallery/${pet.id}`} 
                className="block w-full text-center bg-primary text-white py-2 rounded-xl font-bold hover:bg-[#6b7c40] transition"
              >
                Lihat Detail
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}