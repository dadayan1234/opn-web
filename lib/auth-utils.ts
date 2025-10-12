import { NextRequest } from 'next/server';
import { useRouter } from 'next/navigation';

// ==========================
// 🔧 TYPE DEFINISI
// ==========================
type ServerRequest = NextRequest | undefined;

// ==========================
// 🎫 GET AUTH TOKEN (Universal)
// ==========================
export const getAuthToken = (req?: ServerRequest): string | null => {
  // --- Server-side Logic ---
  if (req) {
    const token =
      req.cookies.get('auth_token')?.value ||
      req.cookies.get('token')?.value;

    if (token && token.length >= 10) {
      return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    return null;
  }

  // --- Client-side Logic ---
  if (typeof window === 'undefined') return null;

  const checkToken = (token: string | null | undefined): string | null =>
    token && token.length >= 10
      ? token.startsWith('Bearer ') ? token : `Bearer ${token}`
      : null;

  // 1️⃣ Cek LocalStorage
  const authToken = checkToken(localStorage.getItem('auth_token'));
  if (authToken) return authToken;

  const token = checkToken(localStorage.getItem('token'));
  if (token) {
    syncTokenToCookie(token);
    return token;
  }

  // 2️⃣ Cek Cookie
  const cookieAuthToken = getCookie('auth_token');
  const cookieToken = getCookie('token');
  const formattedCookieToken = checkToken(cookieAuthToken || cookieToken);
  if (formattedCookieToken) {
    syncTokenToCookie(formattedCookieToken);
    return formattedCookieToken;
  }

  return null;
};

// ==========================
// 🧩 AUTHENTICATION CHECK
// ==========================
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const token = getAuthToken();
    const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
    return !!(token && token.length >= 10 && isLoggedIn);
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// ==========================
// 💾 SET TOKEN
// ==========================
export const setAuthTokens = (token: string, refreshToken?: string): void => {
  if (typeof window === 'undefined') return;

  try {
    // Simpan di LocalStorage
    localStorage.setItem('token', token);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('is_logged_in', 'true');
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

    // Format token
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const cookieOptions = 'path=/;max-age=2592000;SameSite=Lax;Secure';

    // Simpan di Cookie
    document.cookie = `token=${formattedToken};${cookieOptions}`;
    document.cookie = `auth_token=${formattedToken};${cookieOptions}`;
    document.cookie = `is_logged_in=true;${cookieOptions}`;
    if (refreshToken) {
      document.cookie = `refreshToken=${refreshToken};${cookieOptions}`;
    }

    // Sinkronisasi token ke cookie server
    syncTokenToCookie(formattedToken);

    // 🔁 Redirect otomatis ke dashboard setelah login
    window.location.href = '/dashboard';
  } catch (error) {
    console.error('Error setting auth tokens:', error);
  }
};

// ==========================
// ❌ REMOVE TOKEN
// ==========================
export const removeAuthTokens = (): void => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('token');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('is_logged_in');

  const expired = 'path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  ['token', 'auth_token', 'refreshToken', 'is_logged_in', 'auth_token_for_server']
    .forEach(name => (document.cookie = `${name}=;${expired}`));

  // 🔁 Redirect otomatis ke login setelah logout
  window.location.href = '/login';
};

// ==========================
// 🔁 REFRESH TOKEN
// ==========================
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) return refreshToken;

  return getCookie('refreshToken') || null;
};

// ==========================
// 🔗 SYNC TOKEN KE COOKIE
// ==========================
export function syncTokenToCookie(token: string): void {
  if (typeof window === 'undefined') return;

  try {
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    document.cookie = `auth_token_for_server=${formattedToken}; path=/; max-age=3600; SameSite=Lax; Secure`;
  } catch (error) {
    console.error('[Auth Utils] Error syncing token to cookie:', error);
  }
}

// ==========================
// 🍪 HELPER FUNGSI
// ==========================
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  return (
    document.cookie.replace(
      new RegExp(`(?:(?:^|.*;\\s*)${name}\\s*\\=\\s*([^;]*).*$)|^.*$`),
      '$1'
    ) || null
  );
}

// ==========================
// 🚀 AUTO NAVIGATOR
// ==========================
/**
 * Fungsi ini bisa dipanggil di layout, middleware, atau halaman.
 * Secara otomatis redirect user sesuai status autentikasi:
 * - Jika login → /dashboard
 * - Jika tidak login → /login
 */
export const handleAuthRedirect = (): void => {
  if (typeof window === 'undefined') return;

  const loggedIn = isAuthenticated();
  const currentPath = window.location.pathname;

  if (loggedIn && currentPath !== '/dashboard') {
    window.location.href = '/dashboard';
  } else if (!loggedIn && currentPath !== '/login') {
    window.location.href = '/login';
  }
};
