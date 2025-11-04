# 🧪 Quick Testing Guide - IBN Kantiin POS

**Dev Server:** http://localhost:8081

---

## 🔐 Demo Accounts

```
┌─────────────┬──────────────┬────────────┐
│ Username    │ Password     │ Role       │
├─────────────┼──────────────┼────────────┤
│ admin       │ admin123     │ Admin      │
│ manager     │ manager123   │ Manager    │
│ kasir       │ kasir123     │ Kasir      │
└─────────────┴──────────────┴────────────┘
```

---

## ✅ Test Scenario 1: Admin Full Access

### Step 1: Login sebagai Admin
1. Buka: http://localhost:8081
2. Input: `admin` / `admin123`
3. Klik "Masuk"

### Step 2: Verifikasi UI
- ✅ Badge sidebar: "Administrator • HH:mm"
- ✅ Logo: IBN Kantiin POS logo.png terlihat
- ✅ 7 Menu items:
  1. Dashboard
  2. POS
  3. Inventori
  4. Laporan
  5. Pelanggan
  6. **Karyawan** ← Admin only!
  7. Pengaturan

### Step 3: Test Active Navigation
- Klik setiap menu
- ✅ Active menu: Background biru (primary) dengan shadow
- ✅ Inactive menu: Background transparan

### Step 4: Test Karyawan Page
- Klik menu "Karyawan"
- ✅ Halaman terbuka normal
- ✅ Tab "Daftar Karyawan" terlihat
- ✅ Tab "Absensi" terlihat
- ✅ Form memiliki field Username & Password
- ✅ Tidak ada field Gaji

### Step 5: Test Logout
- Hover tombol logout
- ✅ Background berubah merah muda
- ✅ Tidak blank putih
- Klik logout
- ✅ Redirect ke /login

---

## 🔒 Test Scenario 2: Manager Limited Access

### Step 1: Login sebagai Manager
1. Input: `manager` / `manager123`
2. Klik "Masuk"

### Step 2: Verifikasi Menu Restriction
- ✅ Badge: "Manager • HH:mm"
- ✅ Hanya 6 menu items (tanpa "Karyawan"):
  1. Dashboard ✅
  2. POS ✅
  3. Inventori ✅
  4. Laporan ✅
  5. Pelanggan ✅
  6. Pengaturan ✅
  7. ~~Karyawan~~ ❌ HIDDEN

### Step 3: Test Route Protection
1. Manual akses URL: http://localhost:8081/employees
2. ✅ Otomatis redirect ke Dashboard
3. ✅ Toast muncul: "Akses Ditolak"
4. ✅ Description: "Anda tidak memiliki izin..."

### Step 4: Test Allowed Pages
- Klik Dashboard ✅
- Klik POS ✅
- Klik Inventori ✅
- Semua berfungsi normal

---

## 💳 Test Scenario 3: Payment Methods

### Step 1: Buka POS Page
1. Klik menu "POS"
2. Tambah beberapa produk ke cart

### Step 2: Verifikasi Payment Buttons
**Harus ada 3 tombol:**
- ✅ Tunai (Cash icon)
- ✅ QRIS (QR Code icon)
- ✅ Transfer Bank (CreditCard icon)

**Tidak boleh ada:**
- ❌ Kartu Debit
- ❌ Kartu Kredit

### Step 3: Test Payment Flow
1. Klik "Tunai"
2. ✅ Dialog konfirmasi muncul
3. ✅ Payment method = "cash"
4. Complete transaction
5. ✅ Transaksi berhasil

---

## 📦 Test Scenario 4: Category Management

### Step 1: Buka Inventori
1. Klik menu "Inventori"
2. Klik "Tambah Produk"

### Step 2: Test Inline Category Creation
1. Lihat field "Kategori *"
2. ✅ Ada tombol [+] di sebelahnya
3. Klik tombol [+]
4. ✅ Dialog "Tambah Kategori Baru" muncul

### Step 3: Create New Category
1. Input: "Kategori Test"
2. Klik "Simpan Kategori"
3. ✅ Dialog tertutup
4. ✅ Kategori baru otomatis terselect
5. Complete form dan simpan produk
6. ✅ Produk tersimpan dengan kategori baru

---

## 👥 Test Scenario 5: Employee Management

### Step 1: Login sebagai Admin
1. `admin` / `admin123`
2. Klik "Karyawan"

### Step 2: Add New Employee
1. Klik "Tambah Karyawan"
2. Form fields yang harus ada:
   - ✅ Nama Lengkap
   - ✅ Email
   - ✅ No. Telepon
   - ✅ Jabatan
   - ✅ **Username** ← NEW
   - ✅ **Password** ← NEW
   - ❌ ~~Gaji~~ ← REMOVED

### Step 3: Verify Table Columns
Table headers:
- ✅ Nama
- ✅ Email
- ✅ Telepon
- ✅ Jabatan
- ✅ Status
- ✅ Aksi
- ❌ ~~Gaji~~ ← REMOVED

### Step 4: Edit Employee
1. Klik Edit pada employee
2. ✅ Username field: "Biarkan kosong jika tidak ingin mengubah"
3. ✅ Password field: "Biarkan kosong jika tidak ingin mengubah"

---

## 🎨 Test Scenario 6: Visual Elements

### Logo Check
- ✅ Sidebar: Logo IBN Kantiin (10x10)
- ✅ Login page desktop: Logo (32x32)
- ✅ Login page mobile: Logo (16x16)
- ✅ Title: "IBN Kantiin POS"

### Navigation Highlight
- ✅ Active: Blue background + white text + shadow
- ✅ Hover: Smooth transition
- ✅ Clear visual difference

### Logout Button
- ✅ Normal: Standard button
- ✅ Hover: Red/pink tint
- ✅ Click: No blank white flash

### Role Badge
- ✅ Admin: "Administrator • 13:45"
- ✅ Manager: "Manager • 13:45"
- ✅ Kasir: "Kasir • 13:45"

---

## 🔄 Test Scenario 7: Role Switching

### Step 1: Login → Logout → Login
1. Login sebagai Manager
2. ✅ 6 menu items
3. Logout
4. Login sebagai Admin
5. ✅ 7 menu items muncul
6. ✅ Menu "Karyawan" kembali terlihat

### Step 2: localStorage Verification
Open DevTools Console:
```javascript
// Check stored role
localStorage.getItem("userRole") // Should match current login

// After logout
localStorage.getItem("userRole") // Should be null
```

---

## 📊 Test Scenario 8: Attendance System

### Step 1: Clock In
1. Buka: http://localhost:8081/employee-login
2. Input employee credentials
3. Klik "Clock In"
4. ✅ Success toast muncul
5. ✅ Status berubah "Currently clocked in"

### Step 2: Verify in Admin
1. Login sebagai admin
2. Klik "Karyawan" → Tab "Absensi"
3. ✅ Record baru muncul
4. ✅ Clock In time tercatat
5. ✅ Status: "In Progress"

### Step 3: Clock Out
1. Kembali ke /employee-login
2. Klik "Clock Out"
3. ✅ Success toast muncul
4. ✅ Total hours dihitung

---

## 🚀 Performance Checklist

### Load Times
- [ ] Login page: < 1s
- [ ] Dashboard: < 2s
- [ ] POS page: < 2s
- [ ] Smooth navigation transitions

### Responsiveness
- [ ] Mobile view (< 768px)
- [ ] Tablet view (768px - 1024px)
- [ ] Desktop view (> 1024px)

### Data Operations
- [ ] Product search: Instant
- [ ] Add to cart: Instant
- [ ] Save employee: < 1s
- [ ] Create category: < 1s

---

## ⚠️ Known Limitations

### Security
- ⚠️ localStorage-based auth (demo only)
- ⚠️ No password hashing
- ⚠️ No JWT tokens
- ⚠️ Role tidak verified dari backend

**Production Requirement:**
- Migrate to Supabase Auth
- Implement proper session management
- Add password hashing
- Database-level role verification

### Database
- ⚠️ Migration SQL belum dijalankan
- ⚠️ RLS policies belum dikonfigurasi
- ⚠️ No backup strategy

**Action Required:**
1. Run migration: `supabase/migrations/20251103_attendance_schema.sql`
2. Configure RLS policies
3. Setup automated backups

---

## ✅ Success Criteria

Aplikasi siap production jika:
- ✅ Semua 8 improvement berfungsi
- ✅ Role-based access working
- ✅ UI polish selesai
- ✅ No console errors
- ✅ Responsive di semua device
- ⏳ Database migration completed
- ⏳ Supabase Auth integrated
- ⏳ Production deployment

---

## 🐛 Troubleshooting

### Issue: Menu tidak ter-filter
**Solution:** Clear localStorage dan login ulang
```javascript
localStorage.clear()
location.reload()
```

### Issue: Logo tidak muncul
**Solution:** Verify file exists
```bash
ls -la /workspaces/IBN-Kantiin-POS/public/Images/logo.png
```

### Issue: Toast "Akses Ditolak" tidak muncul
**Solution:** Check ProtectedRoute implementation
```bash
# Verify allowedRoles prop di App.tsx
grep -n "allowedRoles" src/App.tsx
```

### Issue: Payment buttons masih 5
**Solution:** Hard refresh browser
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

---

## 📝 Test Report Template

```markdown
## Test Report - [Date]

### Tested By: [Your Name]
### Browser: [Chrome/Firefox/Safari]
### Screen Size: [Desktop/Mobile]

#### Test Results:
- [ ] Scenario 1: Admin Access ✅/❌
- [ ] Scenario 2: Manager Access ✅/❌
- [ ] Scenario 3: Payment Methods ✅/❌
- [ ] Scenario 4: Category Management ✅/❌
- [ ] Scenario 5: Employee Management ✅/❌
- [ ] Scenario 6: Visual Elements ✅/❌
- [ ] Scenario 7: Role Switching ✅/❌
- [ ] Scenario 8: Attendance System ✅/❌

#### Issues Found:
1. [Description]
2. [Description]

#### Notes:
[Additional comments]
```

---

**Last Updated:** November 3, 2025  
**Status:** Ready for Testing  
**Dev Server:** http://localhost:8081
