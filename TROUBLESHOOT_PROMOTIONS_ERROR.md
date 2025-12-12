# Troubleshooting Error 409 Promotions - Multiple Solutions

## 🔴 Error yang terjadi:
1. HTTP 409 saat input promosi
2. "Failed to fetch (api.supabase.com)" di SQL Editor

## ✅ Solusi 1: Coba Ulang SQL Editor (Paling Mudah)

### Langkah:
1. **Tunggu 1-2 menit** (mungkin temporary network issue)
2. **Refresh halaman** Supabase Dashboard
3. Buka **SQL Editor** lagi
4. Copy paste SQL ini dan klik **Run**:

```sql
ALTER TABLE promotions DISABLE ROW LEVEL SECURITY;
```

Kalau masih error, lanjut ke Solusi 2.

---

## ✅ Solusi 2: Via Table Editor (Tanpa SQL)

### Langkah:
1. Buka **Supabase Dashboard**
2. Klik **Table Editor** di sidebar
3. Pilih tabel **promotions**
4. Klik **⚙️ Settings** (gear icon) di kanan atas tabel
5. Scroll ke bawah cari **Row Level Security (RLS)**
6. Klik tombol untuk **Disable RLS**
7. Klik **Save**

---

## ✅ Solusi 3: Via Supabase CLI (Advanced)

Jika Anda punya Supabase CLI terinstall:

```bash
# Login dulu
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db execute --file FIX_PROMOTIONS_RLS.sql
```

---

## ✅ Solusi 4: Manual via Database Settings

### Langkah:
1. Buka **Supabase Dashboard**
2. Klik **Database** di sidebar
3. Klik **Policies** tab
4. Cari tabel **promotions**
5. **Hapus semua policies** yang ada di tabel promotions
6. Kembali ke **Tables** tab
7. Klik **promotions** table
8. Toggle **RLS** menjadi **OFF**

---

## ✅ Solusi 5: Check Status Supabase

Jika masih gagal, mungkin Supabase sedang down:

1. Buka: https://status.supabase.com
2. Cek apakah ada **incident/outage**
3. Tunggu sampai service normal kembali

---

## 🔍 Verifikasi Setelah Fix

Setelah berhasil disable RLS, test di aplikasi:

1. **Refresh** aplikasi POS
2. Buka **Settings → Promosi**
3. Klik **Tambah Promosi**
4. Isi form:
   - Kode: `TEST10`
   - Nama: `Test Diskon 10%`
   - Tipe: Persentase
   - Nilai: 10
5. Klik **Simpan**

Kalau berhasil tersimpan tanpa error 409, berarti sudah fix! ✅

---

## ℹ️ Kenapa RLS Harus Disabled?

Tabel `promotions` menggunakan **RLS policies yang terlalu restrictive**. Untuk internal POS system (bukan multi-tenant), RLS tidak diperlukan karena:
- Semua user adalah admin/kasir terpercaya
- Tidak ada isolasi data antar tenant
- Simplifies permissions management

Kalau butuh security lebih, bisa enable RLS lagi dengan policy yang lebih permissive.
