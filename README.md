# 🏪 BasmiKuman POS - Point of Sale System

![Build APK](https://github.com/BasmiKuman/IBN-Kantiin-POS/workflows/Build%20Android%20APK/badge.svg)
![Production Ready](https://img.shields.io/badge/Production-Ready-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

Sistem Point of Sale (POS) lengkap untuk warung/kantin dengan fitur inventory, customer loyalty, reporting, dan **Mobile APK Support**!

---

## 🎯 Production Ready!

**Status**: ✅ **READY FOR REAL-TIME DEPLOYMENT**  
**Build**: ✅ Tested & Optimized  
**Documentation**: ✅ Complete

### 🚀 Quick Deploy (5 menit)
1. **[Run Database Migration](./CREATE_ADMIN_ACCOUNT.sql)** (2 min)
2. **[Setup Environment](./QUICKSTART_PRODUCTION.md)** (1 min)
3. **Build & Deploy** (2 min)

� **Full Guide:** [PRODUCTION_READY.md](./PRODUCTION_READY.md) (Recommended)

---

## 📚 Documentation

### 🔥 Production Deployment:
- **[PRODUCTION_READY.md](./PRODUCTION_READY.md)** - Complete deployment guide (500+ lines)
- **[QUICKSTART_PRODUCTION.md](./QUICKSTART_PRODUCTION.md)** - 5-minute quick start
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Final checklist

### 📱 Mobile APK:
- **[BUILD_APK_GUIDE.md](./BUILD_APK_GUIDE.md)** - Build Android APK
- **[Download Latest APK](https://github.com/BasmiKuman/IBN-Kantiin-POS/releases/latest)**

### 📊 Features & Setup:
- [Dashboard Charts & Filters](./DASHBOARD_CHARTS_AND_FILTERS.md) - Analytics
- [Employee Photo Feature](./EMPLOYEE_PHOTO_FEATURE.md) - Photo profiles
- [Auto Attendance](./AUTO_ATTENDANCE_COMPLETE.md) - Auto-absensi
- [Role Based Access](./ROLE_BASED_ACCESS.md) - Access control
- [Supabase Setup](./SUPABASE_SETUP.md) - Database config

---

## ✨ Features

### � POS & Sales
- ✅ Point of Sale transactions
- ✅ Multiple payment methods (Cash, QRIS, Transfer)
- ✅ Open bill system (bayar belakangan)
- ✅ Kitchen receipts
- ✅ Tax integration
- ✅ Real-time inventory update

### 📊 Analytics & Reports
- ✅ Dashboard with charts:
  - Sales & profit trends (7 days)
  - Payment method distribution
  - Transaction volume
- ✅ Reports with date filters:
  - All/Today/Yesterday/Week/Month/Custom range
- ✅ Export to PDF & Excel

### 👥 Management
- ✅ Inventory management
- ✅ Customer management
- ✅ Employee management (admin only)
- ✅ Photo profiles for employees
- ✅ Role-based access (admin/manager/kasir)

### 🔐 Authentication
- ✅ Username/password login
- ✅ Auto-attendance on login/logout
- ✅ Session persistence
- ✅ Protected routes

### 📱 Mobile & Web
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Android APK build (via GitHub Actions)
- ✅ PWA support
- ✅ Offline-ready

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Supabase account (sudah terhubung!)

### Installation

```sh
# 1. Clone repository
git clone <YOUR_GIT_URL>
cd IBN-Kantiin-POS

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env dengan Supabase credentials Anda

# 4. Run database migration
# Buka Supabase Dashboard → SQL Editor
# Run: CREATE_ADMIN_ACCOUNT.sql
# 5. Start development server
npm run dev

# 6. Build for production
npm run build:prod
npm run preview
```

**Application:** http://localhost:8080 (dev) or http://localhost:4173 (preview)

**Default Login:**
- Username: `Basmikuman`
- Password: `kadalmesir007`
- Role: `admin`

---

## 🏗️ Build & Deploy

### Web Deployment

```bash
# Build production
npm run build:prod

# Output: dist/ folder
# Deploy to: Vercel, Netlify, Firebase, etc.
```

### Android APK

**Option 1: GitHub Actions (Recommended)**
```bash
# 1. Set GitHub Secrets:
#    - VITE_SUPABASE_URL
#    - VITE_SUPABASE_PUBLISHABLE_KEY

# 2. Push to GitHub
git push origin main

# 3. Download APK from Actions → Artifacts
```

**Option 2: Local Build**
```bash
# Debug APK
npm run build:apk:debug

# Release APK
npm run build:apk

# Output: android/app/build/outputs/apk/
```

**Download:** [Latest APK Release](https://github.com/BasmiKuman/IBN-Kantiin-POS/releases/latest)

---

## 📦 Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **Recharts** - Data visualization
- **React Router** - Navigation
- **TanStack Query** - Data fetching

### Backend
- **Supabase** - Database & Auth
- **PostgreSQL** - Database
- **Supabase Storage** - File storage
- **Row Level Security** - Data protection

### Mobile
- **Capacitor 7.4** - Native wrapper
- **Android SDK** - Android build

### DevOps
- **GitHub Actions** - CI/CD
- **ESLint** - Code quality
- **TypeScript Compiler** - Type checking

---

## 📊 Project Structure

```
IBN-Kantiin-POS/
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── layouts/      # Layout components
│   │   ├── ErrorBoundary.tsx
│   │   └── LoadingSpinner.tsx
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx  # Analytics dashboard
│   │   ├── POS.tsx       # Point of Sale
│   │   ├── Inventory.tsx # Inventory management
│   │   ├── Reports.tsx   # Reports with filters
│   │   ├── Employees.tsx # Employee management
│   │   └── ...
│   ├── hooks/            # Custom hooks
│   │   └── supabase/     # Supabase hooks
│   ├── integrations/     # External integrations
│   │   └── supabase/     # Supabase client
│   ├── lib/              # Utilities
│   └── App.tsx           # Root component
├── public/               # Static assets
├── android/              # Android native project
├── supabase/             # Database migrations
│   └── migrations/
├── .github/
│   └── workflows/        # GitHub Actions
├── docs/                 # Documentation (*.md files)
└── package.json
- Top selling products
- Customer insights
- Profit margins

### 🔐 Security
- Row Level Security (RLS) enabled
- Role-based permissions
- Secure authentication
- API key protection

## 🛠 Technologies

This project is built with:

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn-ui
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
- **Charts**: Recharts

## 📁 Project Structure

```
IBN-Kantiin-POS/
├── src/
│   ├── components/          # UI Components
│   │   ├── ui/             # shadcn-ui components
│   │   ├── layouts/        # Layout components
│   │   └── AppSidebar.tsx  # Main sidebar
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx   # Dashboard/Analytics
│   │   ├── POS.tsx         # Point of Sale
│   │   ├── Inventory.tsx   # Product management
│   │   ├── Customers.tsx   # Customer management
│   │   ├── Employees.tsx   # Employee management
│   │   ├── Reports.tsx     # Reports & analytics
│   │   └── Settings.tsx    # App settings
│   ├── integrations/
│   │   └── supabase/       # Supabase integration
│   │       ├── client.ts   # Supabase client
│   │       └── types.ts    # Database types
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── App.tsx             # Main app component
├── supabase/
│   ├── migrations/         # Database migrations
│   └── config.toml         # Supabase config
├── public/                 # Static assets
└── ...config files
```

## 📊 Database Schema

### Core Tables
- **profiles** - User profiles
- **user_roles** - Role-based access (admin/kasir/manajer)
- **categories** - Product categories
- **products** - Product inventory
- **customers** - Customer data + loyalty tiers
- **employees** - Employee records
- **transactions** - Sales transactions
- **transaction_items** - Transaction line items

See [Database Documentation](./SUPABASE_SETUP.md#database-schema) for detailed schema.

## 🧪 Testing

```bash
# Test Supabase connection
node test-connection.mjs

# Create admin user
node create-admin.mjs
```

## 🚀 Deployment

### Deploy to Vercel/Netlify

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables
Make sure to set these in your deployment platform:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Using Lovable

Simply open [Lovable](https://lovable.dev/projects/c29003f9-0085-46d4-b7e7-613781fd07d8) and click on **Share → Publish**.

## 🌐 Custom Domain

To connect a custom domain:
1. Navigate to Project > Settings > Domains
2. Click Connect Domain
3. Follow the DNS configuration steps

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 📝 Development Workflow

### Using Lovable (Recommended)
Visit the [Lovable Project](https://lovable.dev/projects/c29003f9-0085-46d4-b7e7-613781fd07d8) and start prompting. Changes are automatically committed to this repo.

### Local Development
```bash
git pull origin main      # Get latest changes
npm run dev              # Start dev server
# Make changes...
git add .
git commit -m "Description"
git push origin main     # Push to remote
```

### GitHub Codespaces

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/BasmiKuman/IBN-Kantiin-POS)

1. Click "Code" button → "Codespaces" tab
2. Click "New codespace" atau klik badge di atas
3. Tunggu setup selesai (2-5 menit)
4. Setup `.env` file (copy dari `.env.example`)
5. Run `npm run dev`

**📖 Panduan lengkap:** [CODESPACES_GUIDE.md](./CODESPACES_GUIDE.md)

## 📚 Documentation

- [CODESPACES_GUIDE.md](./CODESPACES_GUIDE.md) - **GitHub Codespaces setup & troubleshooting**
- [CHECKLIST.md](./CHECKLIST.md) - Setup checklist & verification
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Complete Supabase guide
- [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - Setup completion guide
- [supabase-examples.js](./supabase-examples.js) - Code examples

## 🔧 Troubleshooting

### Common Issues

**"Table does not exist"**
- Run the migration SQL in Supabase Dashboard
- See [CHECKLIST.md](./CHECKLIST.md) Phase 2

**"Invalid API key"**
- Check `.env` file exists
- Verify keys are correct

**Build errors**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**Connection failed**
- Check Supabase project status
- Verify API URL is correct

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 📞 Support

For issues or questions:
- Check [Troubleshooting Guide](./SUPABASE_SETUP.md#troubleshooting)
- Review [Code Examples](./supabase-examples.js)
- Contact project maintainer

---

**Made with ❤️ for IBN Kantiin**
