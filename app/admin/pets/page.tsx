"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function AdminPetsMaster() {
  const [pets, setPets] = useState<any[]>([]);
  const [filteredPets, setFilteredPets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter & Search
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [viewPet, setViewPet] = useState<any>(null);
  const [editingPet, setEditingPet] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null); // Untuk Modal Hapus

  // State Edit Form
  const [editForm, setEditForm] = useState({ name: "", breed: "", age: "", health_status: "", description: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");

  const fetchPets = async () => {
    try {
      const response = await api.get("/admin/pets");
      setPets(response.data.data);
      setFilteredPets(response.data.data);
    } catch (error) {
      toast.error("Gagal memuat data hewan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  // Logic Filter & Search
  useEffect(() => {
    let result = pets;

    if (filterStatus !== "all") {
        result = result.filter(pet => pet.status === filterStatus);
    }

    if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(pet => 
            pet.name.toLowerCase().includes(lower) || 
            pet.user?.name.toLowerCase().includes(lower)
        );
    }

    setFilteredPets(result);
  }, [pets, filterStatus, searchQuery]);

  // --- ACTIONS ---

  const handleDelete = async () => {
    if (!deleteId) return;
    const loading = toast.loading("Menghapus...");
    try {
        await api.delete(`/admin/pets/${deleteId}`);
        toast.dismiss(loading);
        toast.success("Hewan dihapus permanen.");
        setDeleteId(null);
        fetchPets();
    } catch (error) {
        toast.dismiss(loading);
        toast.error("Gagal menghapus.");
    }
  };

  const openEdit = (pet: any) => {
    setEditingPet(pet);
    setEditForm({
        name: pet.name,
        breed: pet.breed || "",
        age: pet.age || "",
        health_status: pet.health_status,
        description: pet.description
    });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        await api.put(`/admin/pets/${editingPet.id}`, editForm);
        toast.success("Data diupdate!");
        setEditingPet(null);
        fetchPets();
    } catch (error) { toast.error("Gagal update."); }
    finally { setIsSaving(false); }
  };

  const openView = (pet: any) => {
    setViewPet(pet);
    setActiveImage(pet.image_url);
  };

  // Helper Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'available': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Available</span>;
        case 'adopted': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Adopted</span>;
        case 'pending_review': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">Pending</span>;
        case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Rejected</span>;
        default: return status;
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading Data...</div>;

  return (
    <div className="space-y-6">
        {/* HEADER & TOOLS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div>
                <h1 className="text-2xl font-bold text-dark">Master Data Hewan</h1>
                <p className="text-gray-500 text-sm">Kelola semua data hewan di platform.</p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
                <select 
                    className="border px-4 py-2 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-primary outline-none"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">Semua Status</option>
                    <option value="available">Available (Tayang)</option>
                    <option value="adopted">Adopted (Laku)</option>
                    <option value="pending_review">Pending</option>
                    <option value="rejected">Rejected</option>
                </select>
                <input 
                    type="text" 
                    placeholder="Cari nama hewan / donatur..." 
                    className="border px-4 py-2 rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-primary outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        {/* TABEL DATA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Hewan</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Donatur (Pemilik Awal)</th>
                            <th className="px-6 py-4">Adopter (Pemilik Baru)</th>
                            <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredPets.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8">Data tidak ditemukan.</td></tr>
                        ) : (
                            filteredPets.map((pet) => (
                                <tr key={pet.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200">
                                                <img src={pet.image_url} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-dark">{pet.name}</p>
                                                <p className="text-xs text-gray-400">{pet.species} • {pet.breed}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(pet.status)}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-dark">{pet.user?.name}</p>
                                        <p className="text-xs text-gray-400">{pet.user?.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* Cek apakah ada adopter yang approved */}
                                        {pet.adoptions && pet.adoptions.length > 0 ? (
                                            <div>
                                                <p className="font-medium text-green-700">{pet.adoptions[0].user?.name}</p>
                                                <p className="text-xs text-green-600">Disetujui</p>
                                            </div>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openView(pet)} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Detail">👁️</button>
                                            <button onClick={() => openEdit(pet)} className="p-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100" title="Edit">✏️</button>
                                            <button onClick={() => setDeleteId(pet.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Hapus">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* MODAL 1: VIEW DETAIL */}
        {viewPet && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-3xl flex flex-col md:flex-row overflow-hidden shadow-2xl relative max-h-[90vh]">
                    <button onClick={() => setViewPet(null)} className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full font-bold shadow">✕</button>
                    <div className="md:w-1/2 bg-black flex flex-col justify-center p-4">
                        <div className="relative h-64 w-full mb-4">
                            <img src={activeImage} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex gap-2 overflow-x-auto justify-center">
                            <button onClick={() => setActiveImage(viewPet.image_url)} className="w-12 h-12 border rounded overflow-hidden"><img src={viewPet.image_url} className="w-full h-full object-cover" /></button>
                            {viewPet.images?.map((img: any) => (
                                <button key={img.id} onClick={() => setActiveImage(img.image_url)} className="w-12 h-12 border rounded overflow-hidden"><img src={img.image_url} className="w-full h-full object-cover" /></button>
                            ))}
                        </div>
                    </div>
                    <div className="md:w-1/2 p-8 overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-2">{viewPet.name}</h2>
                        <div className="space-y-4 text-sm text-gray-600">
                            <p><strong>Status:</strong> {getStatusBadge(viewPet.status)}</p>
                            <p><strong>Ras:</strong> {viewPet.breed}</p>
                            <p><strong>Umur:</strong> {viewPet.age} Bulan</p>
                            <p><strong>Kesehatan:</strong> {viewPet.health_status}</p>
                            <div className="bg-gray-50 p-3 rounded">
                                <p className="italic">"{viewPet.description}"</p>
                            </div>
                            <div className="border-t pt-4">
                                <p><strong>Donatur:</strong> {viewPet.user?.name} ({viewPet.user?.phone_number || '-'})</p>
                                <p><strong>Alamat Hewan:</strong> {viewPet.user?.address || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL 2: EDIT DATA */}
        {editingPet && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                    <h2 className="text-xl font-bold mb-4 text-primary">Edit Hewan</h2>
                    <form onSubmit={saveEdit} className="space-y-3">
                        <input className="w-full border p-2 rounded" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} placeholder="Nama" required />
                        <div className="grid grid-cols-2 gap-3">
                            <input className="w-full border p-2 rounded" value={editForm.breed} onChange={(e) => setEditForm({...editForm, breed: e.target.value})} placeholder="Ras" />
                            <input type="number" className="w-full border p-2 rounded" value={editForm.age} onChange={(e) => setEditForm({...editForm, age: e.target.value})} placeholder="Umur" />
                        </div>
                        <input className="w-full border p-2 rounded" value={editForm.health_status} onChange={(e) => setEditForm({...editForm, health_status: e.target.value})} placeholder="Kesehatan" required />
                        <textarea className="w-full border p-2 rounded" rows={4} value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} placeholder="Deskripsi" required />
                        
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setEditingPet(null)} className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded">Batal</button>
                            <button type="submit" disabled={isSaving} className="flex-1 bg-primary text-white py-2 rounded font-bold hover:bg-[#6b7c40]">Simpan</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* MODAL 3: DELETE CONFIRMATION */}
        {deleteId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-xl font-bold text-dark mb-2">Hapus Permanen?</h3>
                    <p className="text-gray-500 text-sm mb-6">Data hewan akan hilang selamanya dari database.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteId(null)} className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Batal</button>
                        <button onClick={handleDelete} className="flex-1 bg-danger text-white py-2 font-bold rounded-lg hover:bg-red-700">Hapus</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}