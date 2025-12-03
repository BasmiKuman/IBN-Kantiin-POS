# 🚀 Quick Start - BasmiKuman POS Production

## ⚡ Setup Database (3 menit)

### Step 1: Buka Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **"SQL Editor"** di sidebar kiri
4. Klik **"New Query"**

### Step 2: Run Complete Setup SQL

1. Buka file: `CREATE_ADMIN_ACCOUNT.sql`
2. **Copy SELURUH isi file** (Ctrl+A → Ctrl+C)
3. **Paste** ke SQL Editor di Supabase
4. Klik **"Run"** atau tekan `Ctrl + Enter`

**⏱️ Waktu eksekusi:** ~5-10 detik

### Step 3: Verify Setup

Setelah SQL selesai, Anda akan melihat output:

```
✅ ADMIN ACCOUNT CREATED
id: [uuid]
name: Admin - Fadlan Nafian
username: Basmikuman
position: admin
...

✅ TABLES CREATED
total_tables: 10+

✅ STORAGE SETUP
total_buckets: 1
```

**Jika ada error "relation already exists"** = NORMAL! Artinya table sudah ada sebelumnya.

---

## 🔑 Setup Environment Variables (1 menit)

### Get Supabase Credentials

1. Di Supabase Dashboard, klik **Settings** → **API**
2. Copy **Project URL** (contoh: `https://xxxxx.supabase.co`)
3. Copy **anon public** key

### Create .env File

Di root project, buat file `.env`:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace** dengan credentials Anda!

---

## 🧪 Test Local (1 menit)

```bash
# Install dependencies (jika belum)
npm install

# Build production
npm run build:prod

# Preview production build
npm run preview
```

**Open browser:** http://localhost:4173

**Login:**
- Username: `Basmikuman`
- Password: `kadalmesir007`
- Role: `admin`

**Test:**
- ✅ Dashboard muncul
- ✅ Charts tampil
- ✅ POS berfungsi
- ✅ Absensi auto-created (cek table attendance)

---

## 🚀 Deploy Production

### Option 1: Web Deployment (Vercel/Netlify)

```bash
# Build sudah ada di folder dist/
# Upload dist/ folder ke:
# - Vercel: drag & drop
# - Netlify: drag & drop
# - Firebase Hosting: firebase deploy
```

### Option 2: Android APK (GitHub Actions)

**Setup GitHub Secrets:**

1. Go to GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add 2 secrets:

```
Name: VITE_SUPABASE_URL
Value: https://your-project-id.supabase.co

Name: VITE_SUPABASE_PUBLISHABLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Trigger Build:**

```bash
git add .
git commit -m "Production ready"
git push origin main
```

**Download APK:**
- Go to **Actions** tab
- Wait for build to complete (~5-8 minutes)
- Download from **Artifacts** or **Releases**

---

## ✅ What's Included in Setup SQL

### Tables Created:
1. ✅ `categories` - Product categories
2. ✅ `products` - Product catalog
3. ✅ `customers` - Customer data
4. ✅ `employees` - Employee data (with username/password)
5. ✅ `attendance` - Attendance records (using username)
6. ✅ `transactions` - Sales transactions
7. ✅ `transaction_items` - Transaction details
8. ✅ `settings` - App settings

### Data Inserted:
- ✅ Admin account (Basmikuman / kadalmesir007)
- ✅ Demo category (Makanan)
- ✅ Demo products (Nasi Goreng, Es Teh)
- ✅ Default settings (store name, tax)

### Storage Setup:
- ✅ Bucket `employees` for photo uploads
- ✅ Storage policies (public read/write)

---

## 🎯 Key Changes for Production

### 1. **Attendance System Updated**

**Now uses `username` instead of email/phone:**

```typescript
// Old (phone/email based)
employee_phone: "08123456789"

// New (username based) ✅
employee_username: "Basmikuman"
employee_name: "Admin - Fadlan Nafian"
employee_id: [uuid]
```

**Benefits:**
- Faster queries (indexed)
- More reliable (unique constraint)
- Consistent with login system

### 2. **Complete Database Setup**

SQL file now includes:
- ✅ Table creation (IF NOT EXISTS)
- ✅ Enum types
- ✅ Indexes
- ✅ Storage setup
- ✅ Admin account
- ✅ Demo data
- ✅ Verification queries

**No manual steps needed!** Just run once.

---

## 🐛 Troubleshooting

### Error: "relation already exists"
**Solution:** IGNORE - table sudah ada, SQL akan skip creation

### Error: "permission denied"
**Solution:** Make sure you're using Supabase admin/service role

### Error: "Missing environment variables"
**Solution:** Create `.env` file dengan Supabase credentials

### Admin login gagal
**Solution:** 
1. Run verification query di SQL Editor:
```sql
SELECT * FROM employees WHERE username = 'Basmikuman';
```
2. If not found, re-run Part 3 dari CREATE_ADMIN_ACCOUNT.sql

### Attendance tidak auto-created
**Solution:**
1. Check table exists:
```sql
SELECT * FROM attendance LIMIT 1;
```
2. Check employee_id di localStorage setelah login
3. Check console untuk errors

---

## 📊 Verify Everything Works

### Check Tables:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected: 8+ tables

### Check Admin:
```sql
SELECT * FROM employees WHERE username = 'Basmikuman';
```

Expected: 1 row

### Check Storage:
```sql
SELECT * FROM storage.buckets WHERE id = 'employees';
```

Expected: 1 bucket

### Check Attendance Structure:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'attendance';
```

Expected columns:
- employee_id (uuid)
- employee_username (text)
- employee_name (text)
- check_in (timestamp)
- check_out (timestamp)
- date (date)

---

## 🎉 Success!

Your BasmiKuman POS is now:
- ✅ Database ready
- ✅ Admin account created
- ✅ Attendance system using username
- ✅ Storage configured
- ✅ Demo data inserted
- ✅ Ready for production!

**Next:** Test login → Create transaction → Check reports!

---

## 📞 Need Help?

**Documentation:**
- `PRODUCTION_READY.md` - Complete guide
- `DEPLOYMENT_CHECKLIST.md` - Final checklist
- `CREATE_ADMIN_ACCOUNT.sql` - Database setup

**Support:** fadlannafian@gmail.com

---

*Last Updated: November 4, 2025*
*Version: 1.0.0*
