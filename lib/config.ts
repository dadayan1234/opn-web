export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://beopn.pemudanambangan.site/api/v1',
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://beopn.pemudanambangan.site',
  TIMEOUT: {
    DEFAULT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT_DEFAULT || '15000'),
    FINANCE: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT_FINANCE || '30000'),
  },
  RETRY: {
    ATTEMPTS: parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3'),
    DELAY: parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY || '1000'),
    BACKOFF_FACTOR: 2,
  },
  CACHE_DURATION: parseInt(process.env.NEXT_PUBLIC_CACHE_DURATION || '300000'),
  AUTH: {
    TOKEN_KEY: 'token',
    REFRESH_TOKEN_KEY: 'refreshToken',
    REDIRECT_KEY: 'redirectAfterLogin',
  },
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/token',
      REFRESH: '/auth/refresh',
      REGISTER: '/auth/register',
      ME: '/auth/me',
    },
    NEWS: '/news/',
    EVENTS: '/events/',
    MEMBERS: '/members/',
    MEETING_MINUTES: '/meeting-minutes/',
  },
};

export const APP_CONFIG = {
  DEFAULT_LANGUAGE: 'id',
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
  },
};