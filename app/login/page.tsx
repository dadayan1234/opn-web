"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api-auth"
import { NetworkStatus } from "@/components/ui/network-status"
// import { forceSetAuth, clearAllAuth } from "@/lib/force-auth"

import { API_CONFIG } from '@/lib/config'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const redirectingRef = useRef(false)

  // Simple check for existing login - no automatic redirects
  useEffect(() => {
    console.log('Login page loaded - checking for logout parameter');

    // Check if this is a logout redirect (has timestamp parameter)
    const params = new URLSearchParams(window.location.search);
    const isLogoutRedirect = params.has('t');

    if (isLogoutRedirect) {
      console.log('Login page loaded after logout, clearing all tokens');
      // Clear any remaining tokens to be safe
      localStorage.clear();
      sessionStorage.clear();

      // Clear cookies
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }

    // Check for error parameter in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error');
      const redirectParam = params.get('redirect');

      // Store redirect path if provided
      if (redirectParam) {
        localStorage.setItem(API_CONFIG.AUTH.REDIRECT_KEY, redirectParam);
      }

      // Handle error messages
      if (errorParam === 'backend_offline') {
        setError('Server tidak tersedia. Silakan coba lagi nanti.');
      } else if (errorParam === 'unauthorized') {
        setError('Sesi Anda telah berakhir. Silakan masuk kembali.');
      }
    }

    // Only auto-login in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Auto-login enabled');

      // Set default credentials
      setUsername('admin');
      setPassword('admin');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Reset redirecting flag to ensure button can be clicked again if needed
    redirectingRef.current = false;

    try {
      // Clear any existing tokens
      localStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY)
      localStorage.removeItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY)

      console.log("Attempting to login with username:", username);

      // Use the auth API service to login
      await authApi.login(username, password);

      // Login successful, tokens are already stored by authApi.login
      console.log("Login successful, token received")

      // Explicitly set the is_logged_in flag to true
      localStorage.setItem('is_logged_in', 'true');
      console.log("is_logged_in flag set to true")

      // Get redirect path or default to dashboard
      const redirectPath = localStorage.getItem(API_CONFIG.AUTH.REDIRECT_KEY) || '/dashboard'
      localStorage.removeItem(API_CONFIG.AUTH.REDIRECT_KEY)

      // Small delay to ensure tokens are stored
      await new Promise(resolve => setTimeout(resolve, 500))

      // Verify token is stored before redirecting
      const storedToken = localStorage.getItem('auth_token')
      console.log('Before redirect - token in localStorage:', storedToken ? 'present' : 'missing')

      if (!storedToken) {
        console.warn('Token not found in localStorage after login')
      }

      // Redirect
      console.log("Login successful, redirecting to:", redirectPath)

      // Use window.location.href for a full page refresh to ensure tokens are properly loaded
      window.location.href = redirectPath;
      // Don't use router.push here as it might not fully reload the page

    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Terjadi kesalahan saat login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 p-4 relative">
      <NetworkStatus />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-600/20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-indigo-400/20 to-purple-600/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-blue-300/10 to-indigo-400/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl shadow-blue-500/10 dark:shadow-indigo-500/20 rounded-2xl">
        {/* Header */}
        <div className="text-center space-y-6 pt-8 pb-8 px-6">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur opacity-25"></div>
            </div>
          </div>
          
          {/* Title and Description */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              Selamat Datang
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Masuk untuk melanjutkan ke dasbor Anda
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="px-6 pb-6">
              <div className="border border-red-200 bg-red-50 dark:bg-red-950/50 dark:border-red-800 rounded-xl p-4">
                <p className="text-red-700 dark:text-red-300 font-medium text-sm">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Form Content */}
          <div className="space-y-6 px-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                Nama Pengguna
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-slate-900 dark:text-slate-100 outline-none"
                  placeholder="Masukkan nama pengguna"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 pl-12 pr-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-slate-900 dark:text-slate-100 outline-none"
                  placeholder="Masukkan kata sandi"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.76 7.76m0 0L5.64 5.64m0 0L12 12m5.878-9.878L12 12m0 0l6.12-6.12M12 12v.01" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-6 pt-2 pb-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:shadow-lg disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Memproses...</span>
                </div>
              ) : (
                <span>Masuk ke Dasbor</span>
              )}
            </button>
          </div>
        </form>

        {/* Subtle footer decoration */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-30"></div>
      </div>
    </div>
  )
}