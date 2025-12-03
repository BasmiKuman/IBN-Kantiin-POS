# 🚀 PRODUCTION DEPLOYMENT GUIDE
## BasmiKuman POS - Ready for Production

---

## 📋 Table of Contents
1. [Pre-Production Checklist](#pre-production-checklist)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Build & Deploy](#build--deploy)
5. [APK Build via GitHub Actions](#apk-build-via-github-actions)
6. [Testing Production](#testing-production)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Production Checklist

### 1. **Database Ready**
- [ ] Supabase project created
- [ ] All migrations executed
- [ ] Admin account created
- [ ] Storage bucket configured
- [ ] RLS policies setup (disabled for demo)

### 2. **Environment Variables**
- [ ] `.env` file created locally
- [ ] GitHub Secrets configured
- [ ] Supabase URL correct
- [ ] Supabase Anon Key correct

### 3. **Code Quality**
- [ ] No TypeScript errors
- [ ] Production build successful
- [ ] Error boundaries implemented
- [ ] Loading states added

### 4. **Features Tested**
- [ ] Login system (admin + employee)
- [ ] POS transactions
- [ ] Inventory management
- [ ] Reports with filters
- [ ] Dashboard charts
- [ ] Photo upload
- [ ] Auto-attendance
- [ ] Open bills

---

## 🗄️ Database Setup

### Step 1: Execute Migration SQL

**Lokasi File:** `/CREATE_ADMIN_ACCOUNT.sql`

**Cara Execute:**
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik **"SQL Editor"** di sidebar kiri
4. Klik **"New Query"**
5. Copy-paste seluruh isi file `CREATE_ADMIN_ACCOUNT.sql`
6. Klik **"Run"** atau tekan `Ctrl + Enter`

**Apa yang Dilakukan:**
```sql
-- Tambah kolom username, password, photo_url
ALTER TABLE employees ADD COLUMN username TEXT UNIQUE;
ALTER TABLE employees ADD COLUMN password TEXT;
ALTER TABLE employees ADD COLUMN photo_url TEXT;

-- Buat Storage bucket untuk foto
INSERT INTO storage.buckets (id, name, public) 
VALUES ('employees', 'employees', true);

-- Buat admin account
INSERT INTO employees (name, username, password, email, position)
VALUES ('Admin - Fadlan Nafian', 'Basmikuman', 'kadalmesir007', 
        'fadlannafian@gmail.com', 'admin');
```

### Step 2: Verify Database

**Check Table:**
```sql
SELECT * FROM employees WHERE username = 'Basmikuman';
```

**Expected Result:**
```
id  | name                  | username    | password      | position | is_active
----|-----------------------|-------------|---------------|----------|----------
1   | Admin - Fadlan Nafian | Basmikuman  | kadalmesir007 | admin    | true
```

**Check Storage:**
```sql
SELECT * FROM storage.buckets WHERE id = 'employees';
```

---

## 🔑 Environment Configuration

### Step 1: Get Supabase Credentials

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik **Settings** → **API**
4. Copy:
   - **Project URL** (contoh: `https://xxxxx.supabase.co`)
   - **Project API keys** → **anon public** key

### Step 2: Create Local `.env` File

**Lokasi:** `/workspaces/IBN-Kantiin-POS/.env`

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANT:**
- Ganti `your-project-id` dengan ID project Supabase Anda
- Ganti key dengan anon key dari dashboard
- File `.env` sudah di-gitignore (tidak akan ter-commit)

### Step 3: Configure GitHub Secrets

**Untuk Auto-Build APK via GitHub Actions:**

1. Buka repository di GitHub
2. Klik **Settings** → **Secrets and variables** → **Actions**
3. Klik **"New repository secret"**
4. Tambahkan 2 secrets:

**Secret 1:**
- Name: `VITE_SUPABASE_URL`
- Value: `https://your-project-id.supabase.co`

**Secret 2:**
- Name: `VITE_SUPABASE_PUBLISHABLE_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 🏗️ Build & Deploy

### Option 1: Build Web Version (PWA)

**Development Build:**
```bash
npm run build:dev
```

**Production Build:**
```bash
npm run build:prod
```

**Preview Build:**
```bash
npm run preview
```

**Output:**
- Folder: `/dist`
- Files: HTML, CSS, JS (minified & optimized)
- Size: ~2-3 MB (compressed)

**Deploy to Hosting:**
- **Vercel**: Drag & drop `dist` folder
- **Netlify**: Drag & drop `dist` folder
- **Firebase Hosting**: `firebase deploy`
- **GitHub Pages**: Push `dist` to `gh-pages` branch

---

### Option 2: Build Android APK

#### Local Build (Manual)

**Debug APK:**
```bash
npm run build:apk:debug
```

**Release APK:**
```bash
npm run build:apk
```

**Output Location:**
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

**Install ke Android:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🤖 APK Build via GitHub Actions

### Setup (One-Time)

1. **Configure GitHub Secrets** (lihat [Environment Configuration](#environment-configuration))
2. **Verify Workflow File** sudah ada: `.github/workflows/build-apk.yml`
3. **Enable GitHub Actions** di repository settings

### Trigger Auto-Build

**Method 1: Push to Main Branch**
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

**Method 2: Manual Trigger**
1. Buka repository di GitHub
2. Klik tab **"Actions"**
3. Pilih workflow **"Build Android APK"**
4. Klik **"Run workflow"** → **"Run workflow"**

### Monitor Build Progress

1. Klik tab **"Actions"** di GitHub
2. Klik workflow run yang sedang berjalan
3. Lihat progress setiap step:
   - ✅ Checkout code
   - ✅ Install dependencies
   - ✅ Build web app
   - ✅ Setup Android SDK
   - ✅ Build APK
   - ✅ Upload artifact

**Build Time:** ~5-8 minutes

### Download APK

**Option 1: From Artifacts**
1. Scroll ke bawah pada workflow run page
2. Section **"Artifacts"**
3. Download:
   - `basmikuman-pos-release` (Production APK)
   - `basmikuman-pos-debug` (Debug APK)

**Option 2: From Releases**
1. Klik tab **"Releases"** di repository
2. Klik latest release (contoh: `v1`, `v2`, dll)
3. Download APK dari **Assets**:
   - `app-release-unsigned.apk` (Production)
   - `app-debug.apk` (Debug)

---

## 🧪 Testing Production

### 1. Test Web Version

**Run Production Build Locally:**
```bash
npm run build:prod
npm run preview
```

**Open Browser:**
```
http://localhost:4173
```

**Test Checklist:**
- [ ] Login dengan `Basmikuman` / `kadalmesir007`
- [ ] Dashboard charts muncul
- [ ] POS berfungsi normal
- [ ] Create transaction
- [ ] Open bill feature
- [ ] Reports filter tanggal
- [ ] Export PDF/Excel
- [ ] Photo upload
- [ ] Auto-attendance
- [ ] Logout

---

### 2. Test Android APK

**Install APK:**
```bash
# Via ADB
adb install app-debug.apk

# Or: Transfer APK ke phone → Install manual
```

**Test Checklist:**
- [ ] App launch tanpa crash
- [ ] Login screen muncul
- [ ] Login berhasil
- [ ] All features work (sama seperti web)
- [ ] Offline mode (if implemented)
- [ ] Camera for photo upload
- [ ] Printing (if supported)

---

### 3. Performance Testing

**Web Vitals:**
```bash
npm install -g lighthouse
lighthouse http://localhost:4173 --view
```

**Target Metrics:**
- Performance: >85
- Accessibility: >90
- Best Practices: >90
- SEO: >80

**Mobile Performance:**
- First Contentful Paint: <2s
- Time to Interactive: <3s
- Total Bundle Size: <500KB (gzipped)

---

## 🔧 Production Optimizations Implemented

### 1. **Error Boundaries**
- File: `src/components/ErrorBoundary.tsx`
- Catches React errors
- Shows user-friendly error message
- Reload button untuk recovery

### 2. **Loading States**
- File: `src/components/LoadingSpinner.tsx`
- Loading spinners untuk async operations
- Full-page loader untuk route changes
- Skeleton loaders (optional)

### 3. **Build Optimizations**
- Code splitting by vendor/UI/charts
- Minification dengan esbuild
- Tree shaking unused code
- Sourcemaps disabled in production
- Chunk size optimization

### 4. **Supabase Optimizations**
- Auto-refresh token enabled
- Session persistence
- Detect session in URL
- Custom headers for tracking
- Better error messages

### 5. **Query Client Config**
- Stale time: 5 minutes
- Retry: 1 attempt
- No refetch on window focus
- Optimized for production

---

## 🐛 Troubleshooting

### Issue 1: Build Fails - "Missing Supabase variables"

**Cause:** `.env` file tidak ada atau kosong

**Solution:**
```bash
# Create .env file
cp .env.example .env

# Edit dan isi dengan credentials Supabase Anda
nano .env
```

---

### Issue 2: GitHub Actions Build Fails

**Cause:** GitHub Secrets belum di-set

**Solution:**
1. Go to **Settings → Secrets → Actions**
2. Add `VITE_SUPABASE_URL`
3. Add `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Re-run workflow

---

### Issue 3: APK Crashes on Launch

**Cause:** Environment variables tidak ter-embed dalam APK

**Solution:**
```bash
# Check .env file exists before build
cat .env

# Rebuild dengan production mode
npm run build:prod
npx cap sync android
cd android && ./gradlew clean assembleRelease
```

---

### Issue 4: Login Fails - "Admin not found"

**Cause:** Database migration belum dijalankan

**Solution:**
1. Run `CREATE_ADMIN_ACCOUNT.sql` di Supabase SQL Editor
2. Verify:
```sql
SELECT * FROM employees WHERE username = 'Basmikuman';
```

---

### Issue 5: Photo Upload Fails

**Cause:** Storage bucket belum ada atau policies salah

**Solution:**
1. Check bucket exists:
```sql
SELECT * FROM storage.buckets WHERE id = 'employees';
```

2. Re-run storage setup dari `CREATE_ADMIN_ACCOUNT.sql` (STEP 1.5)

---

### Issue 6: Charts Not Showing Data

**Cause:** No transactions in database

**Solution:**
1. Create dummy transactions via POS
2. Or insert via SQL:
```sql
INSERT INTO transactions (total, payment_method, created_at)
VALUES (50000, 'cash', NOW());
```

---

## 📊 Production Monitoring

### Recommended Tools:

1. **Sentry** - Error tracking
   - Catch production errors
   - User feedback
   - Performance monitoring

2. **Google Analytics** - User analytics
   - Page views
   - User flow
   - Conversion tracking

3. **LogRocket** - Session replay
   - See what users do
   - Debug production issues
   - Performance insights

4. **Supabase Dashboard** - Database monitoring
   - Query performance
   - API usage
   - Storage usage
   - Auth logs

---

## 🚀 Post-Deployment Checklist

### Day 1: Launch
- [ ] Deploy to production
- [ ] Test all features
- [ ] Monitor error logs
- [ ] Check performance
- [ ] Gather user feedback

### Week 1: Stabilization
- [ ] Fix critical bugs
- [ ] Optimize slow queries
- [ ] Improve UX based on feedback
- [ ] Monitor crash reports

### Month 1: Iteration
- [ ] Add requested features
- [ ] Improve performance
- [ ] Enhance security
- [ ] Scale infrastructure

---

## 📱 Distributing Your APK

### Option 1: Direct Install (Testing)
- Share APK file via:
  - Google Drive
  - Dropbox
  - WhatsApp
  - Email
- Users enable "Install from Unknown Sources"
- Install manually

### Option 2: Google Play Store (Production)
1. Create Google Play Developer account ($25 one-time)
2. Create app listing
3. Sign APK with keystore:
```bash
keytool -genkey -v -keystore basmikuman.keystore -alias basmikuman -keyalg RSA -keysize 2048 -validity 10000
```
4. Build signed APK
5. Upload to Play Console
6. Submit for review

### Option 3: TestFlight (for Beta Testing)
- Similar to Play Store but for testing
- Invite testers via email
- Automatic updates
- Crash reports

---

## 🎯 Success Criteria

Your app is **PRODUCTION READY** when:

✅ **Functionality**
- All features work without errors
- Error handling is graceful
- Loading states are clear
- Forms validate properly

✅ **Performance**
- Page load < 3 seconds
- No memory leaks
- Smooth animations
- Efficient queries

✅ **Security**
- Credentials not exposed
- RLS policies correct (if enabled)
- Input sanitization
- HTTPS only

✅ **User Experience**
- Intuitive navigation
- Responsive design
- Clear error messages
- Fast feedback

✅ **Stability**
- No crashes
- Handles edge cases
- Offline support (if needed)
- Error boundaries active

---

## 📞 Support & Contact

**Issues:** Create issue di GitHub repository
**Email:** fadlannafian@gmail.com
**Documentation:** Check `*.md` files di root project

---

## 🎉 Congratulations!

Your **BasmiKuman POS** app is now **PRODUCTION READY**! 🚀

**Next Steps:**
1. Run database migration
2. Configure environment variables
3. Build production version
4. Deploy & test
5. Share with users
6. Monitor & iterate

Good luck! 💪
