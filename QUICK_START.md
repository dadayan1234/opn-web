# OPN Web - Quick Start Guide

## 🚀 Panduan Cepat (5 Menit)

### 1. Persyaratan Sistem
- Node.js 18+ ([Download](https://nodejs.org))
- Text editor (VS Code recommended)

### 2. Instalasi Express
```bash
# 1. Extract project
unzip opn-web-main.zip
cd opn-web-main

# 2. Install dependencies
npm install

# 3. Configure backend URL
# Edit file .env - ganti URL backend sesuai server Anda
```

### 3. Konfigurasi Backend
Edit file `.env`:
```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

### 4. Jalankan Aplikasi
```bash
# Development
npm run dev
# Buka: http://localhost:3000

# Production
npm run build
npm start
```

## 📋 Checklist Deployment

### Persiapan
- [ ] Node.js 18+ terinstall
- [ ] Project files sudah di-extract
- [ ] Dependencies sudah di-install (`npm install`)
- [ ] File `.env` sudah dikonfigurasi dengan URL backend yang benar
- [ ] Backend server sudah running dan dapat diakses

### Testing Local
- [ ] `npm run dev` berhasil dijalankan
- [ ] Website dapat diakses di http://localhost:3000
- [ ] Login berhasil terhubung ke backend
- [ ] Data dapat dimuat dari API

### Production Build
- [ ] `npm run build` berhasil tanpa error
- [ ] `npm start` dapat menjalankan production server
- [ ] Environment variables production sudah dikonfigurasi

### Deployment
- [ ] Domain sudah disiapkan
- [ ] SSL certificate sudah aktif
- [ ] Server/hosting sudah dikonfigurasi
- [ ] Website dapat diakses dari internet

## 🔧 Konfigurasi Dasar

### Backend URLs
```env
# Development (Local Backend)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Production
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
```

### Performance Settings
```env
NEXT_PUBLIC_API_TIMEOUT_DEFAULT=15000      # 15 seconds
NEXT_PUBLIC_API_TIMEOUT_FINANCE=30000      # 30 seconds for finance
NEXT_PUBLIC_API_RETRY_ATTEMPTS=3           # Retry 3 times
NEXT_PUBLIC_API_RETRY_DELAY=1000          # Wait 1 second between retries
NEXT_PUBLIC_CACHE_DURATION=300000         # Cache for 5 minutes
```

## 🚨 Troubleshooting Cepat

### Problem: `npm install` gagal
**Solusi:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem: Build error
**Solusi:**
```bash
# Clear cache
rm -rf .next
npm run build
```

### Problem: API connection failed
**Solusi:**
1. Check file `.env` - pastikan URL backend benar
2. Test backend URL di browser: `https://your-backend.com/api/v1/health`
3. Check CORS settings di backend
4. Pastikan backend server running

### Problem: Port 3000 sudah digunakan
**Solusi:**
```bash
npm run dev -- -p 3001
# Atau matikan aplikasi yang menggunakan port 3000
```

## 📞 Support & Contacts

### File Penting
- `README.md` - Dokumentasi lengkap
- `INSTALLATION.md` - Panduan instalasi detail
- `DEPLOYMENT.md` - Panduan deployment production
- `.env` - Konfigurasi environment

### Logs & Debugging
```bash
# Check browser console (F12) untuk error frontend
# Check backend logs untuk error API
# Check network tab untuk failed requests
```

---

**⚡ Tips**: Selalu test di local environment dulu sebelum deploy ke production!
