# Fix Error 409 - SKU Duplicate Constraint

## 🔍 Root Cause
Error 409 (Conflict) disebabkan oleh **UNIQUE constraint pada kolom `sku`** di tabel `products`. 
User mencoba menambah produk dengan SKU yang sudah ada di database, sehingga Supabase menolak dengan error:
```
Product sku key violate unique constraint
```

## ✅ Solutions Implemented

### 1. Auto-Generate SKU (Inventory.tsx)
- **Field SKU sekarang OPTIONAL** - tidak wajib diisi
- Jika field SKU dikosongkan, sistem akan auto-generate SKU unik dengan format:
  ```
  SKU-{timestamp}-{randomNumber}
  Contoh: SKU-1731312000123-456
  ```

### 2. SKU Duplicate Check (Inventory.tsx)
- Sebelum insert produk, sistem cek apakah SKU sudah ada di database
- Jika SKU duplikat, tampilkan error message yang jelas:
  ```
  SKU "XXX" sudah digunakan. Mohon gunakan SKU yang berbeda.
  ```

### 3. Better Error Handling (useProducts.ts)
- Menangani error code `23505` (Unique constraint violation) dari PostgreSQL
- Menampilkan error message yang user-friendly:
  - Error SKU duplikat: "SKU sudah digunakan. Gunakan SKU yang berbeda."
  - Error 409: "Terjadi konflik data. SKU mungkin sudah digunakan."
  - Generic: "Data duplikat terdeteksi. Periksa kembali input Anda."

### 4. UI Improvement
- Label SKU diubah dari "SKU *" menjadi "SKU (Opsional)"
- Placeholder berubah dari "FOOD-001" menjadi "Kosongkan untuk auto-generate"
- Tambahan help text: "Biarkan kosong untuk SKU otomatis"

## 📝 Files Changed
1. `src/pages/Inventory.tsx`
   - Function `handleCreateProduct()` - Added auto-generate SKU logic
   - Added SKU duplicate validation before insert
   - Updated form labels and placeholders

2. `src/hooks/supabase/useProducts.ts`
   - Function `useCreateProduct()` - Enhanced error handling
   - Added specific error messages for constraint violations

## 🧪 Testing Steps
1. Buka halaman **Inventory**
2. Klik "Tambah Produk"
3. Isi Nama, Kategori, dan Harga
4. **KOSONGKAN field SKU** (atau isi SKU custom)
5. Klik "Simpan Produk"
6. ✅ Produk berhasil ditambahkan dengan SKU otomatis

## 🚨 Note
Error 409 yang terjadi **BUKAN** karena RLS (Row Level Security), melainkan karena:
- UNIQUE constraint pada kolom `sku`
- User mencoba insert SKU yang sudah ada

RLS sudah tidak menjadi masalah setelah dijalankan SQL fix sebelumnya.

## 📊 Database Schema
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,  -- ← UNIQUE constraint ini penyebabnya
  price NUMERIC NOT NULL,
  ...
);
```

## ✨ Benefits
- User tidak perlu pusing memikirkan SKU unik
- Mengurangi error saat input produk
- Error message lebih jelas dan actionable
- Tetap memungkinkan custom SKU jika diinginkan
