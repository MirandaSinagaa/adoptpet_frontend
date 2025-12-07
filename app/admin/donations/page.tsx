"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function AdminDonations() {
  const [donations, setDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // STATE MODALS
  const [viewPet, setViewPet] = useState<any>(null); // Modal Detail
  const [editingPet, setEditingPet] = useState<any>(null); // Modal Edit
  
  // STATE KONFIRMASI (PENGGANTI ALERT)
  const [confirmAction, setConfirmAction] = useState<{type: 'approve'|'reject', id: number} | null>(null);
  const [rejectReason, setRejectReason] = useState(""); // Input alasan jika tolak
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State Form Edit
  const [editForm, setEditForm] = useState({
    name: "", breed: "", age: "", health_status: "", description: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeImage, setActiveImage] = useState<string>(""); 

  const fetchDonations = async () => {
    try {
      const response = await api.get("/admin/donations");
      setDonations(response.data.data);
    } catch (error) {
      toast.error("Gagal memuat data donasi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // --- ACTIONS (Trigger Modal Konfirmasi) ---
  const handleApproveClick = (id: number) => {
    setConfirmAction({ type: 'approve', id });
    setRejectReason("");
  };

  const handleRejectClick = (id: number) => {
    setConfirmAction({ type: 'reject', id });
    setRejectReason("");
  };

  // --- EKSEKUSI API SETELAH KONFIRMASI ---
  const executeConfirmAction = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'reject' && !rejectReason.trim()) {
        toast.error("Alasan penolakan wajib diisi!");
        return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading("Memproses...");

    try {
        await api.patch(`/admin/donations/${confirmAction.id}/${confirmAction.type}`, {
            admin_note: confirmAction.type === 'reject' ? rejectReason : null
        });

        toast.dismiss(loadingToast);
        toast.success(`Berhasil di-${confirmAction.type === 'approve' ? 'terima' : 'tolak'}.`);
        
        setConfirmAction(null); // Tutup modal konfirmasi
        setViewPet(null); // Tutup modal detail jika sedang terbuka
        fetchDonations(); // Refresh data
    } catch (error) { 
        toast.dismiss(loadingToast);
        toast.error("Gagal memproses."); 
    } finally {
        setIsProcessing(false);
    }
  };

  // --- VIEW DETAIL ACTION ---
  const openViewModal = (pet: any) => {
    setViewPet(pet);
    setActiveImage(pet.image_url); 
  };

  // --- EDIT ACTIONS ---
  const openEditModal = (pet: any) => {
    setEditingPet(pet);
    setEditForm({
        name: pet.name,
        breed: pet.breed || "",
        age: pet.age || "",
        health_status: pet.health_status,
        description: pet.description
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const loadingToast = toast.loading("Menyimpan perubahan...");

    try {
        await api.put(`/admin/pets/${editingPet.id}`, editForm);
        toast.dismiss(loadingToast);
        toast.success("Data berhasil diperbarui!");
        setEditingPet(null);
        fetchDonations();
    } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Gagal menyimpan.");
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard" className="text-gray-500 hover:text-dark">← Dashboard</Link>
        <h1 className="text-2xl font-bold text-dark">Daftar Pending Donasi</h1>
      </div>

      {donations.length === 0 ? (
        <div className="bg-white p-10 rounded-xl text-center shadow-sm border border-gray-100">
            <p className="text-gray-500">Tidak ada donasi yang menunggu verifikasi.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
            {donations.map((pet) => (
                <div key={pet.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4 relative group hover:shadow-md transition">
                    
                    {/* Badge Edit Cepat */}
                    <button 
                        onClick={() => openEditModal(pet)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-primary bg-white p-2 rounded-full shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition z-10"
                        title="Edit Data"
                    >
                        ✏️
                    </button>

                    <div className="flex gap-4 cursor-pointer" onClick={() => openViewModal(pet)}>
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                            {pet.image_url ? (
                                <img src={pet.image_url} className="w-full h-full object-cover" alt={pet.name} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-2xl">🐾</div>
                            )}
                        </div>
                        <div className="grow">
                            <div className="flex justify-between items-start pr-8">
                                <h3 className="font-bold text-lg text-dark hover:text-primary">{pet.name}</h3>
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase">{pet.species}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {pet.breed || 'Campuran'} • {pet.age ? `${pet.age} Bln` : '-'}
                            </p>
                            <p className="text-sm text-gray-500">Oleh: <span className="font-semibold">{pet.user?.name}</span></p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500 italic line-clamp-2">
                        "{pet.description}"
                    </div>
                    
                    <div className="flex gap-2 mt-auto">
                        <button 
                            onClick={() => openViewModal(pet)}
                            className="flex-1 bg-dark text-white border border-transparent px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition"
                        >
                            🔍 Detail
                        </button>
                        <button 
                            onClick={() => handleRejectClick(pet.id)}
                            className="bg-red-50 text-danger border border-red-100 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition"
                        >
                            ❌
                        </button>
                        <button 
                            onClick={() => handleApproveClick(pet.id)}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#6b7c40] transition"
                        >
                            ✅
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* --- MODAL 1: VIEW DETAIL LENGKAP --- */}
      {viewPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
                <button onClick={() => setViewPet(null)} className="absolute top-4 right-4 z-10 bg-white/50 hover:bg-white text-dark p-2 rounded-full font-bold transition">✕</button>
                
                {/* KOLOM KIRI: GALERI FOTO */}
                <div className="md:w-1/2 bg-black flex flex-col justify-center p-4">
                    <div className="relative h-64 md:h-80 w-full mb-4">
                         {activeImage ? (
                            <img src={activeImage} className="w-full h-full object-contain" />
                         ) : (
                            <div className="text-white text-center">No Image</div>
                         )}
                    </div>
                    
                    {/* Thumbnail List */}
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar justify-center">
                        <button onClick={() => setActiveImage(viewPet.image_url)} className={`w-16 h-16 rounded border-2 overflow-hidden shrink-0 ${activeImage === viewPet.image_url ? 'border-primary' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                            <img src={viewPet.image_url} className="w-full h-full object-cover" />
                        </button>
                        {viewPet.images && viewPet.images.map((img: any) => (
                            <button key={img.id} onClick={() => setActiveImage(img.image_url)} className={`w-16 h-16 rounded border-2 overflow-hidden shrink-0 ${activeImage === img.image_url ? 'border-primary' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                                <img src={img.image_url} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* KOLOM KANAN: DATA TEKS */}
                <div className="md:w-1/2 p-8 overflow-y-auto bg-white">
                    <h2 className="text-3xl font-bold text-dark mb-2">{viewPet.name}</h2>
                    <div className="flex gap-2 mb-6">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{viewPet.species}</span>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{viewPet.gender}</span>
                    </div>

                    <div className="space-y-4 text-sm text-dark">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="block text-xs text-gray-400 font-bold uppercase">Ras / Breed</span>
                                <span className="font-semibold">{viewPet.breed || '-'}</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="block text-xs text-gray-400 font-bold uppercase">Umur</span>
                                <span className="font-semibold">{viewPet.age ? `${viewPet.age} Bulan` : '-'}</span>
                            </div>
                        </div>

                        <div>
                            <span className="block text-xs text-gray-400 font-bold uppercase mb-1">Kondisi Kesehatan</span>
                            <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 font-medium">
                                🏥 {viewPet.health_status}
                            </div>
                        </div>

                        <div>
                            <span className="block text-xs text-gray-400 font-bold uppercase mb-1">Deskripsi Lengkap</span>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {viewPet.description}
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-100">
                             <span className="text-xs text-gray-400">Donatur:</span>
                             <p className="font-bold">{viewPet.user?.name}</p>
                             <p className="text-xs text-gray-400">Email: {viewPet.user?.email}</p>
                        </div>
                    </div>

                    {/* Action Buttons di Modal Detail (DITAMBAHKAN TOMBOL REJECT) */}
                    <div className="flex gap-2 mt-8 sticky bottom-0 bg-white pt-2">
                        <button onClick={() => openEditModal(viewPet)} className="flex-1 border border-gray-300 py-3 rounded-xl font-bold hover:bg-gray-50 transition">✏️ Edit</button>
                        <button onClick={() => handleRejectClick(viewPet.id)} className="flex-1 bg-red-50 text-danger border border-red-100 py-3 rounded-xl font-bold hover:bg-red-100 transition">❌ Tolak</button>
                        <button onClick={() => handleApproveClick(viewPet.id)} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-[#6b7c40] transition">✅ Terima</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL 2: EDIT DATA --- */}
      {editingPet && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative my-10">
                <button onClick={() => setEditingPet(null)} className="absolute top-4 right-4 text-gray-400 hover:text-dark font-bold text-xl">✕</button>
                <h2 className="text-xl font-bold text-primary mb-6">Edit Data Hewan</h2>
                <form onSubmit={saveEdit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-dark mb-1">Nama Hewan</label>
                        <input type="text" name="name" required className="w-full px-4 py-2 border rounded-lg" value={editForm.name} onChange={handleEditChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-dark mb-1">Ras</label>
                            <input type="text" name="breed" className="w-full px-4 py-2 border rounded-lg" value={editForm.breed} onChange={handleEditChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-dark mb-1">Umur</label>
                            <input type="number" name="age" className="w-full px-4 py-2 border rounded-lg" value={editForm.age} onChange={handleEditChange} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-dark mb-1">Kesehatan</label>
                        <input type="text" name="health_status" required className="w-full px-4 py-2 border rounded-lg" value={editForm.health_status} onChange={handleEditChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-dark mb-1">Deskripsi</label>
                        <textarea name="description" rows={6} required className="w-full px-4 py-2 border rounded-lg" value={editForm.description} onChange={handleEditChange} />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setEditingPet(null)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl">Batal</button>
                        <button type="submit" disabled={isSaving} className="flex-1 bg-accent text-dark font-bold py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-50">{isSaving ? "Menyimpan..." : "Simpan"}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- MODAL 3: KONFIRMASI (PENGGANTI ALERT) --- */}
      {confirmAction && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative">
                <button onClick={() => setConfirmAction(null)} className="absolute top-4 right-4 text-gray-400 hover:text-dark">✕</button>
                
                <div className="text-4xl mb-4">{confirmAction.type === 'approve' ? '✅' : '⚠️'}</div>
                <h3 className="text-xl font-bold text-dark mb-2">
                    {confirmAction.type === 'approve' ? 'Setujui Donasi?' : 'Tolak Donasi?'}
                </h3>

                {/* INPUT ALASAN JIKA REJECT */}
                {confirmAction.type === 'reject' ? (
                    <div className="mt-4 text-left">
                        <label className="text-sm font-bold text-danger block mb-1">Alasan Penolakan (Wajib)</label>
                        <textarea 
                            className="w-full border border-red-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-danger focus:outline-none"
                            rows={3}
                            placeholder="Contoh: Foto kurang jelas, data tidak valid..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            autoFocus
                        />
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm mb-6">
                        Hewan akan langsung tampil di galeri publik.
                    </p>
                )}

                <div className="flex gap-3 mt-6">
                    <button 
                        onClick={() => setConfirmAction(null)} 
                        className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={executeConfirmAction}
                        disabled={isProcessing}
                        className={`flex-1 py-2 text-white font-bold rounded-lg transition disabled:opacity-50 ${confirmAction.type === 'approve' ? 'bg-primary hover:bg-[#6b7c40]' : 'bg-danger hover:bg-red-700'}`}
                    >
                        {isProcessing ? "Memproses..." : (confirmAction.type === 'approve' ? 'Ya, Terima' : 'Tolak Sekarang')}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}