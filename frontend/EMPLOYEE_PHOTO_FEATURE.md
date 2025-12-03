# Fitur Foto Profil Karyawan - Setup Guide

## ✅ Fitur yang Ditambahkan

### 1. Upload Foto Profil
- Admin bisa upload foto saat **Tambah Karyawan Baru**
- Admin bisa upload/ganti foto saat **Edit Karyawan**
- Preview foto langsung terlihat sebelum disimpan
- Validasi ukuran file max 2MB
- Support format: JPG, PNG, dan image lainnya

### 2. Tampilan Foto di Tabel
- Kolom "Foto" ditambahkan di tabel daftar karyawan
- Avatar dengan foto profil atau icon default jika belum ada foto
- Foto berbentuk bulat (circle avatar)

### 3. Posisi Dropdown Fixed
- Form **Edit Employee** sekarang juga menggunakan dropdown untuk posisi
- Pilihan: Admin, Manager, Kasir

---

## 🚀 Cara Setup Database

### LANGKAH 1: Jalankan Migration

Buka Supabase Dashboard dan jalankan SQL berikut:

1. **Buka**: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/sql/new
2. **Copy** semua isi file `CREATE_ADMIN_ACCOUNT.sql` (sudah diupdate dengan setup foto)
3. **Paste** ke SQL Editor
4. **Klik Run**

SQL yang akan dijalankan:
```sql
-- Tambah kolom photo_url
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Setup Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('employees', 'employees', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies (untuk upload/read/update/delete foto)
```

### LANGKAH 2: Verifikasi Setup

Setelah migration berhasil, cek:
- ✅ Kolom `photo_url` sudah ada di tabel `employees`
- ✅ Storage bucket `employees` sudah dibuat
- ✅ Storage policies sudah aktif

---

## 📸 Cara Menggunakan Fitur Foto

### Upload Foto Saat Tambah Karyawan

1. Login sebagai **Admin**
2. Buka menu **Karyawan**
3. Klik **Tambah Karyawan**
4. Di bagian atas form, klik tombol **Upload Foto**
5. Pilih foto dari komputer (max 2MB)
6. Preview foto akan langsung muncul
7. Isi data karyawan lainnya
8. Klik **Simpan Karyawan**

### Upload/Ganti Foto Saat Edit Karyawan

1. Di tabel karyawan, klik icon **Pencil** (Edit) pada karyawan yang ingin diupdate
2. Di bagian atas form edit, akan muncul foto yang sudah ada (jika ada)
3. Klik tombol **Ganti Foto** untuk mengupload foto baru
4. Pilih foto baru
5. Klik **Update Karyawan**

### Lihat Foto di Tabel

- Semua foto karyawan akan ditampilkan di kolom pertama tabel
- Jika belum ada foto, akan muncul icon user default

---

## 🔧 Technical Details

### Storage Structure

**Bucket**: `employees` (public)
**Path**: `employee-photos/{random_id}_{timestamp}.{ext}`
**Example**: `employee-photos/x7k2p9_1730678234567.jpg`

### Database Schema

```sql
-- Kolom baru di tabel employees
photo_url TEXT -- URL publik ke foto di Supabase Storage
```

### Upload Flow

```typescript
1. User pilih file → Validasi ukuran (max 2MB)
2. Show preview dengan FileReader API
3. User klik Simpan
4. Upload foto ke Supabase Storage bucket 'employees'
5. Get public URL dari uploaded file
6. Simpan URL ke database kolom photo_url
7. Display foto di tabel menggunakan Avatar component
```

### Storage Policy

- **INSERT**: Public bisa upload
- **SELECT**: Public bisa read/view
- **UPDATE**: Public bisa update
- **DELETE**: Public bisa delete

*(Note: Untuk production, sebaiknya policy dibatasi hanya untuk authenticated users)*

---

## 📂 File yang Dimodifikasi

### 1. `/src/pages/Employees.tsx`
- ✅ Added imports: `useRef`, `supabase`, `Avatar`, `Upload`, `User` icons
- ✅ Added state: `photoFile`, `photoPreview`, `isUploading`, `fileInputRef`
- ✅ Added function: `handlePhotoChange()`, `uploadPhoto()`
- ✅ Updated `handleCreateEmployee()` - upload foto sebelum save
- ✅ Updated `handleUpdateEmployee()` - upload foto jika ada perubahan
- ✅ Updated `handleEditClick()` - load existing photo preview
- ✅ Added photo upload UI di form tambah karyawan
- ✅ Added photo upload UI di form edit karyawan
- ✅ Added photo column di tabel karyawan
- ✅ Fixed posisi dropdown di form edit

### 2. `/supabase/migrations/20251103_add_employee_photo.sql` (NEW)
- Migration untuk tambah kolom `photo_url`

### 3. `/supabase/migrations/20251103_setup_storage.sql` (NEW)
- Migration untuk setup storage bucket dan policies

### 4. `/CREATE_ADMIN_ACCOUNT.sql` (UPDATED)
- Ditambahkan setup kolom `photo_url`
- Ditambahkan setup storage bucket
- Ditambahkan storage policies

### 5. `/check-photo-column.mjs` (NEW)
- Script untuk cek apakah kolom photo_url sudah ada

---

## ⚠️ Important Notes

### File Size Limit
- Max 2MB per foto
- Validasi dilakukan di frontend sebelum upload
- Jika melebihi, akan muncul toast error

### Supported Formats
- JPG, JPEG, PNG, GIF, WebP
- Semua format yang diterima `accept="image/*"`

### Storage Quota
- Supabase free tier: 1GB storage
- Monitor usage di Supabase Dashboard > Storage

### Security (Production)
Untuk production, update storage policy:
```sql
-- Hanya authenticated users yang bisa upload
CREATE POLICY "Authenticated users can upload employee photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'employees');
```

---

## 🧪 Test Checklist

- [ ] Migration berhasil dijalankan
- [ ] Kolom `photo_url` ada di tabel `employees`
- [ ] Storage bucket `employees` sudah dibuat
- [ ] Bisa upload foto saat tambah karyawan baru
- [ ] Preview foto muncul setelah pilih file
- [ ] Foto tersimpan dan muncul di tabel setelah save
- [ ] Bisa edit karyawan dan ganti foto
- [ ] Foto lama tetap ada jika tidak diganti
- [ ] Validasi 2MB bekerja (coba upload file > 2MB)
- [ ] Avatar default muncul jika belum ada foto
- [ ] Dropdown posisi bekerja di form edit

---

## 🎯 Summary

Fitur foto profil karyawan sudah **fully implemented**:

✅ Upload foto saat tambah karyawan
✅ Upload/ganti foto saat edit karyawan  
✅ Preview foto sebelum save
✅ Validasi ukuran file 2MB
✅ Foto ditampilkan di tabel karyawan
✅ Avatar default jika belum ada foto
✅ Dropdown posisi di form edit fixed

**Yang perlu Anda lakukan:**
1. Jalankan migration di Supabase Dashboard (file: `CREATE_ADMIN_ACCOUNT.sql`)
2. Test upload foto pada karyawan
3. Verifikasi foto muncul di tabel

Fitur siap digunakan! 🎉
