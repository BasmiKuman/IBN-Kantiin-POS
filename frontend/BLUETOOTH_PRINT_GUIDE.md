# 🖨️ Panduan Print Struk via Bluetooth

## Fitur Print Bluetooth Printer

Aplikasi POS sekarang mendukung print struk langsung ke printer thermal Bluetooth menggunakan Web Bluetooth API.

## ✨ Fitur

### 1. **Struk Dapur (Kitchen Receipt)**
- Format sederhana untuk kitchen/bar
- Hanya menampilkan item dan jumlah
- Tanpa harga (fokus ke produksi)
- Ideal untuk order tracking

### 2. **Struk Kasir (Cashier Receipt)**
- Format lengkap untuk customer
- Menampilkan harga, subtotal, pajak, total
- Metode pembayaran
- Nomor order dan timestamp

### 3. **Test Print**
- Test koneksi printer
- Verifikasi output format

---

## 📱 Browser Support

Web Bluetooth API didukung di:
- ✅ **Chrome** (Android, Windows, macOS, Linux)
- ✅ **Edge** (Windows, Android)
- ✅ **Samsung Internet** (Android)
- ❌ **Safari** (tidak didukung)
- ❌ **Firefox** (tidak didukung)

**Rekomendasi**: Gunakan Chrome atau Edge di Android/Windows untuk hasil terbaik.

---

## 🔌 Cara Pairing Printer

### Step 1: Aktifkan Bluetooth di Printer
1. Nyalakan printer thermal Bluetooth
2. Pastikan mode pairing aktif (biasanya lampu LED berkedip)
3. Catat nama printer (contoh: "RPP02N", "MTP-2", dll)

### Step 2: Pairing via OS (Opsional)
Untuk Android/Windows:
1. Buka **Settings** → **Bluetooth**
2. Scan dan pair dengan printer
3. Masukkan PIN jika diminta (default: 0000 atau 1234)

> **Note**: Beberapa printer bisa langsung connect via web tanpa pairing OS terlebih dahulu.

---

## 🖨️ Cara Menggunakan Print

### Di Aplikasi POS:

1. **Selesaikan Transaksi**
   - Tambahkan produk ke cart
   - Klik **Bayar** dan pilih metode pembayaran
   - Transaksi sukses → muncul dialog struk

2. **Klik "Print Bluetooth"**
   - Dialog print akan terbuka
   - Status printer ditampilkan (Terhubung/Tidak Terhubung)

3. **Hubungkan Printer**
   - Klik tombol **"Hubungkan Printer"**
   - Browser akan menampilkan popup daftar device Bluetooth
   - Pilih printer thermal Anda
   - Tunggu hingga status berubah jadi **"Terhubung"**

4. **Test Print (Opsional)**
   - Klik **"Test Print"** untuk cek koneksi
   - Printer akan cetak struk test sederhana

5. **Cetak Struk**
   - **Cetak Struk Dapur** → Format untuk kitchen
   - **Cetak Struk Kasir** → Format untuk customer
   - Tunggu hingga print selesai

---

## 🛠️ Troubleshooting

### Printer Tidak Muncul di List
**Penyebab**:
- Printer belum di-pair via OS
- Printer tidak dalam mode pairing
- Bluetooth device atau OS tidak aktif

**Solusi**:
1. Pastikan printer dalam mode pairing (LED berkedip)
2. Restart printer
3. Pair manual via Settings → Bluetooth
4. Refresh halaman browser dan coba lagi

---

### Printer Terhubung Tapi Tidak Print
**Penyebab**:
- Service UUID tidak cocok
- Printer tidak support ESC/POS command
- Buffer printer penuh

**Solusi**:
1. Klik **"Test Print"** untuk verifikasi koneksi
2. Restart printer
3. Putuskan dan hubungkan ulang
4. Cek apakah printer support ESC/POS protocol

---

### Print Tidak Keluar atau Acak
**Penyebab**:
- Encoding tidak cocok
- Printer tidak support beberapa command ESC/POS

**Solusi**:
1. Cek manual printer (biasanya support ESC/POS)
2. Update firmware printer jika ada
3. Gunakan printer yang support ESC/POS standard

---

### Browser Tidak Support Web Bluetooth
**Error**: "Web Bluetooth API tidak didukung di browser ini"

**Solusi**:
1. Gunakan Chrome atau Edge
2. Pastikan browser versi terbaru
3. Di Android, aktifkan Location permission untuk app browser

---

## 🔧 Printer yang Kompatibel

### Printer Thermal 58mm/80mm yang Direkomendasikan:
- **Zjiang** (5802, 5805, ZJ-5890K)
- **RPP** (RPP02N, RPP300)
- **Goojprt** (PT-210, MTP-II, MTP-3)
- **Eppos** (EPP200, EPP300)
- **Xprinter** (XP-58IIH, XP-80IIH)

### Syarat Printer:
- ✅ Support Bluetooth (Bluetooth 2.0 atau lebih tinggi)
- ✅ Support ESC/POS command standard
- ✅ Thermal printer (58mm atau 80mm)

---

## 📝 Format Struk

### Struk Dapur:
```
*** DAPUR ***

Order #: INV-2025-0001
Waktu: 14:30:25
Pelanggan: John Doe
--------------------------------
PESANAN:

2x Nasi Goreng
   (Pedas)

1x Es Teh Manis

--------------------------------
Total Item: 3
```

### Struk Kasir:
```
IBN KANTIIN

No. Order: INV-2025-0001
Tanggal: 12/11/2025
Waktu: 14:30:25
Kasir: Admin
Pelanggan: John Doe
================================
Nasi Goreng (Pedas)
  2 x Rp 25,000       Rp 50,000

Es Teh Manis
  1 x Rp 5,000         Rp 5,000

--------------------------------
Subtotal:            Rp 55,000
Pajak:                Rp 5,500
================================
TOTAL:               Rp 60,500
================================

Metode Bayar: Cash

Terima kasih atas kunjungan Anda!
Selamat menikmati!
```

---

## 🔐 Keamanan & Privacy

### Data yang Diakses:
- ✅ Bluetooth device name (untuk identifikasi printer)
- ✅ GATT service UUID (untuk komunikasi)
- ❌ **TIDAK** mengakses data pribadi lain dari device

### Koneksi:
- Koneksi hanya aktif saat print
- User harus manual approve device pairing
- Tidak ada auto-connect tanpa permission

---

## 💡 Tips & Best Practices

### 1. **Koneksi Stabil**
- Jarak printer max 10 meter dari device
- Hindari penghalang (tembok tebal, logam)
- Charge battery printer jika menggunakan portable printer

### 2. **Print Speed**
- Jangan spam print (tunggu print selesai)
- Interval minimal 2-3 detik antar print
- Jika buffer penuh, restart printer

### 3. **Kertas**
- Gunakan kertas thermal 58mm atau 80mm
- Pastikan kertas tidak habis
- Bersihkan print head secara berkala

### 4. **Multiple Printers**
- Bisa connect ke beberapa printer (dapur & kasir terpisah)
- Setiap device harus pair ulang
- Nama printer akan tersimpan di session

---

## 🚀 Fitur Lanjutan (Coming Soon)

- [ ] Auto-reconnect setelah disconnect
- [ ] Save preferred printer (local storage)
- [ ] Batch print (multiple receipts)
- [ ] Custom template design
- [ ] QR code on receipt
- [ ] Logo/image print support

---

## 📞 Support

Jika mengalami masalah:
1. Cek troubleshooting guide di atas
2. Test dengan printer lain (jika ada)
3. Verifikasi printer support ESC/POS
4. Cek console browser (F12) untuk error message

---

**Updated**: November 12, 2025
**Version**: 1.0.0
