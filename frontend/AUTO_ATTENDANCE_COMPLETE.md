# Panduan Implementasi Auto-Attendance & Employee Login

## ✅ Apa yang Sudah Selesai

### 1. Auto-Attendance on Login (Kasir)
- Ketika kasir login, sistem otomatis mencatat:
  - `employee_id`: ID karyawan
  - `check_in`: Waktu login
  - `status`: 'present'

### 2. Auto-Attendance on Logout (Kasir)
- Ketika kasir logout, sistem otomatis mengupdate:
  - `check_out`: Waktu logout pada record attendance hari ini

### 3. Employee Login dengan Username & Password
- Admin bisa membuat karyawan dengan:
  - Nama lengkap
  - Username (unik)
  - Password
  - Posisi (dropdown: admin/manager/kasir)
  - Email, phone, hire_date

### 4. Role-Based Menu Filtering
- **Admin**: Bisa akses semua menu
- **Manager**: Bisa akses semua menu
- **Kasir**: Hanya bisa akses:
  - Dashboard
  - POS Kasir
  - Laporan
  - Pelanggan

---

## 🚀 Langkah Setup

### LANGKAH 1: Jalankan Migration Database

**Penting:** Migration harus dijalankan untuk menambahkan kolom `username` dan `password` ke tabel `employees`.

#### Cara 1: Via Supabase Dashboard (Recommended)
1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Buka file `RUN_THIS_MIGRATION.sql` di folder root project
6. Copy semua isi file tersebut
7. Paste ke SQL Editor
8. Klik **Run** untuk menjalankan
9. Verifikasi kolom sudah ditambahkan (akan muncul hasil query)

#### Cara 2: Via Migration File (Jika punya Supabase CLI)
```bash
supabase migration up
```

---

### LANGKAH 2: Buat Employee dengan Login Credentials

1. Login sebagai **Admin**
2. Buka menu **Karyawan**
3. Klik **Tambah Karyawan**
4. Isi form:
   - **Nama Lengkap**: Nama karyawan (wajib)
   - **Username**: Username untuk login (wajib, harus unik)
   - **Password**: Password untuk login (wajib)
   - **Posisi**: Pilih dari dropdown (admin/manager/kasir) (wajib)
   - Email, Phone, Tanggal Mulai (opsional)
5. Klik **Simpan Karyawan**

**Contoh:**
- Nama: Andi Kasir
- Username: andi
- Password: 123456
- Posisi: kasir

---

### LANGKAH 3: Test Login sebagai Kasir

1. **Logout** dari akun admin
2. Di halaman login, masukkan:
   - Username: `andi`
   - Password: `123456`
3. Klik **Masuk**

**Yang Akan Terjadi:**
- ✅ Login berhasil
- ✅ **Auto-attendance**: Record attendance otomatis dibuat dengan:
  - `employee_id`: ID andi
  - `check_in`: Waktu saat ini
  - `status`: 'present'
- ✅ **Menu filtering**: Hanya muncul menu:
  - Dashboard
  - POS Kasir
  - Laporan
  - Pelanggan

---

### LANGKAH 4: Test Logout Auto-Attendance

1. Setelah login sebagai kasir
2. Klik tombol **Logout**

**Yang Akan Terjadi:**
- ✅ Sistem mencari record attendance hari ini yang belum punya `check_out`
- ✅ Update `check_out` dengan waktu saat ini
- ✅ Kembali ke halaman login

---

### LANGKAH 5: Verifikasi Attendance Record

1. Login kembali sebagai **Admin**
2. Buka menu **Absensi**
3. Lihat record attendance untuk karyawan kasir
4. Harus ada record dengan:
   - Employee: Andi Kasir
   - Check In: Waktu login tadi
   - Check Out: Waktu logout tadi
   - Status: present

---

## 📝 Technical Details

### Database Schema

#### Tabel `employees`
```sql
- id (UUID, primary key)
- name (TEXT)
- username (TEXT, UNIQUE) -- BARU
- password (TEXT) -- BARU
- position (TEXT) -- admin, manager, kasir
- email (TEXT)
- phone (TEXT)
- hire_date (DATE)
- is_active (BOOLEAN)
```

#### Tabel `attendance`
```sql
- id (UUID, primary key)
- employee_id (UUID, foreign key -> employees.id)
- check_in (TIMESTAMP)
- check_out (TIMESTAMP, nullable)
- status (TEXT) -- present, absent, late
- notes (TEXT)
```

### Login Flow

```typescript
// src/pages/Login.tsx
const handleLogin = async (e) => {
  // 1. Query employees table
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .eq('is_active', true)
    .single();

  // 2. Save session
  localStorage.setItem('username', employee.name);
  localStorage.setItem('userRole', employee.position);
  localStorage.setItem('employeeId', employee.id);
  localStorage.setItem('loginTime', new Date().toISOString());

  // 3. Auto-attendance for kasir
  if (employee.position === 'kasir') {
    await supabase.from('attendance').insert({
      employee_id: employee.id,
      check_in: new Date().toISOString(),
      status: 'present'
    });
  }

  // 4. Navigate to dashboard
  navigate('/dashboard');
};
```

### Logout Flow

```typescript
// src/components/AppSidebar.tsx
const handleLogout = async () => {
  const employeeId = localStorage.getItem('employeeId');
  
  if (employeeId) {
    // 1. Find today's attendance without check_out
    const { data: attendances } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('check_in', today.toISOString())
      .is('check_out', null);

    // 2. Update check_out
    if (attendances && attendances.length > 0) {
      await supabase
        .from('attendance')
        .update({ check_out: new Date().toISOString() })
        .eq('id', attendances[0].id);
    }
  }

  // 3. Clear session
  localStorage.clear();
  navigate('/login');
};
```

### Menu Filtering

```typescript
// src/components/AppSidebar.tsx
const menuItems = [
  { title: "Dashboard", icon: Home, url: "/dashboard", roles: ["admin", "manager", "kasir"] },
  { title: "POS Kasir", icon: ShoppingCart, url: "/pos", roles: ["admin", "manager", "kasir"] },
  { title: "Laporan", icon: BarChart, url: "/reports", roles: ["admin", "manager", "kasir"] },
  { title: "Pelanggan", icon: Users, url: "/customers", roles: ["admin", "manager", "kasir"] },
  { title: "Inventori", icon: Package, url: "/inventory", roles: ["admin", "manager"] },
  { title: "Karyawan", icon: Users, url: "/employees", roles: ["admin", "manager"] },
  { title: "Pengaturan", icon: Settings, url: "/settings", roles: ["admin"] },
];

const filteredMenuItems = menuItems.filter((item) => 
  item.roles.includes(userRole)
);
```

---

## ⚠️ Important Notes

### Security Considerations (Production)
Saat ini password disimpan dalam **plain text** di database untuk kemudahan development. Untuk production, **WAJIB** menggunakan hashing:

```typescript
// Install bcrypt
npm install bcrypt

// Hash password saat create employee
import bcrypt from 'bcrypt';
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password saat login
const isValid = await bcrypt.compare(inputPassword, employee.password);
```

### Attendance Edge Cases
- Jika kasir login berkali-kali dalam sehari → akan ada multiple record (by design)
- Jika kasir tidak logout (force close browser) → check_out akan null
- Admin bisa manual edit attendance record via SQL Editor jika diperlukan

### Role Management
- Role disimpan di field `position` sebagai TEXT
- Valid roles: 'admin', 'manager', 'kasir'
- Role dicheck case-sensitive, pastikan lowercase

---

## 🧪 Test Checklist

- [ ] Migration berhasil dijalankan
- [ ] Kolom `username` dan `password` ada di tabel `employees`
- [ ] Bisa create employee dengan username/password via form
- [ ] Dropdown position menampilkan: admin, manager, kasir
- [ ] Login dengan username/password berhasil
- [ ] Auto-attendance record dibuat saat kasir login
- [ ] Menu kasir hanya menampilkan: Dashboard, POS, Laporan, Pelanggan
- [ ] Logout berhasil update `check_out` di attendance
- [ ] Record attendance lengkap (check_in & check_out) terlihat di tabel

---

## 📂 Modified Files

1. **src/pages/Login.tsx**
   - Login via Supabase query employees table
   - Auto-attendance insert on kasir login

2. **src/components/AppSidebar.tsx**
   - Role-based menu filtering
   - Auto-attendance update on logout

3. **src/pages/Employees.tsx**
   - Form dengan username/password fields
   - Position dropdown (admin/manager/kasir)

4. **supabase/migrations/20251103_add_employee_credentials.sql**
   - Add username & password columns
   - Create index on username

5. **RUN_THIS_MIGRATION.sql** (NEW)
   - Panduan migration untuk Supabase Dashboard

---

## 🎯 Summary

Sistem auto-attendance dan employee login sudah **fully implemented**:

✅ Kasir login → auto check-in attendance
✅ Kasir logout → auto check-out attendance  
✅ Employee creation with username/password
✅ Position dropdown (admin/manager/kasir)
✅ Menu filtering based on role

**Yang perlu Anda lakukan:**
1. Jalankan migration di Supabase Dashboard (file: `RUN_THIS_MIGRATION.sql`)
2. Test create employee dengan username/password
3. Test login sebagai kasir
4. Verifikasi attendance record dibuat otomatis

Semua sudah siap! 🚀
