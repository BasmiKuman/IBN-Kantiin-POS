# 🔧 Fix: DELETE Operations Not Working

## Masalah
Ketika melakukan **delete produk**, **delete karyawan**, atau **update kategori**, perubahan **tidak tersimpan di Supabase**.

## Penyebab
Ada **2 kemungkinan penyebab**:

### 1. RLS (Row Level Security) Masih Aktif ❌
RLS policy di Supabase mungkin masih aktif dan memblokir operasi DELETE/UPDATE.

### 2. Soft Delete (Bukan Hard Delete) ℹ️
Sistem menggunakan **soft delete**, jadi data tidak benar-benar dihapus dari database, hanya di-mark sebagai `is_active: false`.

---

## ✅ Solusi 1: Disable RLS di Supabase

### Langkah-langkah:

1. **Buka Supabase Dashboard** → https://supabase.com/dashboard
2. **Pilih project** "IBN Kantiin POS"
3. **Klik SQL Editor** (icon </>)
4. **Copy-paste SQL berikut** dan klik **RUN**:

```sql
-- Disable RLS on all tables
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- Grant full permissions
GRANT ALL ON public.categories TO anon, authenticated;
GRANT ALL ON public.products TO anon, authenticated;
GRANT ALL ON public.product_variants TO anon, authenticated;
GRANT ALL ON public.customers TO anon, authenticated;
GRANT ALL ON public.employees TO anon, authenticated;
GRANT ALL ON public.attendance TO anon, authenticated;
GRANT ALL ON public.transactions TO anon, authenticated;
GRANT ALL ON public.transaction_items TO anon, authenticated;
GRANT ALL ON public.settings TO anon, authenticated;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'employees', 'categories')
ORDER BY tablename;
```

5. **Lihat hasil** - semua `rowsecurity` harus `false`
6. **Test delete** di aplikasi

---

## ✅ Solusi 2: Pahami Soft Delete

Sistem menggunakan **soft delete** untuk menjaga data historis:

### Products (`useDeleteProduct`)
```typescript
// TIDAK hard delete, tapi soft delete
.update({ is_active: false })
.eq('id', id);
```
- Produk **tidak hilang** dari database
- Hanya **tidak muncul** di list produk aktif
- Data **tetap ada** untuk laporan transaksi lama

### Employees (`useDeleteEmployee`)
```typescript
// TIDAK hard delete, tapi soft delete
.update({ is_active: false })
.eq('id', id);
```
- Karyawan **tidak hilang** dari database
- Hanya **dinonaktifkan**
- Data attendance lama **tetap valid**

### Cara Melihat Data yang "Terhapus":

#### Di Supabase SQL Editor:
```sql
-- Lihat produk yang di-soft delete
SELECT * FROM products WHERE is_active = false;

-- Lihat karyawan yang di-soft delete
SELECT * FROM employees WHERE is_active = false;
```

#### Di Aplikasi:
Data yang `is_active: false` **tidak akan muncul** karena query filter:
```typescript
// useProducts
.select('*')
.eq('is_active', true)  // ← Hanya ambil yang aktif

// useEmployees
.select('*')
.eq('is_active', true)  // ← Hanya ambil yang aktif
```

---

## 🧪 Test Delete Operations

### Test 1: Delete Produk
1. Buka **Inventory**
2. Klik **Delete** pada produk test
3. Produk **hilang dari list**
4. Buka **Supabase → Table Editor → products**
5. Cari produk tersebut → `is_active` = `false` ✅

### Test 2: Delete Karyawan
1. Buka **Employees**
2. Klik **Delete** pada karyawan test
3. Karyawan **hilang dari list**
4. Buka **Supabase → Table Editor → employees**
5. Cari karyawan tersebut → `is_active` = `false` ✅

### Test 3: Update Kategori
1. Buka **Inventory → Kategori**
2. Edit nama kategori
3. Simpan
4. Buka **Supabase → Table Editor → categories**
5. Lihat `updated_at` berubah ✅

---

## 📊 Verifikasi Perubahan di Supabase

### Cara 1: Via Table Editor
1. Buka **Supabase Dashboard**
2. Klik **Table Editor**
3. Pilih table (products/employees/categories)
4. Lihat data terbaru
5. Check `updated_at` timestamp
6. Check `is_active` untuk soft delete

### Cara 2: Via SQL Editor
```sql
-- Check recent deletes (last 1 hour)
SELECT * FROM products 
WHERE is_active = false 
  AND updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;

-- Check recent updates
SELECT * FROM categories
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

---

## ⚠️ Jika Masih Tidak Work

### Checklist:
- [ ] RLS sudah di-disable (run SQL di atas)
- [ ] Browser sudah di-refresh (Ctrl + F5)
- [ ] Check Network tab di DevTools → lihat response error
- [ ] Check Console tab → lihat error message
- [ ] Verify Supabase credentials benar di `.env`

### Debug Steps:
1. Buka **Browser DevTools** (F12)
2. Klik tab **Network**
3. Filter: **Fetch/XHR**
4. Lakukan delete operation
5. Klik request yang **merah** (error)
6. Lihat **Response** → copy error message
7. Kirim error message untuk di-debug

---

## 📝 Summary

| Operation | Type | Behavior |
|-----------|------|----------|
| Delete Product | Soft Delete | `is_active: false`, data tetap ada |
| Delete Employee | Soft Delete | `is_active: false`, data tetap ada |
| Update Category | Hard Update | Data di-update langsung |
| Delete Variant | Hard Delete | Data benar-benar terhapus |

**Soft delete** adalah **by design** untuk:
- ✅ Menjaga data historis transaksi
- ✅ Reporting tetap akurat
- ✅ Audit trail lengkap
- ✅ Bisa "undelete" jika perlu

Jika ingin **hard delete** (hapus permanen), butuh ubah code di hooks.
