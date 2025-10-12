// app/api/v1/auth-image/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth-utils'; 
// Asumsikan getAuthToken sekarang menerima request untuk membaca cookie/header
import { API_CONFIG } from '@/lib/config'; 
// Asumsi API_CONFIG ada, atau kita ambil dari process.env

// Function untuk menyusun URL Backend lengkap
function constructFinalBackendUrl(imagePath: string): string {
    // Ambil BASE URL API Anda (misal: 'https://beopn.pemudanambangan.site/api/v1')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''; 

    // Asumsi: Gambar di-serve dari domain yang sama dengan API, 
    // tetapi kita hapus suffix /api/v1 jika ada.
    const baseUrl = apiUrl.replace(/\/api\/v1$/, ''); 

    // Pastikan path dimulai dengan slash
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    // Gabungkan URL backend + path gambar
    return `${baseUrl}${normalizedPath}`;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        // PERBAIKAN 1: Ambil path gambar menggunakan query parameter 'path'
        // (sesuai dengan yang dikirim dari AuthenticatedImage.tsx)
        const imagePath = searchParams.get('path'); 

        // --- VALIDASI AWAL ---
        if (!imagePath) {
            return new NextResponse(JSON.stringify({ error: 'Image path not provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // --- AMBIL TOKEN & OTORISASI ---
        // PERBAIKAN 2: Mengambil token dari request untuk server-side
        const authToken = getAuthToken(request); 
        
        if (!authToken) {
            console.warn('[Auth Image Proxy] No authorization token found');
            return new NextResponse(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // --- SUSUN URL AKHIR ---
        const finalBackendUrl = constructFinalBackendUrl(imagePath);

        // --- FETCH DENGAN TOKEN ---
        const response = await fetch(finalBackendUrl, {
            method: 'GET', 
            headers: {
                // PERBAIKAN 3: Menyertakan token ke header Authorization
                'Authorization': `Bearer ${authToken.replace('Bearer ', '')}`,
                'Accept': 'image/*',
            },
            cache: 'no-store'
        });

        // --- HANDLE RESPONSE ---
        if (!response.ok) {
            console.error(`[Auth Image Proxy] Backend returned error: ${response.status} for ${finalBackendUrl}`);
            return new NextResponse(`Backend error: ${response.status}`, { status: response.status });
        }

        // Mengembalikan gambar
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('[Auth Image Proxy] Internal Error:', error);
        return new NextResponse(JSON.stringify({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}