"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function Register() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", password_confirmation: "", phone_number: "", address: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({}); 
  
  // STATE SHOW HIDE PASSWORD (2 State terpisah)
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validateForm = () => {
    const newErrors: any = {};
    let isValid = true;
    if (formData.password.length < 8) { newErrors.password = ["Password wajib min 8 karakter."]; isValid = false; }
    if (formData.password !== formData.password_confirmation) { newErrors.password_confirmation = ["Password tidak cocok."]; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { toast.error("Perbaiki data yang salah."); return; }
    setIsLoading(true);

    try {
      await api.post("/register", formData);
      toast.success("Registrasi Berhasil! Mengalihkan...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
        toast.error("Gagal! Periksa inputan Anda.");
      } else {
        toast.error("Terjadi kesalahan sistem.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = (fieldName: string) => {
    return `w-full px-4 py-3 border rounded-xl focus:outline-none transition bg-gray-50 focus:bg-white ${
      errors[fieldName] ? "border-danger focus:ring-2 focus:ring-danger/50 bg-red-50" : "border-gray-300 focus:ring-2 focus:ring-primary"
    }`;
  };

  // Helper Component Icon Mata (Biar kodenya rapi)
  const EyeIcon = ({ isVisible, onClick }: { isVisible: boolean, onClick: () => void }) => (
    <button type="button" onClick={onClick} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition">
        {isVisible ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
        )}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row">
        
        {/* KOLOM KIRI: ILUSTRASI */}
        <div className="hidden md:flex md:w-5/12 bg-accent p-12 flex-col justify-center items-center text-dark relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paw-prints.png')]"></div>
            <div className="relative z-10 text-center">
                <h2 className="text-4xl font-bold mb-4">Bergabung Bersama Kami!</h2>
                <p className="text-dark/80 text-lg mb-8">Jadilah bagian dari komunitas pecinta hewan dan bantu mereka menemukan rumah impian.</p>
                <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center text-6xl backdrop-blur-sm">
                    🐾
                </div>
            </div>
        </div>

        {/* KOLOM KANAN: FORM */}
        <div className="w-full md:w-7/12 p-8 md:p-12 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-3xl font-bold text-primary mb-2">Buat Akun Baru</h2>
            <p className="text-gray-500 mb-8">Isi data diri Anda untuk mendaftar.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-dark mb-1">Nama Lengkap</label>
                    <input type="text" name="name" className={getInputClass("name")} placeholder="Budi Santoso" value={formData.name} onChange={handleChange} required />
                    {errors.name && <p className="text-danger text-xs mt-1 font-bold">{errors.name[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-dark mb-1">Email</label>
                    <input type="email" name="email" className={getInputClass("email")} placeholder="email@anda.com" value={formData.email} onChange={handleChange} required />
                    {errors.email && <p className="text-danger text-xs mt-1 font-bold">{errors.email[0]}</p>}
                  </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-dark mb-1">Password</label>
                  <div className="relative">
                      <input 
                          type={showPass ? "text" : "password"} 
                          name="password" 
                          className={getInputClass("password")} 
                          placeholder="Min. 8 Karakter" 
                          value={formData.password} onChange={handleChange} required 
                      />
                      <EyeIcon isVisible={showPass} onClick={() => setShowPass(!showPass)} />
                  </div>
                  {errors.password && <p className="text-danger text-xs mt-1 font-bold">{errors.password[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-dark mb-1">Ulangi Password</label>
                  <div className="relative">
                      <input 
                          type={showConfirm ? "text" : "password"} 
                          name="password_confirmation" 
                          className={getInputClass("password_confirmation")} 
                          placeholder="******" 
                          value={formData.password_confirmation} onChange={handleChange} required 
                      />
                      <EyeIcon isVisible={showConfirm} onClick={() => setShowConfirm(!showConfirm)} />
                  </div>
                  {errors.password_confirmation && <p className="text-danger text-xs mt-1 font-bold">{errors.password_confirmation[0]}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-dark mb-1">No. WhatsApp</label>
                <input type="text" name="phone_number" className={getInputClass("phone_number")} placeholder="08123456789" value={formData.phone_number} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-sm font-bold text-dark mb-1">Alamat</label>
                <textarea name="address" className={getInputClass("address")} placeholder="Alamat domisili..." rows={2} value={formData.address} onChange={handleChange} />
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-[#6b7c40] transition shadow-lg disabled:opacity-50 mt-4">
                {isLoading ? "Memproses..." : "Daftar Sekarang"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Sudah punya akun? <Link href="/login" className="text-accent font-bold hover:underline">Masuk di sini</Link>
            </p>
        </div>

      </div>
    </div>
  );
}