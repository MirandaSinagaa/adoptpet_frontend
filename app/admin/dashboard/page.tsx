"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Tambahkan useRouter
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const router = useRouter(); // Inisialisasi Router
  
  const [data, setData] = useState({
    stats: {
        pendingDonations: 0,
        pendingAdoptions: 0,
        totalPets: 0,
        totalUsers: 0
    },
    activities: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. CEK TOKEN DI SESSION STORAGE (Proteksi Awal)
        const token = sessionStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        // Panggil endpoint Dashboard Overview
        const response = await api.get("/admin/dashboard-overview");
        
        const resData = response.data.data;
        setData({
            stats: {
                pendingDonations: resData.stats.pending_donations,
                pendingAdoptions: resData.stats.pending_adoptions,
                totalPets: resData.stats.total_pets,
                totalUsers: resData.stats.total_users
            },
            activities: resData.activities
        });

      } catch (error: any) {
        console.error(error);
        
        // 2. HANDLE ERROR 401 (Jika token expired/invalid)
        if (error.response && error.response.status === 401) {
            toast.error("Sesi admin habis. Silakan login ulang.");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            router.push("/login");
        } else {
            toast.error("Gagal memuat data dashboard.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div>
            <h1 className="text-3xl font-bold text-dark">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Selamat datang kembali, Administrator.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-sm border border-primary/20">
                ● System Online
            </span>
            <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold text-sm">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
        </div>
      </div>

      {/* STATISTIK CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition transform">
                <span className="text-6xl">📥</span>
            </div>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Verifikasi Donasi</p>
            <h3 className="text-4xl font-bold text-dark mt-2">{data.stats.pendingDonations}</h3>
            <p className="text-xs text-blue-500 mt-2 font-medium">Perlu tindakan segera</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition transform">
                <span className="text-6xl">🏠</span>
            </div>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Verifikasi Adopsi</p>
            <h3 className="text-4xl font-bold text-dark mt-2">{data.stats.pendingAdoptions}</h3>
            <p className="text-xs text-accent mt-2 font-medium">Calon adopter menunggu</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition transform">
                <span className="text-6xl">🐾</span>
            </div>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Hewan di Galeri</p>
            <h3 className="text-4xl font-bold text-dark mt-2">{data.stats.totalPets}</h3>
            <p className="text-xs text-green-600 mt-2 font-medium">Siap diadopsi publik</p>
        </div>

        {/* Card 4 */}
        <div className="bg-gradient-to-br from-primary to-[#6b7c40] p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
            <p className="text-white/80 text-sm font-bold uppercase tracking-wider">Total User</p>
            <h3 className="text-2xl font-bold mt-2">{data.stats.totalUsers} 👤</h3>
            <p className="text-xs text-white/70 mt-2">Database Connected</p>
        </div>
      </div>

      {/* SECTION BAWAH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SHORTCUT MENU */}
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            <Link href="/admin/donations" className="group h-full">
                <div className="bg-white h-full p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between">
                    <div>
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">📥</div>
                        <h2 className="text-xl font-bold text-dark mb-2">Manajemen Donasi</h2>
                        <p className="text-gray-500 text-sm">Cek kelengkapan data dan foto hewan yang masuk.</p>
                    </div>
                    <div className="mt-6 text-blue-600 font-bold text-sm group-hover:underline">Buka Halaman &rarr;</div>
                </div>
            </Link>

            <Link href="/admin/adoptions" className="group h-full">
                <div className="bg-white h-full p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-yellow-300 hover:shadow-md transition flex flex-col justify-between">
                    <div>
                        <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">📝</div>
                        <h2 className="text-xl font-bold text-dark mb-2">Manajemen Adopsi</h2>
                        <p className="text-gray-500 text-sm">Review profil calon adopter dan kondisi rumah.</p>
                    </div>
                    <div className="mt-6 text-yellow-600 font-bold text-sm group-hover:underline">Buka Halaman &rarr;</div>
                </div>
            </Link>

            <Link href="/admin/articles" className="group h-full">
                <div className="bg-white h-full p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition flex flex-col justify-between">
                    <div>
                        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">📚</div>
                        <h2 className="text-xl font-bold text-dark mb-2">Artikel Edukasi</h2>
                        <p className="text-gray-500 text-sm">Bagikan tips dari link terpercaya.</p>
                    </div>
                    <div className="mt-6 text-green-600 font-bold text-sm group-hover:underline">Kelola &rarr;</div>
                </div>
            </Link>

            <Link href="/admin/pets" className="group h-full">
                <div className="bg-white h-full p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-300 hover:shadow-md transition flex flex-col justify-between">
                    <div>
                        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">🐾</div>
                        <h2 className="text-xl font-bold text-dark mb-2">Master Data Hewan</h2>
                        <p className="text-gray-500 text-sm">Lihat semua database hewan (Available, Adopted).</p>
                    </div>
                    <div className="mt-6 text-purple-600 font-bold text-sm group-hover:underline">Buka Database &rarr;</div>
                </div>
            </Link>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold text-dark mb-6 flex items-center gap-2">
                ⏳ Aktivitas Terbaru
            </h3>
            
            {data.activities.length === 0 ? (
                <p className="text-gray-400 text-center text-sm py-10">Belum ada aktivitas baru.</p>
            ) : (
                <div className="space-y-6">
                    {data.activities.map((act: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-start relative">
                            {idx !== data.activities.length - 1 && (
                                <div className="absolute left-[19px] top-8 w-0.5 h-full bg-gray-100 -z-10"></div>
                            )}
                            
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 border-4 border-white shadow-sm ${act.type === 'donation' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                {act.type === 'donation' ? '📥' : '🏠'}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-dark">{act.user}</p>
                                <p className="text-xs text-gray-500 mb-1">{act.desc}</p>
                                <div className="flex gap-2 items-center">
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                        act.status === 'pending_review' || act.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        act.status === 'available' || act.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        act.status === 'adopted' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {act.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(act.date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}