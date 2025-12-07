"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function AdminArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Loading awal
  const [isFetching, setIsFetching] = useState(false); // Loading saat crawling

  const fetchArticles = async () => {
    try {
      // Kita pakai endpoint public untuk listnya (cukup)
      const response = await api.get("/articles"); 
      setArticles(response.data.data);
    } catch (error) {
      toast.error("Gagal memuat daftar artikel.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!url) return;

    setIsFetching(true);
    const loadingToast = toast.loading("Sedang mengambil data dari link...");

    try {
        // Panggil endpoint crawling yang sudah kita buat di Laravel
        await api.post("/admin/articles", { url });
        
        toast.dismiss(loadingToast);
        toast.success("Berhasil! Artikel ditambahkan.");
        
        setUrl(""); // Reset input
        fetchArticles(); // Refresh list
    } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Gagal mengambil data. Pastikan link valid.");
    } finally {
        setIsFetching(false);
    }
  };

  const handleDelete = async (id: number) => {
    // Kita pakai confirm biasa dulu biar cepat, nanti bisa diganti modal
    if(!confirm("Yakin ingin menghapus artikel ini?")) return;

    try {
        await api.delete(`/admin/articles/${id}`);
        toast.success("Artikel dihapus.");
        fetchArticles();
    } catch(error) {
        toast.error("Gagal menghapus.");
    }
  };

  if(isLoading) {
    return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* HEADER */}
        <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-500 hover:text-dark font-medium transition">← Dashboard</Link>
            <h1 className="text-2xl font-bold text-dark">Kelola Artikel Edukasi</h1>
        </div>

        {/* SECTION INPUT CRAWLER */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl">🔗</div>
                <div>
                    <h2 className="text-lg font-bold text-dark">Tambah Artikel Baru</h2>
                    <p className="text-sm text-gray-500">Paste link artikel dari website lain, sistem akan mengambil judul & gambar otomatis.</p>
                </div>
            </div>
            
            <form onSubmit={handleCrawl} className="flex gap-3">
                <input 
                    type="url" 
                    placeholder="Contoh: https://www.halodoc.com/artikel/cara-merawat-kucing-persia" 
                    className="flex-1 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                />
                <button 
                    type="submit" 
                    disabled={isFetching}
                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-[#6b7c40] disabled:opacity-50 transition shadow-md whitespace-nowrap"
                >
                    {isFetching ? "⏳ Mengambil..." : "➕ Ambil Data"}
                </button>
            </form>
        </div>

        {/* LIST ARTIKEL */}
        {articles.length === 0 ? (
            <div className="text-center py-10">
                <p className="text-gray-400">Belum ada artikel. Coba tambahkan satu!</p>
            </div>
        ) : (
            <div className="grid md:grid-cols-2 gap-6">
                {articles.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 relative group hover:shadow-md transition">
                        
                        {/* Tombol Hapus */}
                        <button 
                            onClick={() => handleDelete(item.id)} 
                            className="absolute top-2 right-2 bg-white text-danger p-2 rounded-full shadow-md border border-gray-100 opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
                            title="Hapus Artikel"
                        >
                            🗑️
                        </button>

                        {/* Thumbnail */}
                        <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                            {item.image_url ? (
                                <img src={item.image_url} className="w-full h-full object-cover" alt="Thumbnail" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-2xl">📰</div>
                            )}
                        </div>

                        {/* Info Artikel */}
                        <div className="flex flex-col justify-between py-1">
                            <div>
                                <h3 className="font-bold text-dark line-clamp-2 leading-snug hover:text-primary transition">
                                    <a href={item.original_url} target="_blank" rel="noreferrer">{item.title}</a>
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wide">
                                        {item.source_host}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            
                            <a 
                                href={item.original_url} 
                                target="_blank" 
                                className="text-xs text-blue-500 font-bold hover:underline flex items-center gap-1 mt-2"
                            >
                                Baca Sumber Asli ↗
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}