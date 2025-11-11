# Solusi Error Attendance (Absensi)

## Error yang Muncul
```
❌ Insert failed: null value in column "employee_username" of relation "attendance" violates not-null constraint
```

## Penyebab
Tabel `attendance` di database production memiliki kolom `employee_username` dengan constraint NOT NULL yang tidak ada di migration schema kita. Kolom ini sebenarnya tidak diperlukan karena kita sudah memiliki `employee_id` sebagai foreign key ke tabel `employees`.

## Solusi

### Langkah 1: Buka Supabase Dashboard
1. Buka https://supabase.com/dashboard
2. Login ke project: **hqrkqsddsmjsdmwmxcrm**
3. Pilih menu **SQL Editor** di sidebar kiri

### Langkah 2: Jalankan SQL Fix
Pilih salah satu opsi berikut:

#### Opsi 1: Hapus Kolom (Recommended) ✅
```sql
-- Hapus kolom employee_username karena tidak diperlukan
ALTER TABLE public.attendance 
DROP COLUMN IF EXISTS employee_username;

-- Verify
SELECT 'Fixed! Column removed.' as status;
```

#### Opsi 2: Buat Kolom Nullable
```sql
-- Atau buat kolom nullable jika ingin tetap mempertahankannya
ALTER TABLE public.attendance 
ALTER COLUMN employee_username DROP NOT NULL;

-- Verify
SELECT 'Fixed! Column is now nullable.' as status;
```

### Langkah 3: Tambahkan View (Jika Belum Ada)
```sql
-- Create attendance_summary view
DROP VIEW IF EXISTS attendance_summary;

CREATE OR REPLACE VIEW attendance_summary AS
SELECT 
  e.id as employee_id,
  e.name as employee_name,
  e.position,
  COUNT(a.id) as total_days,
  COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
  COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_days,
  COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
  ROUND(AVG(a.work_duration)::numeric, 2) as avg_work_hours,
  MAX(a.clock_in) as last_attendance
FROM public.employees e
LEFT JOIN public.attendance a ON e.id = a.employee_id
WHERE e.is_active = true
GROUP BY e.id, e.name, e.position;

-- Grant access
GRANT SELECT ON attendance_summary TO authenticated;
GRANT SELECT ON attendance_summary TO anon;

SELECT 'View created successfully!' as status;
```

### Langkah 4: Test
1. Refresh aplikasi
2. Klik **Login Karyawan (Absensi)** di halaman login
3. Masukkan username (contoh: `daryanto`)
4. Klik **Cari Karyawan**
5. Klik **Absen Masuk**
6. ✅ Seharusnya berhasil tanpa error!

## File SQL Lengkap
Semua SQL fix sudah tersedia di:
- `FIX_ATTENDANCE_COLUMN.sql` - Fix kolom employee_username
- `FIX_ATTENDANCE_VIEW.sql` - Create attendance_summary view

## Verifikasi
Setelah menjalankan SQL di atas, test dengan:
```bash
node test-attendance-insert.mjs
```

Harusnya muncul:
```
✅ Insert successful!
```

## Catatan
- Kolom `employee_username` tidak diperlukan karena kita sudah punya `employee_id` yang lebih reliable
- Username karyawan bisa didapat dari relasi `employees.username`
- View `attendance_summary` diperlukan untuk menampilkan statistik absensi di halaman Employees
