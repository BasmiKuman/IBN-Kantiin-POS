# Solusi Error Attendance (Absensi)

## Error yang Muncul
```
❌ Insert failed: null value in column "employee_username" violates not-null constraint
❌ SQL Error: column a.status does not exist
```

## Penyebab
1. Tabel `attendance` di database production memiliki struktur yang berbeda dari migration schema
2. Struktur aktual: `id, employee_id, employee_username, employee_name, clock_in, clock_out, date, created_at, updated_at`
3. Kolom `employee_username` dan `employee_name` memiliki constraint NOT NULL
4. View `attendance_summary` menggunakan kolom yang tidak ada (`status`, `work_duration`, `notes`)

## Solusi

### Langkah 1: Buka Supabase Dashboard
1. Buka https://supabase.com/dashboard
2. Login ke project: **hqrkqsddsmjsdmwmxcrm**
3. Pilih menu **SQL Editor** di sidebar kiri

### Langkah 2: Jalankan SQL Fix untuk Kolom

Copy dan run SQL ini:

```sql
-- Make employee_username and employee_name nullable
ALTER TABLE public.attendance 
ALTER COLUMN employee_username DROP NOT NULL;

ALTER TABLE public.attendance 
ALTER COLUMN employee_name DROP NOT NULL;

SELECT 'Fixed! Columns are now nullable.' as status;
```

### Langkah 3: Buat View attendance_summary

Copy dan run SQL ini:

```sql
-- Drop view if exists
DROP VIEW IF EXISTS attendance_summary;

-- Create view with correct column structure
CREATE OR REPLACE VIEW attendance_summary AS
SELECT 
  e.id as employee_id,
  e.name as employee_name,
  e.position,
  COUNT(a.id) as total_days,
  COUNT(CASE WHEN a.clock_in IS NOT NULL THEN 1 END) as present_days,
  COUNT(CASE WHEN EXTRACT(HOUR FROM a.clock_in AT TIME ZONE 'Asia/Jakarta') > 8 
    OR (EXTRACT(HOUR FROM a.clock_in AT TIME ZONE 'Asia/Jakarta') = 8 
        AND EXTRACT(MINUTE FROM a.clock_in AT TIME ZONE 'Asia/Jakarta') > 30) 
    THEN 1 END) as late_days,
  0 as absent_days,
  ROUND(AVG(
    CASE 
      WHEN a.clock_out IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (a.clock_out - a.clock_in))/3600 
      ELSE 0 
    END
  )::numeric, 2) as avg_work_hours,
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
- `FIX_ATTENDANCE_COLUMN.sql` - Fix kolom employee_username dan employee_name
- `FIX_ATTENDANCE_VIEW.sql` - Create attendance_summary view dengan struktur yang benar

## Struktur Tabel Production
Tabel `attendance` di production memiliki struktur:
- `id` - UUID primary key
- `employee_id` - UUID foreign key ke employees
- `employee_username` - Text (perlu dibuat nullable)
- `employee_name` - Text (perlu dibuat nullable)
- `clock_in` - Timestamp
- `clock_out` - Timestamp (nullable)
- `date` - Date
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Catatan**: Tidak ada kolom `status`, `work_duration`, atau `notes` seperti di migration schema.

## Verifikasi
Setelah menjalankan SQL di atas, test dengan:
```bash
node test-attendance-insert.mjs
```

Harusnya muncul:
```
✅ Insert successful!
```
