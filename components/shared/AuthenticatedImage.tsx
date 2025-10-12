"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthToken } from '@/lib/auth-utils'; 
// Asumsi API_CONFIG diimpor dari tempat lain, 
// pastikan ia memiliki properti BACKEND_URL
// import { API_CONFIG } from '@/lib/config'; 

// Ganti ini dengan cara Anda mengakses BASE URL BACKEND
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://beopn.pemudanambangan.site'; 


interface AuthenticatedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
}

/**
 * Komponen yang menampilkan gambar yang memerlukan token otentikasi.
 * Menggunakan Fetch API langsung dari sisi klien untuk mendapatkan Blob data gambar,
 * yang merupakan cara paling stabil untuk menyertakan Authorization Header di klien.
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
  const [objectUrl, setObjectUrl] = useState<string | null>(null); // Menyimpan Blob URL
  const [isLoading, setIsLoading] = useState(true);

  // Membersihkan Blob URL saat komponen dilepas
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const fetchProtectedImage = useCallback(async (imagePath: string, token: string) => {
    setIsLoading(true);
    setError(false);

    // 1. Susun URL Backend Penuh
    let relativePath = imagePath;
    if (imagePath.startsWith('http')) {
      try {
        const url = new URL(imagePath);
        relativePath = url.pathname;
      } catch (e) {
        console.error('[AuthenticatedImage] Invalid full URL path extraction:', e);
      }
    }
    
    const cleanBaseUrl = BACKEND_BASE_URL.endsWith('/') ? BACKEND_BASE_URL.slice(0, -1) : BACKEND_BASE_URL;
    const finalBackendUrl = `${cleanBaseUrl}${relativePath.startsWith('/') ? relativePath : `/${relativePath}`}`;

    try {
      // Pastikan token berformat 'Bearer <token>'
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await fetch(finalBackendUrl, {
        method: 'GET',
        headers: {
          'Authorization': authHeader, // CRITICAL: Menyertakan token otorisasi
          'Accept': 'image/*',
        },
        cache: 'no-cache', // Tidak perlu cache karena gambar mungkin berubah
      });

      if (!response.ok) {
        // Jika respons 401 atau 404, anggap gagal
        console.error(`[AuthenticatedImage] Fetch failed. Status: ${response.status} for ${finalBackendUrl}`);
        throw new Error(`Failed to load image: ${response.status}`);
      }

      // 2. Ambil data gambar sebagai Blob
      const blob = await response.blob();
      
      // 3. Buat Object URL (Blob URL) untuk src tag <img>
      const url = URL.createObjectURL(blob);
      
      setObjectUrl(url);
      setIsLoading(false);
    } catch (e) {
      console.error('[AuthenticatedImage] Error in fetchProtectedImage:', e);
      setError(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!src || src.includes('/uploads/string') || src === 'string') {
      setError(true);
      setIsLoading(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      console.error('[AuthenticatedImage] No auth token available on client.');
      setError(true);
      setIsLoading(false);
      return;
    }
    
    // Panggil fungsi fetch
    fetchProtectedImage(src, token);

  }, [src, fetchProtectedImage]);

  // --- RENDERING DENGAN STATE ---

  // Tampilkan skeleton saat loading
  if (isLoading || !objectUrl) {
    if (error && !isLoading) {
      // Jika loading selesai dan ada error, langsung tampilkan fallback
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
    // Tampilkan skeleton saat memuat
    return <Skeleton className={`object-cover ${className}`} style={{ width, height }} />;
  }

  // Jika error setelah proses fetch
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

  // Tampilkan gambar menggunakan Blob URL
  return (
    <img
      src={objectUrl} // Menggunakan Blob URL yang valid
      alt={alt}
      width={width}
      height={height}
      className={`object-cover ${className}`}
      style={{ width, height, objectFit: 'cover' }}
      // Handler onError (opsional, karena error sudah ditangani di fetch)
      onError={() => {
        console.error(`[AuthenticatedImage] Error rendering image with Blob URL.`);
        setError(true);
      }}
    />
  );
}