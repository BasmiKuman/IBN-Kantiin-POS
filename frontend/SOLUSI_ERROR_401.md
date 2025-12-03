# ⚡ SOLUSI CEPAT - Error 401 Kategori

## 🎯 Masalah
Tidak bisa menambahkan kategori karena error 401 (Unauthorized)

## ✅ Solusi (2 Menit)

### Langkah 1: Buka Link Ini
**Klik atau copy link ini ke browser:**
```
https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/sql/new
```

### Langkah 2: Copy SQL Berikut

```sql
-- Disable RLS untuk semua table (Demo/Development only)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
```

### Langkah 3: Paste & Run
1. Paste SQL di atas ke SQL Editor
2. Klik tombol **"Run"** (atau Ctrl + Enter)
3. Tunggu sampai muncul "Success" ✅

### Langkah 4: Refresh Browser
Di halaman aplikasi POS:
- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

### Langkah 5: Test Lagi
1. Login ke aplikasi
2. Buka menu **Inventori**
3. Klik **"Tambah Produk"**
4. Klik tombol **[+]** di samping "Kategori"
5. Ketik nama kategori baru
6. Klik **"Simpan Kategori"**
7. ✅ **Seharusnya berhasil sekarang!**

---

## 🔍 Verify Berhasil

Setelah run SQL, test dengan query ini di SQL Editor:

```sql
-- Cek status RLS
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('categories', 'products', 'customers', 'employees');
```

**Expected:** Semua table memiliki `rowsecurity = false`

---

## 🎥 Visual Guide

```
Step 1: Open Supabase Dashboard
   ↓
Step 2: SQL Editor
   ↓
Step 3: Paste SQL (ALTER TABLE...)
   ↓
Step 4: Click "Run"
   ↓
Step 5: See "Success ✅"
   ↓
Step 6: Refresh Browser (Ctrl+Shift+R)
   ↓
Step 7: Try Add Category Again
   ↓
✅ BERHASIL!
```

---

## ❓ Masih Error?

### Cek Console Browser (F12)
Jika masih ada error, screenshot dan kirim:
1. Tekan `F12` di browser
2. Klik tab **Console**
3. Screenshot error yang muncul

### Alternative: Disable Manual di Dashboard
1. Buka: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/editor
2. Klik table **"categories"**
3. Klik tab **"Policies"**
4. Toggle **"Enable RLS"** ke OFF
5. Ulangi untuk table lain (products, customers, dll)

---

## ⚠️ Catatan Penting

**Ini solusi untuk DEMO/DEVELOPMENT.**

Untuk production nanti, kita akan:
1. Re-enable RLS
2. Buat proper authentication policies
3. Gunakan Supabase Auth

**Sekarang fokus testing dulu, production setup nanti!** 🚀

---

**Quick Link:** https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/sql/new
