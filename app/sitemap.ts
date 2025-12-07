import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // GANTI DENGAN URL VERCEL ASLI KAMU (Tanpa garis miring di akhir)
  const baseUrl = 'https://adoptpet-frontend.vercel.app'; 

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Tambahkan halaman lain jika perlu
  ];
}