# OPN Web - Installation Guide

## System Requirements

- **Node.js**: Version 18.0 atau lebih tinggi
- **npm**: Version 8.0 atau lebih tinggi (atau pnpm/yarn)
- **Memory**: Minimum 2GB RAM
- **Storage**: Minimum 1GB free space

## Quick Start

### 1. Download & Extract
```bash
# Extract project files
unzip opn-web-main.zip
cd opn-web-main
```

### 2. Install Dependencies
```bash
# Install all required packages
npm install
```

### 3. Environment Configuration
Copy dan edit file `.env`:
```bash
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com

# Environment
NODE_ENV=production

# Configuration
NEXT_PUBLIC_USE_FALLBACK_DATA=false
NEXT_PUBLIC_API_TIMEOUT_DEFAULT=15000
NEXT_PUBLIC_API_TIMEOUT_FINANCE=30000
NEXT_PUBLIC_API_RETRY_ATTEMPTS=3
NEXT_PUBLIC_API_RETRY_DELAY=1000
NEXT_PUBLIC_CACHE_DURATION=300000
```

**⚠️ Important**: Ubah `NEXT_PUBLIC_API_BASE_URL` dan `NEXT_PUBLIC_BACKEND_URL` sesuai dengan URL backend server Anda.

### 4. Run Application

#### Development Mode
```bash
npm run dev
```
Akses: http://localhost:3000

#### Production Mode
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Detailed Installation

### Dependencies Overview

#### Main Dependencies
- **Next.js 15.2.4** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Query** - Data fetching

#### UI Components
- **Radix UI** - Headless components
- **Lucide React** - Icons
- **React Hook Form** - Form handling
- **Zod** - Schema validation

#### Charts & Visualization
- **Recharts** - Chart library
- **Date-fns** - Date utilities

### Environment Variables Guide

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API endpoint | `https://api.example.com/api/v1` |
| `NEXT_PUBLIC_BACKEND_URL` | Backend base URL | `https://api.example.com` |
| `NODE_ENV` | Environment mode | `production` atau `development` |
| `NEXT_PUBLIC_USE_FALLBACK_DATA` | Use mock data when API fails | `false` |

### Build Configuration

#### For Static Export (Netlify/Vercel)
```bash
# Build static files
npm run build

# Files will be generated in .next/ folder
```

#### For Standalone Server
```bash
# Build standalone
npm run build

# Start server
npm start
```

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Use different port
   npm run dev -- -p 3001
   ```

2. **API connection failed**
   - Check `.env` file configuration
   - Verify backend server is running
   - Check network connectivity

3. **Build fails**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules .next
   npm install
   npm run build
   ```

4. **Dependencies conflict**
   ```bash
   # Force clean install
   npm ci
   ```

### Performance Optimization

1. **Enable caching**: Set `NEXT_PUBLIC_CACHE_DURATION` to higher value
2. **Increase timeouts**: Adjust `NEXT_PUBLIC_API_TIMEOUT_DEFAULT` if needed
3. **Reduce retries**: Lower `NEXT_PUBLIC_API_RETRY_ATTEMPTS` for faster failure handling

## Deployment Options

### 1. Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 2. Netlify
```bash
# Build static files
npm run build

# Upload .next folder to Netlify
```

### 3. Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 4. Traditional Server
```bash
# On server
npm run build
npm start

# Or with PM2
npm install -g pm2
pm2 start npm --name "opn-web" -- start
```

## Development Workflow

### File Structure
```
opn-web-main/
├── app/                 # Next.js app router
├── components/          # React components
├── lib/                # Utilities & API
├── hooks/              # Custom React hooks
├── types/              # TypeScript types
├── public/             # Static assets
├── styles/             # CSS files
└── .env                # Environment config
```

### Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting
npm run type-check   # TypeScript check
```

## Support

- **Documentation**: Check README.md for additional details
- **Configuration**: All settings in `.env` file
- **Logs**: Check browser console for errors
- **Backend**: Ensure backend API is properly configured

---

**Note**: Pastikan backend server sudah running dan dapat diakses dari URL yang dikonfigurasi di `.env` file.
