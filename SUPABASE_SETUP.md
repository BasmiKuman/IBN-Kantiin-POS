# 🎉 Supabase Setup - IBN Kantiin POS

## ✅ Status Koneksi
Project ini **sudah terhubung** ke Supabase!

- **Project URL**: https://hqrkqsddsmjsdmwmxcrm.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm

## 📁 File yang Sudah Dikonfigurasi

### 1. Environment Variables (`.env`)
```env
VITE_SUPABASE_URL=https://hqrkqsddsmjsdmwmxcrm.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Supabase Client (`src/integrations/supabase/client.ts`)
Client sudah dikonfigurasi dan siap digunakan:
```typescript
import { supabase } from '@/integrations/supabase/client';
```

### 3. Database Schema (`supabase/migrations/20251103000000_initial_schema.sql`)
Migration file lengkap dengan:
- ✅ User roles & authentication
- ✅ Categories & Products
- ✅ Customers & Loyalty tiers
- ✅ Employees
- ✅ Transactions & Payment methods
- ✅ Sample data

## 🚀 Langkah Selanjutnya: Setup Database

### Cara 1: Melalui Supabase Dashboard (RECOMMENDED)

1. **Buka SQL Editor**
   - Go to: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/sql/new
   
2. **Copy Migration SQL**
   - Buka file: `supabase/migrations/20251103000000_initial_schema.sql`
   - Copy semua isi file (Ctrl+A, Ctrl+C)
   
3. **Run Migration**
   - Paste ke SQL Editor di Supabase Dashboard
   - Klik tombol **"Run"** atau tekan **Ctrl+Enter**
   
4. **Verify**
   - Setelah sukses, check di **Table Editor** untuk melihat semua tabel yang sudah dibuat

### Cara 2: Menggunakan Script (Alternative)

```bash
node test-connection.mjs
```

## 📊 Database Schema

### Tables:
1. **profiles** - User profiles
2. **user_roles** - Role-based access control (admin, kasir, manajer)
3. **categories** - Product categories
4. **products** - Product inventory
5. **customers** - Customer data & loyalty program
6. **employees** - Employee management
7. **transactions** - Sales transactions
8. **transaction_items** - Transaction line items

### Enums:
- `app_role`: admin, kasir, manajer
- `customer_tier`: bronze, silver, gold, platinum
- `payment_method`: cash, debit, credit, qris, transfer
- `transaction_status`: completed, pending, cancelled

## 🔐 Row Level Security (RLS)

Semua tabel sudah dilengkapi dengan RLS policies untuk keamanan:
- Authenticated users dapat melihat dan mengelola data
- Admin memiliki akses penuh ke employee management
- Users hanya bisa update profile mereka sendiri

## 🧪 Testing Koneksi

Jalankan test connection:
```bash
node test-connection.mjs
```

Expected output:
- ✅ Connection successful
- ✅ Database tables exist

## 🏃 Menjalankan Aplikasi

Setelah migration selesai:

```bash
npm run dev
```

Aplikasi akan berjalan di: http://localhost:8080

## 📚 Menggunakan Supabase Client

### Contoh Query:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Get all products
const { data: products } = await supabase
  .from('products')
  .select('*');

// Get products with category
const { data: productsWithCategory } = await supabase
  .from('products')
  .select(`
    *,
    categories (
      id,
      name
    )
  `);

// Create new customer
const { data: newCustomer } = await supabase
  .from('customers')
  .insert({
    name: 'John Doe',
    phone: '08123456789',
    tier: 'bronze'
  })
  .select()
  .single();

// Create transaction
const { data: transaction } = await supabase
  .from('transactions')
  .insert({
    transaction_number: 'TRX-001',
    subtotal: 50000,
    total: 50000,
    payment_method: 'cash',
    payment_amount: 50000
  })
  .select()
  .single();
```

## 🎯 Features yang Sudah Terintegrasi

- ✅ Authentication & User Management
- ✅ Product Catalog
- ✅ Customer Loyalty Program (Bronze, Silver, Gold, Platinum)
- ✅ Point of Sale (POS)
- ✅ Inventory Management
- ✅ Multi-payment Methods (Cash, Debit, Credit, QRIS, Transfer)
- ✅ Employee Management
- ✅ Transaction History
- ✅ Real-time Updates

## 🔧 Troubleshooting

### "Table does not exist"
➡️ Run migration SQL di Supabase Dashboard

### "Invalid API key"
➡️ Check `.env` file, pastikan keys sudah benar

### "Permission denied"
➡️ Check RLS policies di Supabase Dashboard

## 📞 Support

Jika ada masalah:
1. Check Supabase logs: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/logs
2. Verify API keys di Settings > API
3. Check RLS policies di Table Editor

---

**Status**: ✅ Ready to use!
**Next Step**: Run migration SQL di Supabase Dashboard
