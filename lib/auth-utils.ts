export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const token = localStorage.getItem('token');
    const authToken = localStorage.getItem('auth_token');

    if (authToken && authToken.length >= 10) {
      return true;
    }

    if (token && token.length >= 10) {
      return true;
    }

    const cookieToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    const cookieAuthToken = document.cookie.replace(/(?:(?:^|.*;\s*)auth_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");

    if (cookieAuthToken && cookieAuthToken.length >= 10) {
      return true;
    }

    if (cookieToken && cookieToken.length >= 10) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
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

    const cookieOptions = 'path=/;max-age=2592000;SameSite=Lax';
    document.cookie = `token=${token};${cookieOptions}`;
    document.cookie = `auth_token=${token};${cookieOptions}`;
    document.cookie = `is_logged_in=true;${cookieOptions}`;

    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    syncTokenToCookie(formattedToken);

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

  document.cookie = "token=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "auth_token=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "refreshToken=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "is_logged_in=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "auth_token_for_server=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const authToken = localStorage.getItem('auth_token');
  if (authToken) {
    const formattedToken = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
    syncTokenToCookie(formattedToken);
    return formattedToken;
  }

  const token = localStorage.getItem('token');
  if (token) {
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    syncTokenToCookie(formattedToken);
    return formattedToken;
  }

  const cookieAuthToken = document.cookie.replace(/(?:(?:^|.*;\s*)auth_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  if (cookieAuthToken) {
    const formattedToken = cookieAuthToken.startsWith('Bearer ') ? cookieAuthToken : `Bearer ${cookieAuthToken}`;
    syncTokenToCookie(formattedToken);
    return formattedToken;
  }

  const cookieToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  if (cookieToken) {
    const formattedToken = cookieToken.startsWith('Bearer ') ? cookieToken : `Bearer ${cookieToken}`;
    syncTokenToCookie(formattedToken);
    return formattedToken;
  }

  return null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) return refreshToken;

  return document.cookie.replace(/(?:(?:^|.*;\s*)refreshToken\s*\=\s*([^;]*).*$)|^.*$/, "$1") || null;
};

export function syncTokenToCookie(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    document.cookie = `auth_token_for_server=${token}; path=/; max-age=3600; SameSite=Strict`;
  } catch (error) {
    console.error('[Auth Utils] Error syncing token to cookie:', error);
  }
}
