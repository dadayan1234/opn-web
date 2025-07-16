# OP## 📚 Dokumentasi

> **📖 [DOCS_INDEX.md](DOCS_INDEX.md) - Panduan Lengkap Semua Dokumentasi**

- **[🎯 Project Handover](HANDOVER.md)** - Executive summary untuk client
- **[🚀 Quick Start Guide](QUICK_START.md)** - Panduan cepat 5 menit
- **[📦 Installation Guide](INSTALLATION.md)** - Panduan instalasi lengkap  
- **[⚙️ Configuration Guide](CONFIGURATION.md)** - Panduan konfigurasi dan backend API
- **[🌐 Deployment Guide](DEPLOYMENT.md)** - Panduan deployment production
- **[📋 Dependencies](DEPENDENCIES.md)** - Analisis dependencies dan bundleProject

Web application untuk OPN (Organisasi Pemuda Nusantara) yang dibangun dengan Next.js dan TypeScript.

## � Dokumentasi

- **[🚀 Quick Start Guide](QUICK_START.md)** - Panduan cepat 5 menit
- **[📦 Installation Guide](INSTALLATION.md)** - Panduan instalasi lengkap  
- **[🌐 Deployment Guide](DEPLOYMENT.md)** - Panduan deployment production
- **[📋 Dependencies](DEPENDENCIES.md)** - Analisis dependencies dan bundle

## �🚀 Quick Start

### Prerequisites

- Node.js 18.x atau lebih baru
- npm atau pnpm

### Installation

1. Extract project files:
   ```bash
   unzip opn-web-main.zip
   cd opn-web-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   Edit file `.env` untuk mengubah backend URL:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://backend-anda.com/api/v1
   NEXT_PUBLIC_BACKEND_URL=https://backend-anda.com
   ```

4. Run development server:
   ```bash
   npm run dev
   # atau
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) di browser.

## 🔧 Environment Configuration (SIMPLE)

**Untuk mengubah backend URL, cukup edit file `.env` dan ubah 2 baris ini:**

```env
NEXT_PUBLIC_API_BASE_URL=https://backend-baru.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://backend-baru.com
```

**Kemudian restart server dengan `npm run dev`. Selesai! ✅**

### File Environment:

- **`.env`** - File utama yang aktif digunakan (EDIT FILE INI untuk ubah backend URL)

**📖 Panduan lengkap ada di [SIMPLE_GUIDE.md](./SIMPLE_GUIDE.md)**

## 🏗️ Project Structure

```
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API routes
│   ├── components/        # Page components
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication pages
│   └── ...
├── components/            # Reusable UI components
│   ├── shared/           # Shared components
│   ├── ui/               # Base UI components
│   └── ...
├── lib/                   # Utility libraries
│   ├── api-client.ts     # API client configuration
│   ├── config.ts         # App configuration
│   └── ...
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

## 🔌 API Integration

Project ini terhubung ke backend API dengan konfigurasi yang fleksibel:

- **API Client**: Menggunakan Axios dengan interceptors untuk auth
- **Error Handling**: Retry logic dan fallback handling
- **Authentication**: Bearer token authentication
- **Image Proxy**: Server-side image proxying untuk authentication

### Backend URL Configuration

Untuk mengubah backend URL:

1. **Development**: Edit `.env.local`
2. **Production**: Set environment variables di platform deployment

Contoh untuk development lokal:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:simple` - Build dengan script cleanup
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Vercel Deployment

1. Connect repository ke Vercel
2. Set environment variables di Vercel dashboard:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_BACKEND_URL`
   - Dan lainnya sesuai kebutuhan

3. Deploy

**Lihat [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) untuk panduan detail.**

### Manual Deployment

1. Build project:
   ```bash
   npm run build
   ```

2. Set environment variables di server

3. Start production server:
   ```bash
   npm start
   ```

## 🔒 Authentication

- Login menggunakan username/password
- Token disimpan di localStorage
- Auto-refresh token mechanism
- Protected routes dengan middleware

## 🎨 UI Components

- **Design System**: Custom components dengan Tailwind CSS
- **Radix UI**: Accessible UI primitives
- **Material-UI**: Additional components
- **Icons**: Tabler Icons

## 📱 Features

- **Dashboard**: Overview dan analytics
- **Events Management**: Kelola event organisasi  
- **Finance Management**: Kelola keuangan
- **Members Management**: Kelola anggota
- **News Management**: Kelola berita dan artikel
- **Authentication**: Login/logout dengan role-based access
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Development

### Code Style

- TypeScript untuk type safety
- ESLint untuk code linting
- Prettier untuk code formatting (optional)

### Adding New Environment Variables

1. Tambahkan ke `.env.example`
2. Update `lib/config.ts` 
3. Update dokumentasi di `ENVIRONMENT_CONFIG.md`

### API Integration

1. Tambahkan endpoint di `lib/config.ts`
2. Buat service function di `lib/api-service.ts`
3. Buat custom hook di `hooks/`
4. Gunakan di components

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Periksa environment variables
   - Pastikan backend server running
   - Check browser console untuk error details

2. **Authentication Issues**  
   - Clear localStorage
   - Check token expiration
   - Verify backend auth endpoint

3. **Build Errors**
   - Clear `.next` folder
   - Reinstall node_modules
   - Check TypeScript errors

### Getting Help

1. Check console untuk error messages
2. Verify environment configuration
3. Check network tab untuk API calls
4. Review [ENVIRONMENT_CONFIG.md](./ENVIRONMENT_CONFIG.md)


