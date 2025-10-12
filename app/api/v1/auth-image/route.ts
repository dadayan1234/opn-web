import { NextRequest, NextResponse } from 'next/server';
// Pastikan API_CONFIG terdefinisi dan memiliki BACKEND_URL
// Pastikan getAuthToken sudah diperbaiki agar menerima NextRequest
import { getAuthToken } from '@/lib/auth-utils'; 
import { API_CONFIG } from '@/lib/config'; 

// Menonaktifkan caching statis pada Route Handler ini (penting untuk API proxy)
export const dynamic = 'force-dynamic'; 

/**
 * Menyusun URL Backend lengkap dari path gambar.
 * * @param imagePath Path gambar relatif dari root backend (e.g., /uploads/users/...)
 * @returns URL lengkap backend (e.g., https://backend.com/uploads/users/...)
 */
function constructFinalBackendUrl(imagePath: string): string {
    const backendBaseUrl = API_CONFIG.BACKEND_URL;
    
    // Menghilangkan trailing slash dari base URL jika ada
    const cleanBaseUrl = backendBaseUrl.endsWith('/') ? backendBaseUrl.slice(0, -1) : backendBaseUrl;
    
    // Memastikan path dimulai dengan slash '/'
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    return `${cleanBaseUrl}${normalizedPath}`;
}


/**
 * Route Handler GET yang berfungsi sebagai proxy untuk gambar yang memerlukan otentikasi.
 * Ini mengambil Bearer Token dari request dan meneruskannya ke backend gambar.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const imagePath = searchParams.get('path'); 

        // --- VALIDASI & AMBIL TOKEN ---
        if (!imagePath) {
            return NextResponse.json({ error: 'Image path not provided' }, { status: 400 });
        }
        
        // Ambil token dari request (akan membaca dari cookie)
        const authToken = getAuthToken(request); 
        
        if (!authToken) {
            // Jika token tidak ditemukan, server merespons 401 Unauthorized
            console.error('[Auth Image Proxy] Authentication token is missing');
            return NextResponse.json({ error: 'Authentication token is missing' }, { status: 401 });
        }

        // --- SUSUN URL AKHIR ---
        const finalBackendUrl = constructFinalBackendUrl(imagePath);

        // --- FETCH DENGAN TOKEN ---
        const response = await fetch(finalBackendUrl, {
            method: 'GET', 
            headers: {
                'Authorization': authToken, // 'Bearer <token>'
                // Minta format gambar yang kompatibel
                'Accept': 'image/jpeg, image/png, image/webp, image/gif', 
            },
            // Gunakan 'no-store' untuk mencegah Next.js menyimpan cache server-side
            cache: 'no-store' 
        });

        // --- HANDLE RESPONSE ---
        if (!response.ok) {
            // Jika backend mengembalikan error, teruskan statusnya
            console.error(`[Auth Image Proxy] Backend returned error: ${response.status} for ${finalBackendUrl}`);
            // Mengembalikan status dan pesan error dari backend
            return new NextResponse(`Backend error: ${response.status}`, { status: response.status });
        }

        // Dapatkan header Content-Type dari backend untuk merender gambar dengan benar
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        
        // Kembalikan gambar dalam response baru
        return new NextResponse(response.body, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                // Mengatur Cache-Control untuk caching browser yang wajar (1 jam)
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('[Auth Image Proxy] Internal Server Error:', error);
        
        return NextResponse.json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}