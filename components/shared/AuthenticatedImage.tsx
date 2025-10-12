"use client";

import React, { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthToken } from '@/lib/auth-utils'; // Fungsi untuk mendapatkan token otentikasi

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
 * Menggunakan rute proxy API lokal (/api/v1/auth-image) untuk menyertakan token
 * melalui server-side proxy Next.js.
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
  const [proxyUrl, setProxyUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Validasi dan penanganan path yang tidak valid
    if (!src || src.includes('/uploads/string') || src === 'string') {
      console.warn(`[AuthenticatedImage] Invalid src: ${src}`);
      setError(true);
      setIsLoading(false);
      return;
    }

    // Reset state saat src berubah
    setError(false);
    setIsLoading(true);
    setProxyUrl('');
    
    // Ambil token otentikasi dari klien
    const token = getAuthToken();

    if (!token) {
        // Jika tidak ada token, anggap sebagai error/tidak bisa diakses
        console.error('[AuthenticatedImage] No authentication token available');
        setError(true);
        setIsLoading(false);
        return;
    }

    try {
      // 2. Normalisasi path gambar
      let relativePath = src;
      
      // Jika src adalah URL lengkap, ekstrak hanya path-nya
      if (src.startsWith('http')) {
        const url = new URL(src);
        // Path yang dibutuhkan backend dimulai dari '/uploads...'
        // Jika URL lengkap adalah https://beopn.pemudanambangan.site/uploads/..., 
        // maka pathname-nya adalah /uploads/...
        relativePath = url.pathname; 
      }
      
      // Pastikan path dimulai dengan slash '/'
      if (!relativePath.startsWith('/')) {
        relativePath = `/${relativePath}`;
      }

      // 3. Buat URL PROXY LOKAL Next.js
      // Path lokal kita: /api/v1/auth-image
      // Query parameter: path (isi dengan path gambar yang sudah di-encode)
      const cacheBuster = Date.now();
      const localProxyUrl = `/api/v1/auth-image?path=${encodeURIComponent(relativePath)}&_=${cacheBuster}`;

      setProxyUrl(localProxyUrl);
      // setIsLoading(true) akan tetap true sampai onload dipanggil

    } catch (e) {
      console.error(`[AuthenticatedImage] Error processing path: ${src}`, e);
      setError(true);
      setIsLoading(false);
    }
  }, [src]);

  // --- RENDERING DENGAN STATE ---

  // Tampilkan skeleton saat loading atau proxyUrl belum siap
  if (isLoading || !proxyUrl) {
    // Jika src invalid atau error awal, langsung tampilkan fallback
    if (error && !proxyUrl) {
        return (
            <img 
              src={fallbackSrc}
              alt={`Placeholder for ${alt}`}
              className={`object-cover ${className}`}
              width={width}
              height={height}
              style={{ width, height, objectFit: 'cover' }}
            />
          );
    }

    // Tampilkan skeleton saat memuat
    return <Skeleton className={`object-cover ${className}`} style={{ width, height }} />;
  }

  // Jika error setelah proses pembuatan URL (termasuk error load dari onError)
  if (error) {
    return (
      <img 
        src={fallbackSrc}
        alt={`Fallback for ${alt}`}
        className={`object-cover ${className}`}
        width={width}
        height={height}
        style={{ width, height, objectFit: 'cover' }}
      />
    );
  }

  // Tampilkan gambar menggunakan tag img standar yang menargetkan proxy lokal
  return (
    <img
      src={proxyUrl} // Menggunakan URL proxy lokal
      alt={alt}
      width={width}
      height={height}
      className={`object-cover ${className}`}
      // Atur dimensi dan objectFit melalui style agar konsisten
      style={{ width, height, objectFit: 'cover' }}
      // Menggunakan onload untuk mematikan loading state
      onLoad={() => setIsLoading(false)} 
      onError={(e) => {
        // Jika request ke proxy gagal (misalnya 401 Unauthorized), ini akan terpanggil
        console.error(`[AuthenticatedImage] Failed to load image from proxy: ${proxyUrl}`, e);
        setError(true); // Memicu tampilan fallback
        setIsLoading(false);
      }}
    />
  );
}