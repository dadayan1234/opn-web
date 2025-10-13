"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api-auth"
import { NetworkStatus } from "@/components/ui/network-status"
import Image from "next/image"
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
    // console.log('Login page loaded - checking for logout parameter');

    // Check if this is a logout redirect (has timestamp parameter)
    const params = new URLSearchParams(window.location.search);
    const isLogoutRedirect = params.has('t');

    if (isLogoutRedirect) {
      // console.log('Login page loaded after logout, clearing all tokens');
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
      // console.log('Development mode: Auto-login enabled');

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

      // console.log("Attempting to login with username:", username);

      // Use the auth API service to login
      await authApi.login(username, password);

      // Login successful, tokens are already stored by authApi.login
      // console.log("Login successful, token received")

      // Explicitly set the is_logged_in flag to true
      localStorage.setItem('is_logged_in', 'true');
      // console.log("is_logged_in flag set to true")

      // Get redirect path or default to dashboard
      const redirectPath = localStorage.getItem(API_CONFIG.AUTH.REDIRECT_KEY) || '/dashboard'
      localStorage.removeItem(API_CONFIG.AUTH.REDIRECT_KEY)

      // Small delay to ensure tokens are stored
      await new Promise(resolve => setTimeout(resolve, 500))

      // Verify token is stored before redirecting
      const storedToken = localStorage.getItem('auth_token')
      // console.log('Before redirect - token in localStorage:', storedToken ? 'present' : 'missing')

      if (!storedToken) {
        console.warn('Token not found in localStorage after login')
      }

      // Redirect
      // console.log("Login successful, redirecting to:", redirectPath)

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
    <div className="login-page min-h-screen flex items-center justify-center relative overflow-hidden text-white">
      <NetworkStatus />
      
      {/* Dynamic gradient background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Animated mesh gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Floating geometric shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-indigo-400/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-purple-400/25 rounded-full animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Main login container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Glass morphism card */}
        <div className="backdrop-blur-2xl bg-white/15 border border-white/30 rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
          
          {/* Header section with OPN branding */}
          <div className="relative px-8 pt-12 pb-8 text-center">
            {/* OPN Logo/Icon */}
            <div className="relative inline-flex mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-70 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                <Image
                  src="/images/logo_opn.png" // atau /logo-opn.jpg sesuai nama file di public
                  alt="OPN Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            {/* OPN Branding */}
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  Admin Portal
                </h1>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent drop-shadow-sm">
                    OPN
                  </h2>
                  <p className="text-white/90 text-sm font-medium drop-shadow-sm">
                    Organisasi Pemuda Nambangan
                  </p>
                </div>
              </div>
              
              <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-300 mx-auto rounded-full"></div>
              
              <p className="text-white/85 text-base leading-relaxed font-medium drop-shadow-sm">
                Silakan masuk dengan akun Anda untuk mengakses dashboard
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
            
            {/* Error message */}
            {error && (
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-sm"></div>
                <div className="relative backdrop-blur-sm bg-red-500/15 border border-red-400/40 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-100 text-sm font-semibold drop-shadow-sm">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Username field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-bold text-white drop-shadow-sm">
                Nama Pengguna
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative backdrop-blur-sm bg-white/15 border border-white/30 rounded-2xl focus-within:border-emerald-400/60 transition-all duration-300">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-blue-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full h-14 pl-12 pr-4 bg-transparent text-white font-medium placeholder-white/60 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-400/40 transition-all duration-300"
                    placeholder="Masukkan nama pengguna Anda"
                  />
                </div>
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold text-white drop-shadow-sm">
                Kata Sandi
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative backdrop-blur-sm bg-white/15 border border-white/30 rounded-2xl focus-within:border-emerald-400/60 transition-all duration-300">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-14 pl-12 pr-12 bg-transparent text-white font-medium placeholder-white/60 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-400/40 transition-all duration-300"
                    placeholder="Masukkan kata sandi Anda"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-200 p-1"
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

            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="relative w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl overflow-hidden group transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                
                {/* Button content */}
                <div className="relative flex items-center justify-center h-full">
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="drop-shadow-sm">Memproses Login...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span className="drop-shadow-sm">Masuk ke Dashboard</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Additional info */}
            <div className="text-center pt-4">
              <div className="flex items-center justify-center gap-2 text-white/75 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="drop-shadow-sm">Login aman dengan enkripsi SSL</span>
              </div>
            </div>
          </form>
        </div>

        {/* OPN Footer branding */}
        <div className="flex flex-col items-center mt-6 space-y-3">
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full"></div>
          <div className="text-center space-y-1">
            <p className="text-white/60 text-xs font-medium drop-shadow-sm">
              © 2024 Organisasi Pemuda Nambangan
            </p>
            <p className="text-white/50 text-xs drop-shadow-sm">
              Sistem Manajemen Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}