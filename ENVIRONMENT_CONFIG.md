# Environment Configuration Guide

Proyek ini menggunakan environment variables untuk konfigurasi API backend yang fleksibel. Ini memungkinkan Anda untuk dengan mudah mengubah URL backend dan pengaturan lainnya tanpa mengubah kode.

## File Environment Variables

### 1. `.env` - Production Environment
File ini berisi konfigurasi untuk production. Gunakan ini ketika deploy ke server production.

### 2. `.env.development` - Development Environment  
File ini berisi konfigurasi untuk development lokal.

### 3. `.env.example` - Template
File template yang menunjukkan semua environment variables yang tersedia beserta contoh valuenya.

## Environment Variables yang Tersedia

| Variable Name | Description | Default Value | Required |
|---------------|-------------|---------------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | URL dasar untuk API backend | `https://beopn.penaku.site/api/v1` | Ya |
| `NEXT_PUBLIC_BACKEND_URL` | URL backend server | `https://beopn.penaku.site` | Ya |
| `NEXT_PUBLIC_USE_FALLBACK_DATA` | Gunakan data fallback jika API gagal | `false` | Tidak |
| `NEXT_PUBLIC_API_TIMEOUT_DEFAULT` | Timeout default untuk API calls (ms) | `15000` | Tidak |
| `NEXT_PUBLIC_API_TIMEOUT_FINANCE` | Timeout untuk finance API calls (ms) | `30000` | Tidak |
| `NEXT_PUBLIC_API_RETRY_ATTEMPTS` | Jumlah retry attempts untuk API calls | `3` | Tidak |
| `NEXT_PUBLIC_API_RETRY_DELAY` | Delay antara retry attempts (ms) | `1000` | Tidak |
| `NEXT_PUBLIC_CACHE_DURATION` | Durasi cache untuk API responses (ms) | `300000` | Tidak |

## Setup untuk Development

1. Copy file `.env.example` ke `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` sesuai dengan konfigurasi development Anda:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

## Setup untuk Production

1. Untuk deployment di Vercel, tambahkan environment variables di dashboard Vercel:
   - Go to your project dashboard
   - Click "Settings" > "Environment Variables"
   - Add the required variables

2. Untuk deployment di server lain, pastikan file `.env` ada dan berisi konfigurasi yang benar.

## Mengubah Backend URL

Untuk mengubah backend URL:

1. **Development**: Edit file `.env.local`
2. **Production**: Update environment variables di platform deployment atau edit file `.env`

Contoh untuk menggunakan backend lokal:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Contoh untuk menggunakan backend staging:
```env
NEXT_PUBLIC_API_BASE_URL=https://staging-api.example.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://staging-api.example.com
```

## Notes

- Semua environment variables yang dimulai dengan `NEXT_PUBLIC_` akan tersedia di browser
- Restart development server setelah mengubah environment variables
- Jangan commit file `.env.local` ke git (sudah ada di .gitignore)
- File `.env` dan `.env.development` bisa di-commit sebagai default configuration

## Troubleshooting

Jika aplikasi tidak dapat terhubung ke backend:

1. Periksa apakah environment variables sudah di-set dengan benar
2. Pastikan backend URL bisa diakses
3. Periksa console browser untuk error API
4. Restart development server setelah mengubah environment variables
