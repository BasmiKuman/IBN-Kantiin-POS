# ✅ Setup Checklist - IBN Kantiin POS

## Status Setup

### ✅ Phase 1: Koneksi Supabase (SELESAI)
- [x] Install dependencies (`@supabase/supabase-js`)
- [x] Buat file `.env` dengan credentials
- [x] Konfigurasi Supabase client
- [x] Add `.env` to `.gitignore`
- [x] Test koneksi berhasil

### ✅ Phase 2: Attendance System (SELESAI)
- [x] Buat schema attendance database
- [x] Buat React hooks untuk CRUD attendance
- [x] Buat halaman Employee Login untuk clock in/out
- [x] Tambah tab Absensi di halaman Employees
- [x] Dokumentasi lengkap

### ✅ Phase 3: Login System (SELESAI)
- [x] Buat halaman Login utama
- [x] Implementasi ProtectedRoute component
- [x] Setup localStorage authentication
- [x] Tambah logout functionality
- [x] Demo accounts untuk testing

### ✅ Phase 4: Production Improvements (SELESAI)
- [x] Hilangkan metode pembayaran kartu kredit/debit
- [x] Tambahkan highlight navigation active
- [x] Tambah tombol kategori di dialog produk
- [x] Username/password di form karyawan
- [x] Update logo dengan file logo.png
- [x] Fix highlight tombol logout
- [x] Implementasi role-based access: Admin
- [x] Implementasi role-based access: Manager

### ⏳ Phase 5: Database Setup (ACTION REQUIRED)
- [ ] Buka Supabase SQL Editor
- [ ] Copy & Paste migration SQL
- [ ] Run migration
- [ ] Verify tables created

### 🎯 Phase 6: Test Aplikasi
- [ ] Start dev server (`npm run dev`)
- [ ] Test login dengan berbagai roles
- [ ] Test role-based menu filtering
- [ ] Test attendance system
- [ ] Test POS transactions

---

## 📋 Step-by-Step Instructions

### 1️⃣ Setup Database (5 menit)

**Link Langsung:**
```
https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/sql/new
```

**Langkah:**
1. Klik link di atas
2. Buka file: `supabase/migrations/20251103000000_initial_schema.sql`
3. Select All (Ctrl+A) dan Copy (Ctrl+C)
4. Paste di SQL Editor
5. Klik "Run" (atau Ctrl+Enter)
6. Tunggu hingga selesai (ada checkmark hijau)

**Verify:**
```bash
node test-connection.mjs
```

Expected output:
```
✅ Connection successful!
✅ Database tables already exist!
```

---

### 2️⃣ Create Admin User (OPTIONAL - 2 menit)

Jika ingin menggunakan authentication:

```bash
node create-admin.mjs
```

Follow the prompts:
- Email: admin@example.com
- Password: (min 6 characters)
- Full Name: Admin User
- Phone: 08123456789 (optional)

---

### 3️⃣ Start Development (1 menit)

```bash
npm run dev
```

Open browser: http://localhost:8080

---

## 🔍 Verification Checklist

### Database Tables
Buka: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/editor

Should see:
- [ ] profiles
- [ ] user_roles
- [ ] categories (with 4 sample categories)
- [ ] products (with 4 sample products)
- [ ] customers
- [ ] employees
- [ ] transactions
- [ ] transaction_items

### Sample Data
Check categories table:
- [ ] Makanan
- [ ] Minuman
- [ ] Snack
- [ ] Bumbu & Bahan

Check products table:
- [ ] Nasi Goreng Special (Rp 25.000)
- [ ] Mie Ayam (Rp 20.000)
- [ ] Es Teh Manis (Rp 5.000)
- [ ] Kopi Hitam (Rp 8.000)

---

## 📊 Quick Tests

### Test 1: View Categories
```javascript
import { supabase } from '@/integrations/supabase/client';

const { data } = await supabase.from('categories').select('*');
console.log(data); // Should show 4 categories
```

### Test 2: View Products
```javascript
const { data } = await supabase
  .from('products')
  .select('*, categories(name)')
  .eq('is_active', true);
console.log(data); // Should show 4 products with category names
```

### Test 3: Create Customer
```javascript
const { data } = await supabase
  .from('customers')
  .insert({
    name: 'Test Customer',
    phone: '08123456789',
    tier: 'bronze'
  })
  .select()
  .single();
console.log(data); // Should return new customer
```

---

## 🚨 Troubleshooting

### "Table does not exist"
➡️ Run migration SQL belum dijalankan
➡️ Solution: Ikuti Phase 2 di atas

### "Invalid API key"
➡️ Check file `.env`
➡️ Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY sudah benar

### "Permission denied"
➡️ Row Level Security (RLS) aktif
➡️ Pastikan sudah login atau gunakan service role key untuk testing

### Server tidak start
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📚 Resources

### Files Created
```
.env                                    # Supabase credentials
supabase/config.toml                    # Supabase config
supabase/migrations/20251103...sql      # Database schema
test-connection.mjs                     # Connection test
create-admin.mjs                        # Admin user creator
supabase-examples.js                    # Code examples
SETUP_COMPLETE.md                       # Full documentation
SUPABASE_SETUP.md                       # Supabase guide
README_SUPABASE.txt                     # Quick reference
```

### Useful Links
- Dashboard: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm
- Table Editor: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/editor
- SQL Editor: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/sql/new
- API Docs: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/api
- Logs: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/logs

---

## ✅ Final Checklist

Before going to production:
- [ ] Database migration completed
- [ ] Admin user created
- [ ] All features tested
- [ ] `.env` file NOT committed to git
- [ ] RLS policies verified
- [ ] Backup migration file saved

---

## 🎉 Next Steps After Setup

1. **Customize Categories**: Add your own product categories
2. **Add Products**: Input your actual inventory
3. **Setup Employees**: Add kasir and other staff
4. **Configure Settings**: Business name, timezone, etc.
5. **Test POS Flow**: Create test transactions
6. **Generate Reports**: View sales analytics

---

**Current Status**: ✅ Supabase Connected | ⏳ Pending Migration

**Estimated Time to Complete**: 5-10 minutes

**Need Help?**: Check SUPABASE_SETUP.md for detailed instructions
