/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // --- BUILD & RUNTIME CONFIGURATION ---

  // Menonaktifkan Strict Mode sementara. Biasanya harus diaktifkan (true) untuk produksi.
  reactStrictMode: false,

  // Mengabaikan error pada build. Ini harusnya hanya sementara; 
  // direkomendasikan untuk menonaktifkan ini setelah semua error fix.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Menggunakan output Standalone untuk performa dan image Docker yang lebih baik.
  output: 'standalone',

  // --- WEBPACK & ALIAS PATH FIX ---
  // Memperbaiki masalah 'Module Not Found' (@/) yang terjadi di Vercel.
  webpack: (config, { isServer }) => {
    // Menetapkan '@/' agar menunjuk ke root direktori proyek.
    config.resolve.alias['@'] = path.join(__dirname);
    return config;
  },

  // --- IMAGE OPTIMIZATION & DOMAINS ---

  images: {
    // unoptimized: true menonaktifkan optimasi image.
    // Direkomendasikan untuk diubah menjadi false untuk produksi jika memungkinkan.
    unoptimized: true, 
    
    // Konfigurasi domains dan remotePatterns yang disatukan
    domains: [
      'beopn.pemudanambangan.site', 
      'ui-avatars.com'
    ],
    remotePatterns: [
      // Domain untuk backend Anda
      {
        protocol: 'https',
        hostname: 'beopn.pemudanambangan.site',
        pathname: '/**',
      },
      // Domain untuk Avatar
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/**',
      },
      // Penghapusan 'port: ""' karena itu redundan untuk HTTPS standar.
    ],
  },
  
  // --- REWRITES & HEADERS ---
  
  // Tidak menggunakan rewrites API (dibiarkan kosong).
  async rewrites() {
    return [];
  },

  // Menambahkan headers kustom, terutama untuk CORS dan Authorization.
  async headers() {
    return [
      // Header CORS Global (/:path*)
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { 
            key: 'Access-Control-Allow-Headers', 
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' 
          },
        ],
      },
      // Header Khusus untuk Path Upload (misalnya untuk mengirim token saat fetch gambar)
      {
        source: '/uploads/:path*',
        headers: [
          // Catatan: Header ini harus diisi di middleware/server; 
          // token di sini hanya sebagai placeholder.
          { key: 'Authorization', value: 'Bearer {{token}}' }, 
        ],
      },
    ];
  },
  
  // --- RUNTIME & PAYLOAD CONFIG ---
  serverRuntimeConfig: {
    // Menetapkan batas ukuran body parser di server (untuk Pages Router legacy)
    bodyLimit: '30mb', 
  },
  // Konfigurasi untuk menaikkan batas ukuran payload di Route Handlers (App Router)
  // Catatan: Ini HANYA efektif jika request Anda diarahkan melalui API Route lokal.
  // Jika upload Anda langsung ke backend eksternal, ini tidak relevan.
  api: {
    bodyParser: false, // Matikan body parser default
    responseLimit: '30mb', // Opsional: Batas ukuran respons
  }
};

module.exports = nextConfig;