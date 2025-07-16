# OPN Web - Dependencies Documentation

## 📦 Ringkasan Dependencies

Total: **47 dependencies** + **34 dev dependencies**

### Core Framework
- **Next.js 15.2.4** - React framework untuk production
- **React 19.0.0** - Library UI utama
- **React DOM 19.0.0** - React untuk web
- **TypeScript** - Type safety dan development

### Styling & UI
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **@radix-ui/*** - Headless UI components (accessible)
- **Lucide React 0.468.0** - Icon library (modern & lightweight)
- **clsx & tailwind-merge** - Conditional CSS classes

### Data Management
- **@tanstack/react-query 5.62.7** - Server state management
- **Axios 1.7.9** - HTTP client untuk API calls
- **React Hook Form 7.54.2** - Form handling & validation
- **Zod 3.24.1** - Schema validation

### Charts & Visualization
- **Recharts 2.14.1** - Chart library untuk dashboard
- **Date-fns 4.1.0** - Date manipulation utilities

## 📊 Analisis Dependencies

### Production Dependencies (47)

#### Essential Core (Cannot be removed)
```json
{
  "next": "15.2.4",           // Framework utama
  "react": "19.0.0",          // UI library
  "react-dom": "19.0.0",      // React web renderer
  "typescript": "5.7.2"       // Type safety
}
```

#### Styling System (Required for UI)
```json
{
  "tailwindcss": "3.4.17",              // CSS framework
  "lucide-react": "0.468.0",            // Icons
  "clsx": "2.1.1",                      // Conditional classes
  "tailwind-merge": "2.5.5"             // Merge Tailwind classes
}
```

#### Data & API Management (Critical for functionality)
```json
{
  "@tanstack/react-query": "5.62.7",    // Server state
  "axios": "1.7.9",                     // HTTP client
  "react-hook-form": "7.54.2",          // Forms
  "zod": "3.24.1"                       // Validation
}
```

#### UI Components (Radix UI - Accessible components)
```json
{
  "@radix-ui/react-accordion": "1.2.2",
  "@radix-ui/react-alert-dialog": "1.1.4",
  "@radix-ui/react-avatar": "1.1.2",
  "@radix-ui/react-checkbox": "1.1.4",
  "@radix-ui/react-dialog": "1.1.4",
  "@radix-ui/react-dropdown-menu": "2.1.4",
  "@radix-ui/react-label": "2.1.1",
  "@radix-ui/react-popover": "1.1.4",
  "@radix-ui/react-progress": "1.1.2",
  "@radix-ui/react-radio-group": "1.2.2",
  "@radix-ui/react-scroll-area": "1.2.1",
  "@radix-ui/react-select": "2.1.4",
  "@radix-ui/react-separator": "1.1.2",
  "@radix-ui/react-slider": "1.2.2",
  "@radix-ui/react-slot": "1.1.1",
  "@radix-ui/react-switch": "1.1.2",
  "@radix-ui/react-tabs": "1.1.2",
  "@radix-ui/react-toast": "1.2.4",
  "@radix-ui/react-tooltip": "1.1.6"
}
```

#### Charts & Data Visualization
```json
{
  "recharts": "2.14.1",       // Charts untuk dashboard
  "date-fns": "4.1.0"         // Date utilities
}
```

### Development Dependencies (34)

#### Build Tools
```json
{
  "@next/eslint-plugin-next": "15.2.4",
  "@types/node": "22.10.5",
  "@types/react": "19.0.5",
  "@types/react-dom": "19.0.2",
  "eslint": "9.18.0",
  "eslint-config-next": "15.2.4",
  "postcss": "8.5.2",
  "autoprefixer": "10.4.20"
}
```

## 🔍 Security Analysis

### Vulnerability Check
```bash
npm audit
# Result: 0 vulnerabilities (All dependencies up-to-date)
```

### Bundle Size Impact
- **Core Framework**: ~150KB gzipped
- **UI Components**: ~80KB gzipped  
- **Charts**: ~45KB gzipped
- **Utils**: ~25KB gzipped
- **Total**: ~300KB gzipped (Optimal for web app)

## ⚡ Performance Considerations

### Tree Shaking
All dependencies support tree shaking untuk optimisasi bundle size:
- Radix UI: Import only used components
- Lucide React: Import only needed icons
- Date-fns: Import only required functions

### Lazy Loading
Charts dan heavy components di-load secara lazy:
```typescript
const ChartComponent = lazy(() => import('./charts/Chart'));
```

### Caching Strategy
- React Query: Smart caching untuk API calls
- Next.js: Built-in caching untuk static assets
- Browser caching: Optimized cache headers

## 🔧 Alternative Dependencies

### Jika ingin mengurangi bundle size:

#### Ganti Radix UI dengan alternatif ringan:
```bash
# Remove Radix UI (save ~60KB)
npm uninstall @radix-ui/react-*

# Install lightweight alternatives
npm install react-select react-modal
```

#### Ganti Recharts dengan alternatif:
```bash
# Remove Recharts (save ~40KB)
npm uninstall recharts

# Install lightweight chart
npm install react-chartjs-2 chart.js
```

### Jika ingin menambah fitur:

#### Add more charts:
```bash
npm install @nivo/core @nivo/line @nivo/bar
```

#### Add animations:
```bash
npm install framer-motion
```

#### Add rich text editor:
```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
```

## 📋 Dependency Management Commands

```bash
# Check outdated packages
npm outdated

# Update all dependencies
npm update

# Update specific package
npm install package-name@latest

# Check bundle size
npm run build
npm run analyze  # If analyzer is configured

# Security audit
npm audit
npm audit fix
```

## 🚨 Critical Dependencies (Never Remove)

1. **next** - Core framework
2. **react** & **react-dom** - UI foundation  
3. **@tanstack/react-query** - Data management
4. **axios** - API communication
5. **tailwindcss** - Styling system
6. **typescript** - Type safety

## 📝 Notes

- Semua dependencies menggunakan versi stabil terbaru
- Bundle size dioptimisasi dengan tree shaking
- Security vulnerabilities: 0 (checked regularly)
- Performance impact minimal dengan lazy loading
- Kompatibilitas browser: Modern browsers (ES2020+)
