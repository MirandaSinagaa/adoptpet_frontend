import type { Metadata } from "next";
import PetDetailClient from "./PetDetailClient";

// Fungsi Fetch Data di Server
async function getPet(id: string) {
  try {
    // PERBAIKAN DI SINI:
    // Gunakan URL dari Environment Variable (Railway), jangan hardcode localhost.
    // Jika env tidak ada (saat dev di laptop), baru pakai localhost.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    
    const res = await fetch(`${apiUrl}/pets/${id}`, {
      cache: "no-store", // Agar data selalu fresh
    });

    if (!res.ok) {
        console.error("Fetch Error:", res.status, res.statusText);
        return null;
    }
    
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Server Error Fetching Pet:", error);
    return null;
  }
}

// 1. GENERATE DYNAMIC METADATA (SEO)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const pet = await getPet(resolvedParams.id);

  if (!pet) {
    return { title: "Hewan Tidak Ditemukan - AdoptPet" };
  }

  return {
    title: `${pet.name} (${pet.breed || 'Campuran'}) - Adopsi di AdoptPet`,
    description: `Adopsi ${pet.name}, seekor ${pet.species} yang lucu. ${pet.description.substring(0, 100)}...`,
    openGraph: {
        images: [pet.image_url || '/logo.png']
    }
  };
}

// 2. SERVER COMPONENT (RENDER HALAMAN)
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const pet = await getPet(resolvedParams.id);

  // Lempar data ke Client Component
  return <PetDetailClient initialData={pet} id={resolvedParams.id} />;
}