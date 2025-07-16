# 🎯 Panduan Sederhana - Mengubah Backend URL

## Hanya Ada 1 File yang Perlu Anda Ketahui:

### **`.env`** - FILE UTAMA ⭐
- **File ini yang AKTIF digunakan project**
- **Untuk mengubah backend URL, edit file ini**
- Berisi konfigurasi yang sudah jalan

## 🚀 Cara Mengubah Backend URL (SIMPLE):

### Option 1: Edit Langsung (PALING MUDAH)
1. Buka file `.env`
2. Ubah baris ini:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://backend-baru.com/api/v1
   NEXT_PUBLIC_BACKEND_URL=https://backend-baru.com
   ```
3. Save
4. Restart server (`npm run dev`)
5. Selesai! ✅

### Option 2: Untuk Development (OPTIONAL)
1. Copy `.env` ke `.env.local`
2. Edit `.env.local` (file ini tidak akan di-commit ke git)
3. File `.env.local` akan override `.env`

## 📝 Contoh Penggunaan:

### Untuk Backend Lokal:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Untuk Backend Production:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.production.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://api.production.com
```

### Untuk Backend Staging:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.staging.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://api.staging.com
```

## ⚠️ Yang Perlu Diingat:

1. **Yang penting cuma 2 baris:**
   - `NEXT_PUBLIC_API_BASE_URL` - URL untuk API calls
   - `NEXT_PUBLIC_BACKEND_URL` - URL untuk file/image

2. **Restart server setelah mengubah .env**

3. **Untuk deployment di server, set environment variables di platform deployment**

## 🎯 KESIMPULAN:

**CARA PALING MUDAH:** Edit file `.env` langsung, ubah 2 baris URL, restart server. Selesai! 

Tidak perlu bingung dengan file lain. File `.env` adalah yang utama dan aktif digunakan.
