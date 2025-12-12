# Fix Error 409 - Promotions Table

## 🔴 Error yang terjadi:
```
Failed to load resource: the server responded with a status of 409
```

Ketika mencoba input/create promosi baru.

## 🔍 Penyebab:
Row Level Security (RLS) policies pada tabel `promotions` **memblokir** operasi INSERT/UPDATE/DELETE.

## ✅ Solusi:

### Langkah 1: Buka Supabase Dashboard
1. Login ke https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri

### Langkah 2: Jalankan SQL Fix
Copy & paste SQL berikut ke SQL Editor, lalu klik **Run**:

```sql
-- Drop existing RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON promotions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON promotions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON promotions;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON promotions;

-- Disable RLS for promotions table
ALTER TABLE promotions DISABLE ROW LEVEL SECURITY;
```

### Langkah 3: Verifikasi Fix Berhasil
Jalankan query ini untuk memastikan RLS sudah disabled:

```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'promotions';
```

**Expected result:** `rowsecurity = false`

### Langkah 4: Test di Aplikasi
1. Refresh aplikasi POS Anda
2. Buka **Settings → Promosi**
3. Klik **Tambah Promosi**
4. Isi form dan klik **Simpan**

Error 409 seharusnya sudah hilang! ✅

---

## 📝 Catatan:
- File SQL fix ada di: `FIX_PROMOTIONS_RLS.sql`
- RLS di-disable karena ini internal POS system, bukan multi-tenant
- Kalau mau keep RLS enabled, bisa uncomment alternatif policy di file SQL
