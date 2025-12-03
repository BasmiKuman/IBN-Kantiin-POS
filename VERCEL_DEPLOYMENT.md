# Panduan Deploy ke Vercel

## Langkah-Langkah Deployment

### 1. Persiapan
File-file yang sudah disiapkan:
- `.env` - Environment variables untuk development
- `vercel.json` - Konfigurasi Vercel

### 2. Deploy ke Vercel

#### Opsi A: Deploy via Vercel Dashboard
1. Login ke [Vercel](https://vercel.com)
2. Klik "Add New Project"
3. Import repository GitHub Anda
4. Pilih folder `frontend` sebagai root directory
5. Framework Preset akan terdeteksi otomatis sebagai "Vite"
6. Tambahkan Environment Variables:
   - `VITE_SUPABASE_URL` = `https://hqrkqsddsmjsdmwmxcrm.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxcmtxc2Rkc21qc2Rtd214Y3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMzY3NTksImV4cCI6MjA3NzcxMjc1OX0.Oa_rw84APi1HdqJxZ7xezNs0iP-yEfW4RUvos4zF0yQ`
7. Klik "Deploy"

#### Opsi B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel
```

### 3. Setting Root Directory di Vercel
Jika deploy dari root repository:
1. Di Project Settings → General
2. Set "Root Directory" ke `frontend`
3. Framework akan terdeteksi otomatis sebagai "Vite"

### 4. Perubahan yang Sudah Dilakukan

#### ✅ File `.env` dibuat
Berisi konfigurasi Supabase URL dan Anon Key

#### ✅ File `vercel.json` dibuat
Konfigurasi build command, output directory, dan environment variables

#### ✅ Theme Provider ditambahkan
- File `src/components/theme-provider.tsx` dibuat
- Integrated ke `App.tsx`
- Settings page diupdate untuk menggunakan theme provider
- Dark mode sekarang berfungsi dengan benar dan tersimpan di localStorage

#### ✅ Package.json sudah benar
Build command: `tsc && vite build`
Output directory: `dist`

## Troubleshooting

### Error: "vite: command not found"
**Solusi:** File `vercel.json` sudah mengatur `installCommand` dan `buildCommand` dengan benar. Vercel akan menjalankan `npm install` terlebih dahulu sebelum build.

### Dark Mode tidak berfungsi
**Solusi:** Theme Provider sudah diintegrasikan. Dark mode sekarang:
- Tersimpan di localStorage dengan key `bk-pos-theme`
- Toggle di Settings akan langsung mengubah tema
- Perubahan tema akan langsung terlihat di seluruh aplikasi

### Environment Variables tidak terbaca
**Solusi:** 
- Pastikan prefix `VITE_` ada di semua environment variables
- Set environment variables di Vercel Dashboard → Project Settings → Environment Variables
- Redeploy setelah menambahkan environment variables

## Verifikasi Setelah Deploy

1. ✅ Aplikasi dapat diakses
2. ✅ Login berfungsi (koneksi ke Supabase)
3. ✅ Dark mode berfungsi dan tersimpan
4. ✅ Data dapat dimuat dari Supabase

## Catatan Penting

- **Jangan commit file `.env` ke Git** - Gunakan `.env.example` sebagai template
- **Environment variables di Vercel** harus diset manual di dashboard
- **Root directory** harus diset ke `frontend` jika deploy dari root repository
- **Dark mode** sekarang menggunakan next-themes compatible provider
