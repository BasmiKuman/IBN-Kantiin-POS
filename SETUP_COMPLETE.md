# 🎯 Setup Supabase - Panduan Lengkap

## ✅ Yang Sudah Dikerjakan

### 1. ✅ Koneksi Supabase
- File `.env` sudah dibuat dengan credentials Supabase Anda
- Supabase client sudah terkonfigurasi di `src/integrations/supabase/client.ts`
- Dependencies `@supabase/supabase-js` sudah diinstall

### 2. ✅ Database Schema
- Migration file sudah dibuat: `supabase/migrations/20251103000000_initial_schema.sql`
- Includes semua tabel yang dibutuhkan untuk aplikasi POS

### 3. ✅ Development Server
- Server sudah running di: **http://localhost:8080**

---

## 🚨 LANGKAH PENTING: Setup Database

Database schema **belum dijalankan** di Supabase Anda. Ikuti langkah ini:

### 📋 Langkah-langkah:

1. **Buka Supabase SQL Editor**
   ```
   https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/sql/new
   ```

2. **Copy Migration SQL**
   - Buka file: `supabase/migrations/20251103000000_initial_schema.sql`
   - Tekan `Ctrl+A` untuk select all
   - Tekan `Ctrl+C` untuk copy

3. **Paste & Run**
   - Paste di SQL Editor (Ctrl+V)
   - Klik tombol **"Run"** (atau tekan Ctrl+Enter)
   - Tunggu sampai selesai (biasanya < 5 detik)

4. **Verify**
   - Buka Table Editor: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/editor
   - Anda akan melihat tables: categories, products, customers, dll

---

## 📊 Database Tables yang Akan Dibuat

1. **profiles** - User profiles
2. **user_roles** - Admin/Kasir/Manajer roles
3. **categories** - Kategori produk (Makanan, Minuman, Snack, dll)
4. **products** - Inventory produk
5. **customers** - Data pelanggan + loyalty program
6. **employees** - Data karyawan
7. **transactions** - Transaksi penjualan
8. **transaction_items** - Detail item per transaksi

Plus data sample:
- 4 kategori produk
- 4 produk sample (Nasi Goreng, Mie Ayam, Es Teh, Kopi)

---

## 🧪 Test Koneksi

Setelah menjalankan migration, test koneksi dengan:

```bash
node test-connection.mjs
```

Expected result:
```
✅ Connection successful!
✅ Database tables already exist!
```

---

## 🎯 Fitur yang Sudah Siap

### Point of Sale (POS)
- ✅ Multi-payment methods (Cash, Debit, Credit, QRIS, Transfer)
- ✅ Customer selection & points
- ✅ Discount & tax calculation
- ✅ Receipt printing

### Inventory Management
- ✅ Product catalog
- ✅ Category management
- ✅ Stock tracking
- ✅ Low stock alerts
- ✅ SKU management

### Customer Loyalty
- ✅ 4 tier membership (Bronze, Silver, Gold, Platinum)
- ✅ Points system
- ✅ Purchase history
- ✅ Customer segmentation

### Employee Management
- ✅ Role-based access (Admin, Kasir, Manajer)
- ✅ Salary tracking
- ✅ Performance monitoring

### Reports & Analytics
- ✅ Sales reports
- ✅ Revenue tracking
- ✅ Product performance
- ✅ Customer insights

---

## 🔐 Security

- ✅ Row Level Security (RLS) enabled
- ✅ Authentication required
- ✅ API keys secured in `.env` (tidak ter-commit ke git)

---

## 📱 Akses Aplikasi

**Local Development:**
```
http://localhost:8080
```

**Supabase Dashboard:**
```
https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm
```

---

## 📚 Files Reference

| File | Deskripsi |
|------|-----------|
| `.env` | Supabase credentials |
| `supabase/migrations/20251103000000_initial_schema.sql` | Database schema |
| `src/integrations/supabase/client.ts` | Supabase client config |
| `src/integrations/supabase/types.ts` | TypeScript types |
| `SUPABASE_SETUP.md` | Dokumentasi lengkap |
| `test-connection.mjs` | Test script |

---

## ⚡ Quick Start

1. ✅ Dependencies installed
2. ✅ Supabase connected
3. ✅ Server running
4. ⏳ **Run migration SQL** (langkah di atas)
5. 🎉 Ready to use!

---

## 💡 Tips

- Migration SQL hanya perlu dijalankan **sekali**
- Jika ada error, cek Supabase logs di Dashboard
- Backup migration file untuk referensi
- Gunakan `test-connection.mjs` untuk verify setup

---

**Status**: ✅ Project sudah terhubung ke Supabase!  
**Action Required**: Run migration SQL di Dashboard (5 menit)

Setelah migration selesai, aplikasi POS Anda sudah siap digunakan! 🚀
