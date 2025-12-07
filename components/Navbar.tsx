"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const [user, setUser] = useState<any>(null); // State untuk data user lengkap (Avatar/Nama)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false); // State dropdown
  
  const pathname = usePathname(); 
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref untuk deteksi klik luar

  // Logic: Tutup dropdown jika klik di luar area
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const storedUser = sessionStorage.getItem("user");
    
    setIsLoggedIn(!!token);
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUserRole(userData.role);
      setUser(userData); // Simpan data user ke state
    }
  }, [pathname]);

  const handleLogout = async () => {
    const loadingToast = toast.loading("Sedang keluar...");
    
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      
      setIsLoggedIn(false);
      setUserRole("user");
      setUser(null);
      
      toast.dismiss(loadingToast);
      toast.success("Berhasil keluar.");
      
      router.push("/login");
    }
  };

  return (
    <nav className="bg-primary shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <div className="flex items-center">
            <Link href="/" className="text-white font-bold text-2xl tracking-wide flex items-center gap-2">
              🐾 AdoptPet
            </Link>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${pathname === '/' ? 'text-accent' : 'text-white hover:text-accent'}`}>
                Beranda
              </Link>
              <Link href="/gallery" className={`px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${pathname.startsWith('/gallery') ? 'text-accent' : 'text-white hover:text-accent'}`}>
                Galeri Hewan
              </Link>
              <Link href="/articles" className={`px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${pathname.startsWith('/articles') ? 'text-accent' : 'text-white hover:text-accent'}`}>
                Tips
              </Link>
              
              {/* Menu Dinamis */}
              {isLoggedIn ? (
                <>
                  <Link 
                    href={userRole === 'admin' ? "/admin/dashboard" : "/dashboard"} 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${pathname.includes('dashboard') ? 'text-accent' : 'text-white hover:text-accent'}`}
                  >
                    Dashboard
                  </Link>

                  {/* WISHLIST (User Only) */}
                  {userRole !== 'admin' && (
                    <Link 
                        href="/wishlist" 
                        className={`px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${pathname.includes('wishlist') ? 'text-accent' : 'text-white hover:text-accent'}`}
                    >
                        Favorit ❤️
                    </Link>
                  )}

                  {/* USER DROPDOWN (AVATAR & NAMA) */}
                  <div className="ml-4 relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-1.5 rounded-full transition focus:outline-none"
                    >
                        {/* Avatar Circle */}
                        <div className="w-8 h-8 rounded-full bg-white overflow-hidden border-2 border-white/50">
                            {user?.avatar ? (
                                <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-primary font-bold bg-white">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                            )}
                        </div>
                        {/* Nama User (Truncate jika panjang) */}
                        <span className="text-sm font-bold max-w-[100px] truncate">
                            {user?.name?.split(" ")[0]}
                        </span>
                        <span className="text-xs">▼</span>
                    </button>

                    {/* Isi Dropdown */}
                    {isProfileDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 animate-fadeIn ring-1 ring-black ring-opacity-5 z-50">
                            <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                <p className="text-xs text-gray-500">Halo,</p>
                                <p className="text-sm font-bold text-dark truncate">{user?.name}</p>
                            </div>
                            
                            <Link 
                                href="/profile" 
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition"
                                onClick={() => setIsProfileDropdownOpen(false)}
                            >
                                ⚙️ Pengaturan Akun
                            </Link>
                            
                            <button 
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 hover:text-red-700 transition font-bold"
                            >
                                🚪 Keluar
                            </button>
                        </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="ml-4 flex gap-2">
                  <Link href="/login" className="text-white hover:text-secondary px-3 py-2 rounded-md text-sm font-medium">
                    Masuk
                  </Link>
                  <Link href="/register" className="bg-accent text-dark hover:bg-yellow-400 px-4 py-2 rounded-full text-sm font-bold transition duration-300 shadow-sm">
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-primary inline-flex items-center justify-center p-2 rounded-md text-white hover:text-accent focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="md:hidden bg-primary border-t border-white/20">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="text-white hover:text-accent block px-3 py-2 rounded-md text-base font-medium">
              Beranda
            </Link>
            <Link href="/gallery" className="text-white hover:text-accent block px-3 py-2 rounded-md text-base font-medium">
              Galeri Hewan
            </Link>
            <Link href="/articles" className="text-white hover:text-accent block px-3 py-2 rounded-md text-base font-medium">
              Tips
            </Link>

            {isLoggedIn ? (
              <>
                <Link 
                   href={userRole === 'admin' ? "/admin/dashboard" : "/dashboard"}
                   className="text-white hover:text-accent block px-3 py-2 rounded-md text-base font-medium"
                >
                  Dashboard
                </Link>
                
                {userRole !== 'admin' && (
                    <Link href="/wishlist" className="text-white hover:text-accent block px-3 py-2 rounded-md text-base font-medium">
                        Favorit ❤️
                    </Link>
                )}

                {/* Mobile: Menu Profil Tambahan */}
                <Link href="/profile" className="text-white hover:text-accent block px-3 py-2 rounded-md text-base font-medium">
                    ⚙️ Pengaturan Akun
                </Link>

                <button 
                  onClick={handleLogout}
                  className="w-full text-left text-danger hover:text-red-300 block px-3 py-2 rounded-md text-base font-bold"
                >
                  🚪 Keluar
                </button>
              </>
            ) : (
              <div className="mt-4 pt-4 border-t border-white/20">
                <Link href="/login" className="text-white hover:text-accent block px-3 py-2 rounded-md text-base font-medium">
                  Masuk
                </Link>
                <Link href="/register" className="text-accent hover:text-yellow-300 block px-3 py-2 rounded-md text-base font-bold">
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}