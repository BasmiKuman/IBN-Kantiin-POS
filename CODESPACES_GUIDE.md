# 🚀 GitHub Codespaces Guide

Panduan lengkap untuk menggunakan GitHub Codespaces dengan IBN Kantiin POS.

## 📋 Prasyarat

- Akun GitHub dengan akses Codespaces
- GitHub Copilot Pro (opsional, tapi sangat membantu)

## 🎯 Cara Membuka Codespaces

### Metode 1: Dari Halaman Repository

1. Buka repository di GitHub: https://github.com/BasmiKuman/IBN-Kantiin-POS
2. Klik tombol hijau **"Code"**
3. Pilih tab **"Codespaces"**
4. Klik **"Create codespace on main"** (atau branch yang ingin Anda gunakan)

### Metode 2: Dari Pull Request

1. Buka Pull Request yang ingin Anda kerjakan
2. Klik tombol **"Code"**
3. Pilih **"Create codespace on [branch-name]"**

### Metode 3: Menggunakan Badge (Quick Start)

Klik badge ini untuk langsung membuat Codespace:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/BasmiKuman/IBN-Kantiin-POS)

## ⚙️ Konfigurasi Otomatis

Saat Codespace dibuat, sistem akan otomatis:

✅ Install Node.js 20  
✅ Install semua dependencies (`npm install`)  
✅ Setup VS Code extensions (ESLint, Prettier, Tailwind, dll)  
✅ Configure port forwarding (8080, 5173)  
✅ Setup GitHub CLI  
✅ Enable GitHub Copilot (jika tersedia)

Proses ini memakan waktu 2-5 menit pertama kali.

## 🛠 Setup Environment Variables

Setelah Codespace terbuka, Anda perlu setup environment variables:

1. Copy file `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Edit file `.env` dengan credentials Supabase Anda:
   ```bash
   code .env
   ```

3. Isi dengan nilai yang benar:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

## 🚀 Menjalankan Aplikasi

### Development Server

```bash
# Start development server
npm run dev
```

Server akan berjalan di port 8080. Codespaces akan otomatis mem-forward port dan memberikan URL publik.

### Build Production

```bash
# Build production
npm run build:prod

# Preview production build
npm run preview
```

## 🔧 VS Code Extensions yang Terinstall

Codespaces sudah include extensions berikut:

- **ESLint** - Linting JavaScript/TypeScript
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **TypeScript** - TypeScript support
- **Auto Rename Tag** - HTML/JSX tag renaming
- **Path Intellisense** - Path autocomplete
- **GitHub Copilot** - AI pair programming
- **GitHub Copilot Chat** - AI chat assistant

## 📊 Port Forwarding

Codespaces otomatis mem-forward ports berikut:

| Port | Service | URL |
|------|---------|-----|
| 8080 | Development Server | Otomatis di-forward |
| 5173 | Vite Dev Server | Otomatis di-forward |

Untuk melihat forwarded ports:
1. Klik tab **"PORTS"** di VS Code (panel bawah)
2. Atau tekan `Ctrl+Shift+P` → "Ports: Focus on Ports View"

## 🐛 Troubleshooting

### Codespace tidak bisa dibuat

**Solusi:**
- Pastikan Anda memiliki kuota Codespaces yang cukup
- Cek [GitHub Codespaces usage](https://github.com/settings/billing)
- GitHub Free: 120 core hours/bulan
- GitHub Pro: 180 core hours/bulan

### Dependencies gagal install

**Solusi:**
```bash
# Hapus node_modules dan install ulang
rm -rf node_modules package-lock.json
npm install
```

### Port tidak ter-forward

**Solusi:**
1. Buka tab "PORTS"
2. Klik kanan pada port yang tidak berfungsi
3. Pilih "Forward Port"
4. Atau tambahkan secara manual dengan "Add Port"

### Environment variables tidak terbaca

**Solusi:**
1. Pastikan file `.env` ada di root directory
2. Restart development server:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### Copilot tidak aktif

**Solusi:**
1. Cek status Copilot: Klik icon Copilot di status bar (kanan bawah)
2. Login GitHub: `Ctrl+Shift+P` → "GitHub: Sign in"
3. Enable Copilot: `Ctrl+Shift+P` → "GitHub Copilot: Enable"

## 💡 Tips Produktivitas

### 1. Gunakan Copilot Chat
Tekan `Ctrl+Shift+I` untuk membuka Copilot Chat dan tanyakan apa saja tentang codebase.

### 2. Terminal Multiple
Buka beberapa terminal sekaligus:
- Development server: `npm run dev`
- Testing: Terminal terpisah untuk testing
- Git operations: Terminal terpisah untuk git

### 3. Keyboard Shortcuts
- `Ctrl+P` - Quick file open
- `Ctrl+Shift+P` - Command palette
- `Ctrl+B` - Toggle sidebar
- `Ctrl+J` - Toggle terminal
- `Ctrl+Shift+F` - Search in files

### 4. Git Integration
- View changes: `Ctrl+Shift+G`
- Commit: Stage changes → Write message → `Ctrl+Enter`
- Push: Klik "Sync Changes" atau gunakan command palette

## 📱 Mobile Development (Android)

Untuk build APK di Codespaces, Anda memerlukan Android SDK. Namun ini **tidak recommended** di Codespaces karena memerlukan resource besar.

**Recommended:** Gunakan GitHub Actions untuk build APK
- Push ke branch `main`
- GitHub Actions otomatis build APK
- Download dari Actions → Artifacts

Atau lihat: [BUILD_APK_GUIDE.md](./BUILD_APK_GUIDE.md)

## 🔒 Security Best Practices

### Jangan commit secrets!

1. Selalu gunakan `.env` untuk credentials
2. `.env` sudah ada di `.gitignore`
3. Untuk production, gunakan GitHub Secrets atau environment variables dari hosting platform

### Environment Variables di Codespaces

Untuk set environment variables yang persistent:

1. Go to: https://github.com/settings/codespaces
2. Klik "New secret"
3. Nama: `VITE_SUPABASE_URL`, Value: your_url
4. Pilih repository access
5. Repeat untuk `VITE_SUPABASE_PUBLISHABLE_KEY`

## 📚 Resources

- [GitHub Codespaces Docs](https://docs.github.com/en/codespaces)
- [VS Code in Codespaces](https://code.visualstudio.com/docs/remote/codespaces)
- [Project README](./README.md)
- [Supabase Setup Guide](./SUPABASE_SETUP.md)

## 🆘 Butuh Bantuan?

- Baca [Troubleshooting](#troubleshooting) di atas
- Check [Project Issues](https://github.com/BasmiKuman/IBN-Kantiin-POS/issues)
- Review [Project Documentation](./README.md)

---

**Selamat coding! 🎉**
