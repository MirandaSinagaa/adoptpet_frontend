"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function UserArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/articles")
       .then(res => setArticles(res.data.data))
       .catch(err => console.error(err))
       .finally(() => setIsLoading(false));
  }, []);

  if(isLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <h1 className="text-3xl font-bold text-primary">Tips & Edukasi 📚</h1>
            <p className="text-gray-500 mt-2">Informasi terpercaya untuk merawat hewan kesayangan.</p>
        </div>

        {articles.length === 0 ? (
            <div className="text-center py-10 text-gray-400">Belum ada artikel.</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {articles.map((item) => (
                    <a key={item.id} href={item.original_url} target="_blank" rel="noreferrer" className="group">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition h-full flex flex-col">
                            <div className="h-48 overflow-hidden bg-gray-100">
                                <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded w-fit mb-2">
                                    {item.source_host}
                                </span>
                                <h3 className="font-bold text-dark text-lg mb-2 line-clamp-2 group-hover:text-primary transition">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-grow">
                                    {item.description}
                                </p>
                                <div className="text-sm font-bold text-dark">Baca Selengkapnya &rarr;</div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        )}
    </div>
  );
}