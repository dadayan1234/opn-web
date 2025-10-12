import { NextRequest } from 'next/server';

// Mendefinisikan tipe Request yang bisa diterima (NextRequest atau undefined)
type ServerRequest = NextRequest | undefined;

/**
 * Mendapatkan token otentikasi dari berbagai sumber (LocalStorage atau Cookie).
 * Di sisi server (Route Handler), ia akan membaca dari cookie yang dikirim dalam NextRequest.
 * * @param req Objek NextRequest (hanya digunakan di sisi server/Route Handler).
 * @returns Token yang diformat ('Bearer <token>') atau null.
 */
export const getAuthToken = (req?: ServerRequest): string | null => {
  // --- Server-side Logic (NextRequest) ---
  if (req) {
    // Di sisi server, kita harus membaca token dari cookies yang dikirim oleh klien
    const token = req.cookies.get('auth_token')?.value || req.cookies.get('token')?.value;

    if (token && token.length >= 10) {
      // Pastikan formatnya 'Bearer <token>'
      return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    return null;
  }

  // --- Client-side Logic (Browser/window) ---
  if (typeof window === 'undefined') {
    return null;
  }

  const checkToken = (token: string | null | undefined): string | null => {
    if (token && token.length >= 10) {
      return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    return null;
  }

  // Cek dari LocalStorage
  const authToken = checkToken(localStorage.getItem('auth_token'));
  if (authToken) return authToken;

  const token = checkToken(localStorage.getItem('token'));
  if (token) {
      // Sync token to cookie if found in localStorage
      syncTokenToCookie(token);
      return token;
  }

  // Cek dari Cookie (fallback jika localStorage gagal atau belum sync)
  const cookieAuthToken = document.cookie.replace(/(?:(?:^|.*;\s*)auth_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  if (cookieAuthToken) {
    const formattedToken = checkToken(cookieAuthToken);
    if (formattedToken) {
        syncTokenToCookie(formattedToken);
        return formattedToken;
    }
  }

  return null;
};

// Fungsi lain (dibuat ringkas untuk fokus pada getAuthToken)
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!getAuthToken();
};

export const setAuthTokens = (token: string, refreshToken?: string): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('token', token);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('is_logged_in', 'true');

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    const cookieOptions = 'path=/;max-age=2592000;SameSite=Lax;Secure';
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    // Simpan token yang sudah diformat ke cookie agar bisa diakses server (Route Handler)
    document.cookie = `token=${formattedToken};${cookieOptions}`; 
    document.cookie = `auth_token=${formattedToken};${cookieOptions}`; 

    if (refreshToken) {
      document.cookie = `refreshToken=${refreshToken};${cookieOptions}`;
    }
  } catch (error) {
    console.error('Error setting auth tokens:', error);
  }
};

export const removeAuthTokens = (): void => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('token');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('is_logged_in');

  const expiredOptions = "path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `token=;${expiredOptions}`;
  document.cookie = `auth_token=;${expiredOptions}`;
  document.cookie = `refreshToken=;${expiredOptions}`;
  document.cookie = `is_logged_in=;${expiredOptions}`;
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) return refreshToken;

  return document.cookie.replace(/(?:(?:^|.*;\s*)refreshToken\s*\=\s*([^;]*).*$)|^.*$/, "$1") || null;
};

// Di-sync ke cookie secara otomatis di getAuthToken, tidak perlu diekspor lagi.
export function syncTokenToCookie(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    // Pastikan token yang dikirim ke cookie sudah Bearer format
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    document.cookie = `auth_token=${formattedToken}; path=/; max-age=3600; SameSite=Lax; Secure`;
  } catch (error) {
    console.error('[Auth Utils] Error syncing token to cookie:', error);
  }
}