# 🔧 Fix Error 401 - Supabase RLS Issue

## Problem
```
Failed to load resource: the server responded with a status of 401
```

Error ini terjadi karena Row Level Security (RLS) aktif di Supabase, tetapi tidak ada policies yang mengizinkan akses.

---

## ⚡ Quick Fix (5 menit)

### Step 1: Buka Supabase SQL Editor
```
https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/sql/new
```

### Step 2: Copy SQL Script
Buka file: `disable-rls-demo.sql` di project root

### Step 3: Run SQL
1. Select All (Ctrl+A) dari file `disable-rls-demo.sql`
2. Copy (Ctrl+C)
3. Paste di Supabase SQL Editor
4. Klik **"Run"** atau tekan Ctrl+Enter
5. Tunggu hingga muncul checkmark hijau ✅

### Step 4: Refresh Browser
```bash
# Di browser aplikasi, tekan:
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Step 5: Test Kategori
1. Login ke aplikasi
2. Buka Inventori
3. Klik "Tambah Produk"
4. Klik tombol [+] di samping "Kategori"
5. ✅ Seharusnya bisa menambah kategori sekarang

---

## 🔍 Verify RLS Status

Setelah run SQL, verify dengan query ini di Supabase SQL Editor:

```sql
SELECT 
    tablename, 
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'categories', 
        'products', 
        'customers', 
        'employees', 
        'transactions', 
        'transaction_items',
        'attendance'
    )
ORDER BY tablename;
```

Expected result: Semua table memiliki `RLS Enabled = false`

---

## 🔒 Security Notes

### ⚠️ Warning
Script `disable-rls-demo.sql` menonaktifkan Row Level Security untuk **DEMO/DEVELOPMENT** purposes.

### For Production:
Jangan gunakan disable RLS di production! Sebagai gantinya, buat proper RLS policies:

```sql
-- Example: Enable public access for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
ON categories FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow public insert" 
ON categories FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Allow public update" 
ON categories FOR UPDATE 
TO public 
USING (true);

CREATE POLICY "Allow public delete" 
ON categories FOR DELETE 
TO public 
USING (true);
```

Ulangi untuk setiap table dengan kebijakan sesuai kebutuhan.

---

## 🛠️ Alternative: Temporary Fix via Supabase Dashboard

Jika tidak ingin run SQL, bisa disable RLS manual:

### For Each Table:
1. Buka: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/editor
2. Klik table (categories, products, dll)
3. Klik tab "Policies"
4. Toggle "Enable RLS" ke OFF
5. Confirm
6. Ulangi untuk semua tables

---

## 📋 Checklist After Fix

- [ ] Run SQL script `disable-rls-demo.sql`
- [ ] Verify RLS disabled (all tables show false)
- [ ] Refresh browser (Ctrl + Shift + R)
- [ ] Test create category
- [ ] Test create product
- [ ] Test POS transaction
- [ ] No more 401 errors in console

---

## 🐛 If Still Getting 401 Error

### Check 1: Verify Environment Variables
```bash
# File: .env
VITE_SUPABASE_URL=https://hqrkqsddsmjsdmwmxcrm.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Check 2: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
# Clear cache and restart
npm run dev
```

### Check 3: Clear Browser Cache
```
Settings → Privacy → Clear browsing data
- Cached images and files
- Site data
```

### Check 4: Check Supabase API Status
```bash
node test-connection.mjs
```

Expected output:
```
✅ Connection successful!
✅ Database is accessible
```

---

## 📞 Need Help?

### Error persists after running SQL?
1. Check Supabase project status
2. Verify API keys in `.env`
3. Check browser console for different error messages
4. Try incognito/private window

### Still can't create category?
Share the full error message from console (F12 → Console tab)

---

**Last Updated:** November 3, 2025  
**Quick Link:** https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/sql/new
