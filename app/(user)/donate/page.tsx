"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function DonatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // State Preview Gambar
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewExtras, setPreviewExtras] = useState<string[]>([]);

  // State Form
  const [formData, setFormData] = useState({
    name: "",
    species: "cat", 
    breed: "",
    age: "", 
    gender: "male",
    health_status: "",
    description: "",
    image: null as File | null, // Foto Utama
    extra_images: [] as File[], // Foto Tambahan (Array)
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Handle Foto Utama
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 2. Handle Foto Tambahan (Multi Select)
  const handleExtraFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Limit maks 5 foto tambahan agar tidak berat
      if (files.length > 5) {
        toast.error("Maksimal 5 foto tambahan.");
        return;
      }

      setFormData({ ...formData, extra_images: files });

      // Buat preview
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewExtras(newPreviews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const uploadToast = toast.loading("Mengupload data & foto...");

    try {
      const data = new FormData();
      
      // Data Text
      data.append("name", formData.name);
      data.append("species", formData.species);
      data.append("gender", formData.gender);
      data.append("health_status", formData.health_status);
      data.append("description", formData.description);

      if (formData.age && formData.age.trim() !== "") {
        data.append("age", formData.age);
      }
      
      if (formData.breed && formData.breed.trim() !== "") {
        data.append("breed", formData.breed);
      }
      
      // Data File Utama
      if (formData.image) {
        data.append("image", formData.image);
      }

      // Data File Tambahan (Looping)
      // PENTING: Gunakan 'extra_images[]' agar terbaca sebagai array di Laravel
      formData.extra_images.forEach((file) => {
        data.append("extra_images[]", file);
      });

      // Kirim dengan Header Multipart
      await api.post("/pets/donate", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.dismiss(uploadToast);
      toast.success("Berhasil! Menunggu persetujuan admin.");
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);

    } catch (error: any) {
      toast.dismiss(uploadToast);
      console.error("ERROR:", error.response?.data);

      if (error.response && error.response.data.errors) {
        const firstErrorKey = Object.keys(error.response.data.errors)[0];
        toast.error(`Gagal: ${error.response.data.errors[firstErrorKey][0]}`);
      } else {
        toast.error("Gagal mengirim data.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-primary mb-2">Donasi Hewan</h1>
        <p className="text-gray-500 mb-8">
          Isi formulir di bawah ini untuk mencarikan rumah baru bagi hewan kesayangan Anda.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* AREA UPLOAD FOTO */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-dark">Foto Hewan</label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. FOTO UTAMA (WAJIB) */}
                <div className="relative border-2 border-dashed border-primary/30 rounded-xl p-4 bg-primary/5 hover:bg-primary/10 transition flex flex-col items-center justify-center min-h-[200px] group">
                    <input 
                        type="file" accept="image/*" required
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {previewImage ? (
                        <img src={previewImage} alt="Main Preview" className="h-40 object-contain rounded-lg shadow-sm" />
                    ) : (
                        <div className="text-center text-gray-500">
                            <span className="text-3xl">📸</span>
                            <p className="text-sm font-bold mt-2">Foto Utama (Wajib)</p>
                        </div>
                    )}
                </div>

                {/* 2. FOTO TAMBAHAN (OPSIONAL) */}
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition flex flex-col items-center justify-center min-h-[200px]">
                    <input 
                        type="file" accept="image/*" multiple
                        onChange={handleExtraFilesChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {previewExtras.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 w-full">
                            {previewExtras.map((src, idx) => (
                                <img key={idx} src={src} className="w-full h-16 object-cover rounded-md border border-gray-200" />
                            ))}
                            <div className="absolute bottom-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                + Ganti Foto
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            <span className="text-3xl">➕</span>
                            <p className="text-sm font-bold mt-2">Foto Tambahan</p>
                            <p className="text-xs">Bisa pilih banyak sekaligus</p>
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* INPUT DATA TEXT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Nama Hewan</label>
              <input type="text" name="name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Misal: Mochi" value={formData.name} onChange={handleChange} required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Jenis Hewan</label>
              <select name="species" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                value={formData.species} onChange={handleChange}
              >
                <option value="cat">Kucing 🐱</option>
                <option value="dog">Anjing 🐶</option>
                <option value="other">Lainnya 🐰</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Ras (Opsional)</label>
              <input type="text" name="breed" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Misal: Persia" value={formData.breed} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Umur (Bulan)</label>
              <input type="number" name="age" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Contoh: 12" value={formData.age} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Jenis Kelamin</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                  <input type="radio" name="gender" value="male" checked={formData.gender === "male"} onChange={handleChange} className="text-primary accent-primary" />
                  <span className="text-gray-700">Jantan ♂️</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                  <input type="radio" name="gender" value="female" checked={formData.gender === "female"} onChange={handleChange} className="text-primary accent-primary" />
                  <span className="text-gray-700">Betina ♀️</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Status Kesehatan</label>
              <input type="text" name="health_status" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Vaksin? Steril?" value={formData.health_status} onChange={handleChange} required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">Cerita Singkat</label>
            <textarea name="description" rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Ceritakan tentang sifatnya..." value={formData.description} onChange={handleChange} required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => router.back()} className="px-6 py-2 text-gray-500 font-bold hover:text-dark transition">Batal</button>
            <button type="submit" disabled={isLoading} className="bg-primary text-white px-8 py-2 rounded-xl font-bold hover:bg-[#6b7c40] transition shadow-md disabled:opacity-50">
              {isLoading ? "Mengirim..." : "Kirim Donasi"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}