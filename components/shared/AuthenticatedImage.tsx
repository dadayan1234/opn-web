"use client";

import React, { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
// Tidak perlu import Image dari next/image atau utilities lain yang tidak digunakan

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
}

/**
 * Komponen yang menampilkan gambar yang memerlukan token autentikasi.
 * Menggunakan rute proxy API lokal (/api/v1/auth-image) untuk menyertakan token.
 */
export function AuthenticatedImage({
  src,
  alt,
  width = 300,
  height = 300,
  className = '',
  fallbackSrc = '/placeholder-image.png'
}: AuthenticatedImageProps) {
  const [error, setError] = useState(false);
  const [proxyUrl, setProxyUrl] = useState<string>(''); // Menyimpan URL proxy lokal

  // State untuk mengontrol tampilan Skeleton selama loading awal
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!src) return;
    
    // Reset state saat src berubah
    setError(false);
    setIsLoading(true);

    try {
      // 1. Normalisasi path backend (misal: '/uploads/photos/123.jpg')
      const relativePath = src.startsWith('/') ? src : `${src}`;

      // 2. Buat URL PROXY LOKAL Next.js Anda
      // Rute ini bertanggung jawab menambahkan header Authorization ke request backend.
      const localProxyUrl = `/api/v1/auth-image?path=${encodeURIComponent(relativePath)}`;

      // console.log(`[AuthenticatedImage] Proxy URL: ${localProxyUrl}`);
      setProxyUrl(localProxyUrl);

    } catch (e) {
      console.error(`[AuthenticatedImage] Error processing path: ${src}`, e);
      setError(true);
      setIsLoading(false);
    }
  }, [src]);

  // --- RENDERING DENGAN STATE ---

  // Jika error atau src tidak valid, tampilkan fallback atau placeholder
  if (!src || error) {
    return (
      <img 
        src={fallbackSrc}
        alt={`Placeholder for ${alt}`}
        className={`object-cover ${className}`}
        width={width}
        height={height}
        // Tambahkan styles untuk div wrapper jika diperlukan
      />
    );
  }

  // Tampilkan skeleton saat loading
  if (isLoading || !proxyUrl) {
    return <Skeleton className={`object-cover ${className}`} style={{ width, height }} />;
  }

  // Tampilkan gambar menggunakan tag img standar yang menargetkan proxy lokal
  return (
    <img
      src={proxyUrl} // Menggunakan URL proxy lokal
      alt={alt}
      width={width}
      height={height}
      className={`object-cover ${className}`}
      // Menggunakan onload untuk mematikan loading state
      onLoad={() => setIsLoading(false)} 
      onError={() => {
        console.error(`[AuthenticatedImage] Failed to load image from proxy: ${proxyUrl}`);
        setError(true); // Memicu tampilan fallback
        setIsLoading(false);
      }}
    />
  );
}