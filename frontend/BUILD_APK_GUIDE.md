# 📱 Build APK - Panduan Lengkap

## ✅ Setup Selesai!

Project BasmiKuman POS sudah siap untuk di-build menjadi **Android APK** menggunakan **Capacitor** dan **GitHub Actions**.

---

## 🚀 Cara Build APK

### Metode 1: Build Otomatis via GitHub Actions (RECOMMENDED)

**Cara Paling Mudah - Tinggal Push ke GitHub!**

1. **Push Code ke GitHub**
   ```bash
   git add .
   git commit -m "Ready for APK build"
   git push origin main
   ```

2. **GitHub Actions Akan Otomatis:**
   - ✅ Install dependencies
   - ✅ Build web app (Vite)
   - ✅ Setup Android SDK
   - ✅ Build APK
   - ✅ Upload APK sebagai artifact
   - ✅ Create GitHub Release dengan APK

3. **Download APK**
   - Buka repository di GitHub
   - Klik tab **Actions**
   - Klik workflow run terbaru
   - Scroll ke bawah ke bagian **Artifacts**
   - Download **basmikuman-pos-debug.apk**

4. **Atau Download dari Releases**
   - Buka tab **Releases**
   - Download APK dari release terbaru

---

### Metode 2: Build Manual di Local

**Jika ingin build di komputer sendiri:**

#### Prerequisites:
- Node.js 18+
- Java JDK 17
- Android SDK
- Android Studio (optional, untuk testing)

#### Langkah-langkah:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build Web App**
   ```bash
   npm run build
   ```

3. **Sync ke Android**
   ```bash
   npx cap sync android
   ```

4. **Build APK**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

5. **APK Location**
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

#### Atau Gunakan Script Shortcut:
```bash
npm run build:apk
```

---

## 📦 APK Details

### Debug APK
- **Nama File**: `app-debug.apk`
- **App ID**: `com.basmikuman.pos`
- **App Name**: BasmiKuman POS
- **Signing**: Debug keystore (auto-generated)
- **Size**: ~15-25 MB (tergantung assets)

### Release APK (Production)
Untuk build release APK yang siap di-publish ke Play Store:

1. **Generate Keystore**
   ```bash
   keytool -genkey -v -keystore basmikuman-pos.keystore -alias basmikuman -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Update `capacitor.config.ts`**
   ```typescript
   android: {
     buildOptions: {
       keystorePath: './basmikuman-pos.keystore',
       keystorePassword: 'your-password',
       keystoreAlias: 'basmikuman',
       keystoreAliasPassword: 'your-alias-password',
       releaseType: 'APK'
     }
   }
   ```

3. **Build Release**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

---

## 🔧 NPM Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Run development server |
| `npm run build` | Build web app untuk production |
| `npm run cap:sync` | Build & sync ke Capacitor |
| `npm run cap:android` | Open Android Studio |
| `npm run build:apk` | Build APK debug |

---

## 📱 Testing APK

### Di Android Emulator:
```bash
npx cap run android
```

### Di Device Fisik:
1. Enable **Developer Options** di Android
2. Enable **USB Debugging**
3. Connect device via USB
4. Run:
   ```bash
   npx cap run android --target
   ```

### Install Manual:
1. Copy APK ke device
2. Buka file APK di device
3. Allow "Install from Unknown Sources"
4. Install

---

## 🎯 GitHub Actions Workflow

File: `.github/workflows/build-apk.yml`

### Trigger Events:
- ✅ Push ke branch `main`
- ✅ Pull Request ke `main`
- ✅ Manual trigger (workflow_dispatch)

### Output:
- **Artifact**: `basmikuman-pos-debug.apk`
- **Release**: Auto-create release dengan APK attached

### Status Badge:
Tambahkan di README.md:
```markdown
![Build APK](https://github.com/BasmiKuman/IBN-Kantiin-POS/workflows/Build%20Android%20APK/badge.svg)
```

---

## 📋 Checklist Build Production

Sebelum build untuk production:

- [ ] Update version di `package.json`
- [ ] Update `versionCode` dan `versionName` di `android/app/build.gradle`
- [ ] Test semua fitur di emulator
- [ ] Generate release keystore
- [ ] Update app icons di `android/app/src/main/res/`
- [ ] Update splash screen
- [ ] Test APK di berbagai device
- [ ] Compress gambar/assets untuk ukuran lebih kecil

---

## 🔐 App Permissions

App ini memerlukan permissions berikut (sudah auto-configured):

- **INTERNET** - Untuk koneksi ke Supabase
- **WRITE_EXTERNAL_STORAGE** - Untuk export laporan
- **READ_EXTERNAL_STORAGE** - Untuk upload foto
- **CAMERA** - Untuk foto profil karyawan (optional)

Permissions sudah diatur di: `android/app/src/main/AndroidManifest.xml`

---

## 📱 App Icon & Splash Screen

### Update App Icon:
1. Generate icons di https://icon.kitchen/
2. Download Android adaptive icons
3. Replace di `android/app/src/main/res/`

### Update Splash Screen:
1. Buat splash screen image (2732x2732px)
2. Place di `android/app/src/main/res/drawable/`
3. Update di `android/app/src/main/res/values/styles.xml`

---

## 🐛 Troubleshooting

### Error: "gradlew not found"
```bash
chmod +x android/gradlew
```

### Error: "SDK not found"
Install Android SDK via Android Studio atau:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Error: "Java version"
Install Java JDK 17:
```bash
# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# Mac
brew install openjdk@17
```

### APK Size Too Large
1. Enable ProGuard untuk minify code
2. Compress images
3. Remove unused dependencies
4. Use WebP images instead of PNG

---

## 📊 Build Optimization

### Reduce APK Size:
1. **Enable ProGuard**
   Edit `android/app/build.gradle`:
   ```gradle
   buildTypes {
     release {
       minifyEnabled true
       proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
     }
   }
   ```

2. **Enable APK Splitting**
   ```gradle
   splits {
     abi {
       enable true
       reset()
       include 'arm64-v8a', 'armeabi-v7a'
     }
   }
   ```

3. **Compress Assets**
   - Use WebP for images
   - Minify CSS/JS (Vite already does this)
   - Remove unused fonts

---

## 🎉 Summary

**Setup Lengkap untuk Build APK:**

✅ Capacitor installed
✅ Android platform added
✅ GitHub Actions workflow configured
✅ Build scripts ready
✅ Mobile-optimized HTML
✅ Gitignore updated

**Cara Tercepat:**
1. Push ke GitHub
2. Wait for GitHub Actions
3. Download APK dari Releases

**File APK ada di:**
- GitHub Actions Artifacts
- GitHub Releases
- Local: `android/app/build/outputs/apk/debug/`

Selamat! 🎊 Project BasmiKuman POS siap di-build jadi APK!
