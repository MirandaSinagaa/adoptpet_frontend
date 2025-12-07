"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [isLoading, setIsLoading] = useState(false);
  
  // State User Data
  const [user, setUser] = useState<any>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  // Form State
  const [infoForm, setInfoForm] = useState({ name: "", phone_number: "", address: "" });
  const [passForm, setPassForm] = useState({ current_password: "", new_password: "", new_password_confirmation: "" });

  // 1. Fetch User Data Terbaru
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/user");
        const userData = response.data.data;
        setUser(userData);
        setInfoForm({
            name: userData.name || "",
            phone_number: userData.phone_number || "",
            address: userData.address || ""
        });
        setPreviewAvatar(userData.avatar);
        
        // PENTING: Sinkronkan sessionStorage saat load awal
        sessionStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        toast.error("Gagal memuat profil.");
      }
    };
    fetchUser();
  }, []);

  // 2. Handle Update Info
  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loading = toast.loading("Menyimpan profil...");

    try {
        const res = await api.put("/user/info", infoForm);
        
        // PERBAIKAN: Update Session Storage agar data di browser sinkron
        sessionStorage.setItem("user", JSON.stringify(res.data.data));
        setUser(res.data.data); 
        
        toast.dismiss(loading);
        toast.success("Profil berhasil diperbarui!");
    } catch (error) {
        toast.dismiss(loading);
        toast.error("Gagal update profil.");
    } finally {
        setIsLoading(false);
    }
  };

  // 3. Handle Ganti Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.new_password_confirmation) {
        toast.error("Konfirmasi password tidak cocok.");
        return;
    }

    setIsLoading(true);
    const loading = toast.loading("Mengganti password...");

    try {
        await api.put("/user/password", passForm);
        toast.dismiss(loading);
        toast.success("Password berhasil diganti!");
        setPassForm({ current_password: "", new_password: "", new_password_confirmation: "" }); 
    } catch (error: any) {
        toast.dismiss(loading);
        toast.error(error.response?.data?.message || "Gagal ganti password.");
    } finally {
        setIsLoading(false);
    }
  };

  // 4. Handle Ganti Avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewAvatar(URL.createObjectURL(file));
    
    const formData = new FormData();
    formData.append("avatar", file);
    
    const loading = toast.loading("Mengupload foto...");
    try {
        const res = await api.post("/user/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        
        // PERBAIKAN UTAMA: Update Session Storage agar Avatar tidak hilang saat refresh
        sessionStorage.setItem("user", JSON.stringify(res.data.data));
        setUser(res.data.data);
        
        toast.dismiss(loading);
        toast.success("Foto profil baru terpasang!");
    } catch (error) {
        toast.dismiss(loading);
        toast.error("Gagal upload foto.");
    }
  };

  if (!user) return <div className="p-10 text-center">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* HEADER PROFILE */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                {previewAvatar ? (
                    <img src={previewAvatar} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">👤</div>
                )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold opacity-0 group-hover:opacity-100 transition rounded-full cursor-pointer">
                <span>Ganti Foto</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
        </div>
        
        <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-dark">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
            <span className="inline-block mt-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase border border-primary/20">
                {user.role}
            </span>
        </div>
      </div>

      {/* TABS & FORM */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
            <button 
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-4 font-bold text-sm transition ${activeTab === 'info' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 hover:text-dark'}`}
            >
                📝 Edit Biodata
            </button>
            <button 
                onClick={() => setActiveTab('password')}
                className={`flex-1 py-4 font-bold text-sm transition ${activeTab === 'password' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 hover:text-dark'}`}
            >
                🔒 Ganti Password
            </button>
        </div>

        <div className="p-8">
            {activeTab === 'info' ? (
                <form onSubmit={handleUpdateInfo} className="space-y-6 max-w-lg mx-auto">
                    <div>
                        <label className="block text-sm font-bold text-dark mb-1">Nama Lengkap</label>
                        <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" value={infoForm.name} onChange={(e) => setInfoForm({...infoForm, name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-dark mb-1">No. WhatsApp</label>
                        <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" value={infoForm.phone_number} onChange={(e) => setInfoForm({...infoForm, phone_number: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-dark mb-1">Alamat</label>
                        <textarea className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" rows={3} value={infoForm.address} onChange={(e) => setInfoForm({...infoForm, address: e.target.value})} />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-[#6b7c40] disabled:opacity-50">
                        {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-lg mx-auto">
                    <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800 mb-4 border border-yellow-100">
                        Pastikan password baru minimal 8 karakter.
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-dark mb-1">Password Saat Ini</label>
                        <input type="password" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" value={passForm.current_password} onChange={(e) => setPassForm({...passForm, current_password: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-dark mb-1">Password Baru</label>
                        <input type="password" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" value={passForm.new_password} onChange={(e) => setPassForm({...passForm, new_password: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-dark mb-1">Ulangi Password Baru</label>
                        <input type="password" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" value={passForm.new_password_confirmation} onChange={(e) => setPassForm({...passForm, new_password_confirmation: e.target.value})} required />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-dark text-white py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50">
                        {isLoading ? "Memproses..." : "Ganti Password"}
                    </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}