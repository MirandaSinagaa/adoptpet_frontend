"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function AdminAdoptions() {
  const [adoptions, setAdoptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk Modal & Flow
  const [selectedAdoption, setSelectedAdoption] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'detail' | 'reject-input' | 'approve-confirm'>('detail');
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAdoptions = async () => {
    try {
      const response = await api.get("/admin/adoptions");
      setAdoptions(response.data.data);
    } catch (error) {
      toast.error("Gagal memuat data adopsi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdoptions();
  }, []);

  // Helper untuk membuka modal
  const openModal = (adoption: any) => {
    setSelectedAdoption(adoption);
    setViewMode('detail'); // Reset ke tampilan detail awal
    setRejectReason("");
  };

  // Helper untuk menutup modal
  const closeModal = () => {
    setSelectedAdoption(null);
    setViewMode('detail');
    setRejectReason("");
    setIsProcessing(false);
  };

  // Eksekusi API (Approve / Reject)
  const executeAction = async (status: 'approve' | 'reject') => {
    if (status === 'reject' && !rejectReason.trim()) {
        toast.error("Alasan penolakan wajib diisi!");
        return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading("Memproses data...");

    try {
        await api.patch(`/admin/adoptions/${selectedAdoption.id}/${status}`, { 
            admin_note: status === 'reject' ? rejectReason : null 
        });
        
        toast.dismiss(loadingToast);
        toast.success(`Pengajuan berhasil di-${status === 'approve' ? 'setujui' : 'tolak'}.`);
        
        closeModal();
        fetchAdoptions(); // Refresh list

    } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Gagal memproses permintaan.");
        setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard" className="text-gray-500 hover:text-dark font-medium transition">← Kembali ke Dashboard</Link>
      </div>
      
      <div className="flex justify-between items-end">
        <h1 className="text-2xl font-bold text-dark">Daftar Pending Adopsi</h1>
        <span className="bg-secondary/30 text-dark px-3 py-1 rounded-full text-xs font-bold">
            {adoptions.length} Pengajuan
        </span>
      </div>

      {adoptions.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="text-6xl mb-4 grayscale opacity-50">📭</div>
            <h3 className="text-lg font-bold text-gray-400">Belum ada pengajuan baru</h3>
            <p className="text-gray-400 text-sm">Semua pengajuan adopsi sudah diproses.</p>
        </div>
      ) : (
        <div className="grid gap-4">
            {adoptions.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition">
                    <div className="flex items-center gap-5 flex-1">
                        <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center font-bold text-2xl border border-accent/20">
                            👤
                        </div>
                        <div>
                            <h3 className="font-bold text-dark text-lg">{item.user?.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <span>Ingin adopsi:</span>
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold text-xs border border-primary/20">
                                    {item.pet?.name}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Diajukan: {new Date(item.created_at).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => openModal(item)}
                        className="bg-dark text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition text-sm w-full md:w-auto shadow-lg shadow-gray-200"
                    >
                        🔍 Tinjau Berkas
                    </button>
                </div>
            ))}
        </div>
      )}

      {/* --- MODAL UTAMA --- */}
      {selectedAdoption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* HEADER MODAL */}
                <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-primary">
                            {viewMode === 'detail' && 'Review Pengajuan'}
                            {viewMode === 'reject-input' && 'Tolak Pengajuan'}
                            {viewMode === 'approve-confirm' && 'Konfirmasi Persetujuan'}
                        </h2>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mt-1">
                            ID: #{selectedAdoption.id} • {selectedAdoption.user?.name}
                        </p>
                    </div>
                    <button 
                        onClick={closeModal} 
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-danger hover:bg-red-50 transition shadow-sm"
                    >
                        ✕
                    </button>
                </div>

                {/* CONTENT MODAL (DYNAMIC VIEW) */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    
                    {/* VIEW 1: DETAIL NORMAL */}
                    {viewMode === 'detail' && (
                        <div className="space-y-6">
                             {/* Info Singkat */}
                             <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-yellow-200 shrink-0">
                                    {selectedAdoption.pet?.image_url ? (
                                        <img 
                                            src={selectedAdoption.pet.image_url} 
                                            alt={selectedAdoption.pet.name} 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">🐶</div>
                                    )}
                                </div>

                             {/* Alasan */}
                             <div>
                                <h4 className="text-sm font-bold text-dark border-l-4 border-primary pl-3 mb-2">Alasan Adopsi</h4>
                                <p className="text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm leading-relaxed">
                                    "{selectedAdoption.reason}"
                                </p>
                             </div>

                             {/* Environment */}
                             <div>
                                <h4 className="text-sm font-bold text-dark border-l-4 border-accent pl-3 mb-2">Data Screening & Lingkungan</h4>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <pre className="text-gray-600 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                        {selectedAdoption.environment_desc}
                                    </pre>
                                </div>
                             </div>

                             {/* Action Buttons */}
                             <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => setViewMode('reject-input')}
                                    className="flex-1 bg-white text-danger border border-danger/30 py-3 rounded-xl font-bold hover:bg-red-50 transition"
                                >
                                    ❌ Tolak
                                </button>
                                <button 
                                    onClick={() => setViewMode('approve-confirm')}
                                    className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-[#6b7c40] transition shadow-md"
                                >
                                    ✅ Setujui
                                </button>
                             </div>
                        </div>
                    )}

                    {/* VIEW 2: FORM PENOLAKAN */}
                    {viewMode === 'reject-input' && (
                        <div className="space-y-4">
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3 text-danger text-sm">
                                <span className="text-xl">⚠️</span>
                                <p>Anda akan menolak pengajuan ini. Harap berikan alasan yang jelas agar user mengerti.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-dark mb-2">Alasan Penolakan <span className="text-danger">*</span></label>
                                <textarea 
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-danger focus:outline-none h-32 resize-none"
                                    placeholder="Contoh: Maaf, kondisi lingkungan belum memadai untuk anjing ras besar..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    onClick={() => setViewMode('detail')}
                                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button 
                                    onClick={() => executeAction('reject')}
                                    disabled={isProcessing || !rejectReason.trim()}
                                    className="flex-1 bg-danger text-white py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? "Menolak..." : "Konfirmasi Tolak"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* VIEW 3: KONFIRMASI APPROVE */}
                    {viewMode === 'approve-confirm' && (
                        <div className="text-center space-y-6 py-4">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto animate-bounce">
                                🎉
                            </div>
                            
                            <div>
                                <h3 className="text-xl font-bold text-dark mb-2">Setujui Adopsi Ini?</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    Status hewan <strong>{selectedAdoption.pet?.name}</strong> akan berubah menjadi <span className="text-dark font-bold">Teradopsi</span> dan tidak akan muncul lagi di galeri publik.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    onClick={() => setViewMode('detail')}
                                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button 
                                    onClick={() => executeAction('approve')}
                                    disabled={isProcessing}
                                    className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-[#6b7c40] transition shadow-md disabled:opacity-50"
                                >
                                    {isProcessing ? "Memproses..." : "Ya, Setujui Sekarang"}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
      )}

    </div>
  );
}