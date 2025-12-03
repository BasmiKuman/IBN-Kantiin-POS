# ✅ Sistem Absensi Karyawan - Panduan Setup

## 📋 Status Implementasi

### ✅ Yang Sudah Selesai:

1. **Database Schema** (`supabase/migrations/20251103_attendance_schema.sql`)
   - Tabel `attendance` untuk menyimpan data absensi
   - Trigger otomatis untuk clock out sebelumnya
   - Trigger otomatis menghitung durasi kerja
   - Trigger otomatis menentukan status (terlambat jika clock in > 08:30)
   - View `attendance_summary` untuk ringkasan absensi per karyawan
   - Row Level Security policies

2. **Custom Hooks** (`src/hooks/supabase/useAttendance.ts`)
   - `useAttendance()` - Semua data absensi
   - `useEmployeeAttendance(employeeId)` - Absensi per karyawan
   - `useTodayAttendance()` - Absensi hari ini
   - `useAttendanceSummary()` - Ringkasan absensi
   - `useClockIn()` - Clock in/masuk
   - `useClockOut()` - Clock out/keluar
   - `useActiveAttendance(employeeId)` - Cek apakah sudah clock in
   - `useUpdateAttendanceNotes()` - Update catatan

3. **Halaman Employee Login** (`src/pages/EmployeeLogin.tsx`)
   - Pencarian karyawan via phone/email
   - Tampilan info karyawan dan waktu saat ini
   - Tombol "Absen Masuk" dengan validasi
   - Mencegah double clock in
   - Auto redirect ke dashboard setelah berhasil

4. **Tab Absensi di Halaman Karyawan** (`src/pages/Employees.tsx`)
   - Tab baru "Absensi" di halaman manajemen karyawan
   - Tabel absensi hari ini dengan clock in/out, durasi, status
   - Tabel ringkasan absensi per karyawan dengan statistik
   - Card statistik: Hadir Hari Ini dan Terlambat Hari Ini

5. **Routing** (`src/App.tsx`)
   - Route `/employee-login` untuk halaman login karyawan

6. **Database Types** (`src/integrations/supabase/types.ts`)
   - Type definitions untuk tabel attendance

---

## ⚠️ LANGKAH WAJIB: Jalankan Migrasi Database

**PENTING:** Sebelum menggunakan sistem absensi, Anda HARUS menjalankan migrasi SQL berikut:

### Opsi 1: Via Supabase Dashboard (RECOMMENDED)

1. Buka Supabase Dashboard:
   ```
   https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/sql/new
   ```

2. Copy seluruh isi file:
   ```
   supabase/migrations/20251103_attendance_schema.sql
   ```

3. Paste di SQL Editor

4. Klik tombol **"Run"** atau tekan `Ctrl+Enter`

5. Tunggu hingga muncul pesan sukses

### Opsi 2: Via Script (jika RPC tersedia)

```bash
node run-attendance-migration.mjs
```

**Catatan:** Jika muncul pesan "Eksekusi SQL via API tidak tersedia", gunakan Opsi 1.

---

## 🎯 Cara Menggunakan Sistem Absensi

### Untuk Karyawan:

1. **Absen Masuk:**
   - Buka `/employee-login`
   - Ketik nomor telepon atau email
   - Klik "Cari Karyawan"
   - Info karyawan dan waktu saat ini akan muncul
   - Klik "Absen Masuk"
   - Otomatis redirect ke dashboard

2. **Status Kehadiran:**
   - Jika clock in ≤ 08:30 → Status: **Hadir** (present)
   - Jika clock in > 08:30 → Status: **Terlambat** (late)

3. **Absen Keluar:**
   - Fitur clock out tersedia via hooks: `useClockOut(attendanceId)`
   - Bisa ditambahkan di halaman login atau interface terpisah

### Untuk Admin/Manager:

1. **Lihat Absensi Hari Ini:**
   - Buka menu **Karyawan**
   - Pilih tab **"Absensi"**
   - Lihat siapa saja yang sudah clock in, jam masuk, dan statusnya

2. **Lihat Ringkasan Absensi:**
   - Masih di tab **"Absensi"**
   - Scroll ke bawah ke tabel "Ringkasan Absensi"
   - Lihat total hari kerja, hadir tepat waktu, terlambat, dan persentase kehadiran

3. **Dashboard Overview:**
   - Di halaman **Karyawan**, ada card:
     - **Hadir Hari Ini** - jumlah karyawan yang hadir tepat waktu
     - **Terlambat Hari Ini** - jumlah karyawan yang terlambat

---

## 🔧 Fitur Otomatis

1. **Auto Clock Out Sebelumnya**
   - Jika karyawan lupa clock out kemarin, sistem otomatis akan clock out saat clock in hari ini

2. **Auto Calculate Duration**
   - Saat clock out, sistem otomatis menghitung durasi kerja dalam menit

3. **Auto Determine Status**
   - Sistem otomatis menentukan status berdasarkan waktu clock in:
     - Clock in ≤ 08:30 → Present
     - Clock in > 08:30 → Late

4. **Prevent Double Clock In**
   - Karyawan tidak bisa clock in 2x di hari yang sama
   - Button "Absen Masuk" disabled jika sudah clock in

---

## 📊 Struktur Database

### Tabel: `attendance`
```sql
- id (UUID, Primary Key)
- employee_id (UUID, Foreign Key → employees.id)
- clock_in (TIMESTAMPTZ, default NOW())
- clock_out (TIMESTAMPTZ, nullable)
- work_duration (INTEGER, dalam menit)
- status (TEXT: present, late, half_day, absent)
- notes (TEXT, nullable)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### View: `attendance_summary`
```sql
- employee_id
- employee_name
- position
- total_days (total hari kerja)
- present_days (hadir tepat waktu)
- late_days (terlambat)
- absent_days (tidak hadir)
- avg_work_hours (rata-rata jam kerja)
- last_attendance (absensi terakhir)
```

---

## 🚀 Testing

Setelah menjalankan migrasi, test dengan langkah berikut:

1. **Buat karyawan test** (jika belum ada):
   - Buka halaman **Karyawan**
   - Klik "Tambah Karyawan"
   - Isi data termasuk email/phone
   - Simpan

2. **Test Clock In**:
   - Buka `/employee-login`
   - Masukkan phone/email karyawan test
   - Klik "Cari Karyawan"
   - Klik "Absen Masuk"
   - Cek apakah muncul toast "Clock In Berhasil"

3. **Verify di Database**:
   - Buka Supabase Dashboard → Table Editor → attendance
   - Seharusnya ada record baru dengan clock_in terisi
   - Status otomatis terisi (present/late)

4. **Test Double Clock In Prevention**:
   - Buka lagi `/employee-login`
   - Cari karyawan yang sama
   - Button "Absen Masuk" seharusnya disabled
   - Ada peringatan "Sudah absen hari ini"

5. **Lihat di Tab Absensi**:
   - Buka menu **Karyawan** → tab **Absensi**
   - Seharusnya muncul data absensi hari ini
   - Card "Hadir Hari Ini" atau "Terlambat Hari Ini" bertambah

---

## 📝 Notes TypeScript

Saat ini ada beberapa warning TypeScript pada `useAttendance.ts` karena tabel `attendance` belum ada di database (migrasi belum dijalankan). 

**Warning ini akan hilang setelah migrasi dijalankan.**

Jika ingin menghilangkan warning sementara, tipe sudah ditambahkan dengan `as any` assertion yang aman dan akan berfungsi dengan baik setelah migrasi.

---

## 🎨 Customization Ideas

1. **Clock Out Button**:
   - Tambahkan tombol clock out di `/employee-login`
   - Atau buat halaman terpisah `/employee-logout`

2. **Notification**:
   - Kirim email/SMS saat karyawan terlambat
   - Daily summary absensi ke manager

3. **Advanced Features**:
   - Shift management
   - Overtime tracking
   - Leave requests
   - Geolocation verification

---

## 📞 Support

Jika ada masalah atau pertanyaan, cek:
1. Apakah migrasi sudah dijalankan?
2. Apakah ada error di console browser?
3. Apakah Supabase connection masih aktif?
4. Apakah karyawan memiliki email/phone yang valid?

---

## ✅ Checklist Sebelum Production

- [ ] Jalankan migrasi attendance schema
- [ ] Test clock in dengan beberapa karyawan
- [ ] Test clock in sebelum dan setelah jam 08:30
- [ ] Verify auto clock out berfungsi
- [ ] Test double clock in prevention
- [ ] Cek tab absensi menampilkan data dengan benar
- [ ] Cek ringkasan absensi akurat
- [ ] Set jam kerja sesuai kebutuhan (default 08:30)

---

**Sistem Absensi Siap Digunakan! 🎉**
