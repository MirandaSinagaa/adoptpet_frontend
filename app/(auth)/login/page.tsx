"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading("Sedang masuk...");

    try {
      const response = await api.post("/login", formData);
      const { access_token, data } = response.data;

      sessionStorage.setItem("token", access_token);
      sessionStorage.setItem("user", JSON.stringify(data));

      toast.dismiss(loadingToast);
      toast.success(`Selamat datang, ${data.name}!`);

      if (data.role === 'admin') router.push("/admin/dashboard"); 
      else router.push("/dashboard"); 

    } catch (error: any) {
      toast.dismiss(loadingToast);
      if (error.response && error.response.status === 401) toast.error("Email atau Password salah!");
      else toast.error("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        
        {/* KOLOM KIRI: ILUSTRASI (Hanya di Desktop) */}
        <div className="hidden md:flex md:w-1/2 bg-primary p-12 flex-col justify-center items-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paw-prints.png')]"></div>
            <div className="relative z-10 text-center">
                <h2 className="text-4xl font-bold mb-4">Selamat Datang Kembali!</h2>
                <p className="text-white/90 text-lg mb-8">Masuk untuk melanjutkan perjalanan adopsi Anda dan temukan sahabat baru.</p>
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-6xl backdrop-blur-sm">
                    🏠
                </div>
            </div>
        </div>

        {/* KOLOM KANAN: FORM */}
        <div className="w-full md:w-1/2 p-8 md:p-12 relative">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
            
            <h2 className="text-3xl font-bold text-primary mb-2">Masuk Akun</h2>
            <p className="text-gray-500 mb-8">Silakan masuk dengan akun Anda.</p>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div>
                <label className="block text-sm font-bold text-dark mb-2">Email</label>
                <input 
                  type="email" name="email" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition bg-gray-50 focus:bg-white"
                  placeholder="nama@email.com"
                  value={formData.email} onChange={handleChange} required 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-dark mb-2">Password</label>
                <input 
                  type="password" name="password" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                  value={formData.password} onChange={handleChange} required 
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-[#6b7c40] transition shadow-lg shadow-primary/30 disabled:opacity-50 transform hover:-translate-y-0.5"
              >
                {isLoading ? "Memproses..." : "Masuk Sekarang"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-8">
              Belum punya akun? <Link href="/register" className="text-accent font-bold hover:underline">Daftar Gratis</Link>
            </p>
        </div>

      </div>
    </div>
  );
}