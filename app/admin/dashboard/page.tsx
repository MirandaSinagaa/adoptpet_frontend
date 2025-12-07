"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";

type StatsType = {
  pendingDonations: number;
  pendingAdoptions: number;
  totalPets: number;
  totalUsers: number;
};

type ActivityType = {
  type: string;
  user: string;
  desc: string;
  date: string;
};

export default function AdminDashboard() {
  const router = useRouter();

  const [data, setData] = useState<{
    stats: StatsType;
    activities: ActivityType[];
  }>({
    stats: {
      pendingDonations: 0,
      pendingAdoptions: 0,
      totalPets: 0,
      totalUsers: 0
    },
    activities: []
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await api.get("/admin/dashboard-overview");

        setData({
          stats: response.data.data.stats,
          activities: response.data.data.activities
        });

      } catch (error: any) {
        console.error(error);
        if (error.response?.status === 401) {
          toast.error("Sesi admin habis.");
          sessionStorage.clear();
          router.push("/login");
        } else {
          toast.error("Gagal memuat data dashboard.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div>
          <h1 className="text-3xl font-bold text-dark">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Pantau seluruh aktivitas platform secara real-time.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <span className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-sm border border-primary/20">
            ● System Online
          </span>
          <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold text-sm">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Verifikasi Donasi" icon="📥" value={data.stats.pendingDonations} note="Perlu tindakan segera" />
        <StatsCard title="Verifikasi Adopsi" icon="🏠" value={data.stats.pendingAdoptions} note="Calon adopter menunggu" />
        <StatsCard title="Hewan di Galeri" icon="🐾" value={data.stats.totalPets} note="Siap diadopsi publik" />
        <div className="bg-gradient-to-br from-primary to-[#6b7c40] p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <p className="text-white/80 text-sm font-bold uppercase tracking-wider">Total User</p>
          <h3 className="text-2xl font-bold mt-2">{data.stats.totalUsers} 👤</h3>
          <p className="text-xs text-white/70 mt-2">Database Connected</p>
        </div>
      </div>

      {/* SHORTCUT + АКTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ShortcutMenu />
        <RecentActivity activities={data.activities} />
      </div>
    </div>
  );
}

function StatsCard({ title, icon, value, note }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
      <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition transform">
        <span className="text-6xl">{icon}</span>
      </div>
      <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-4xl font-bold text-dark mt-2">{value}</h3>
      <p className="text-xs text-blue-500 mt-2 font-medium">{note}</p>
    </div>
  );
}

function ShortcutMenu() {
  return (
    <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
      <ShortcutCard href="/admin/donations" title="Manajemen Donasi" icon="📥" color="blue" desc="Cek kelengkapan data dan foto hewan." />
      <ShortcutCard href="/admin/adoptions" title="Manajemen Adopsi" icon="📝" color="yellow" desc="Review profil calon adopter." />
      <ShortcutCard href="/admin/articles" title="Artikel Edukasi" icon="📚" color="green" desc="Bagikan tips terpercaya." />
      <ShortcutCard href="/admin/pets" title="Master Data Hewan" icon="🐾" color="purple" desc="Kelola database hewan." />
    </div>
  );
}

function ShortcutCard({ href, title, icon, color, desc }: any) {
  return (
    <Link href={href} className="group h-full">
      <div className={`bg-white h-full p-8 rounded-2xl shadow-sm border hover:border-${color}-300 hover:shadow-md transition flex flex-col justify-between`}>
        <div>
          <div className={`w-14 h-14 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition`}>
            {icon}
          </div>
          <h2 className="text-xl font-bold text-dark mb-2">{title}</h2>
          <p className="text-gray-500 text-sm">{desc}</p>
        </div>
        <div className={`mt-6 text-${color}-600 font-bold text-sm group-hover:underline`}>
          Buka Halaman →
        </div>
      </div>
    </Link>
  );
}

function RecentActivity({ activities }: { activities: ActivityType[] }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-bold text-dark mb-6 flex items-center gap-2">⏳ Aktivitas Terbaru</h3>

      {activities.length === 0 ? (
        <p className="text-gray-400 text-center text-sm py-10">Belum ada aktivitas baru.</p>
      ) : (
        <div className="space-y-6">
          {activities.map((act, idx) => {
            const config = getActivityConfig(act.type);
            return (
              <div key={idx} className="flex gap-4 items-start relative">
                {idx !== activities.length - 1 && (
                  <div className="absolute left-[19px] top-8 w-0.5 h-full bg-gray-100 -z-10"></div>
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 border-4 border-white shadow-sm ${config.color}`}>
                  {config.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-dark">{act.user}</p>
                  <p className="text-xs text-gray-500 mb-1 font-medium">{act.desc}</p>
                  <p className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded inline-block">
                    {new Date(act.date).toLocaleDateString()} • {new Date(act.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getActivityConfig(type: string) {
  switch (type) {
    case "register": return { icon: "👋", color: "bg-purple-100 text-purple-600" };
    case "donation": return { icon: "📥", color: "bg-blue-100 text-blue-600" };
    case "approve": return { icon: "✅", color: "bg-green-100 text-green-600" };
    case "reject": return { icon: "❌", color: "bg-red-100 text-red-600" };
    case "cancel": return { icon: "🚫", color: "bg-gray-200 text-gray-600" };
    case "adoption_request": return { icon: "💌", color: "bg-yellow-100 text-yellow-600" };
    case "adoption_approve": return { icon: "🤝", color: "bg-teal-100 text-teal-600" };
    case "adoption_reject": return { icon: "🙅‍♂️", color: "bg-orange-100 text-orange-600" };
    case "success": return { icon: "🏡", color: "bg-indigo-100 text-indigo-600" };
    default: return { icon: "📝", color: "bg-gray-100 text-gray-600" };
  }
}
