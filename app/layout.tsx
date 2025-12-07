import type { Metadata, Viewport } from "next";
import Script from "next/script"; 
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner"; // Import Komponen Baru
import { Toaster } from "react-hot-toast";

// 1. METADATA (SEO & PWA)
export const metadata: Metadata = {
  title: "AdoptPet - Temukan Sahabat Barumu",
  description: "Platform adopsi hewan terpercaya.",
  manifest: "/manifest.json",
  verification: {
    google: "ySGYDEmUG0jjRglABSdjXE0XDOPDgdPUkiDrZ0VcwmM", 
  },
};

// 2. VIEWPORT
export const viewport: Viewport = {
  themeColor: "#84994F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ID Google Analytics Kamu
  const GA_MEASUREMENT_ID = "G-MC601ZP8KE"; 

  return (
    <html lang="id">
      <head>
        {/* Google Analytics Script */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body className="flex flex-col min-h-screen bg-light text-dark">
        {/* Toast Notification */}
        <Toaster 
          position="top-center" 
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: { background: '#333', color: '#fff' },
            success: { style: { background: '#84994F' } },
            error: { style: { background: '#A72703' } },
          }}
        />

        <Navbar />

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <Footer />

        {/* COOKIE BANNER (Ditaruh paling bawah agar di atas elemen lain secara visual) */}
        <CookieBanner />
        
      </body>
    </html>
  );
}