# Tax Integration Test Guide

## Overview
Pengaturan pajak dari halaman Settings kini terintegrasi penuh dengan POS dan struk. Panduan ini untuk memverifikasi semua fungsi bekerja dengan benar.

## Fitur Yang Diimplementasikan

### 1. Settings Page
- ✅ Semua tombol simpan berfungsi
- ✅ Pengaturan disimpan ke localStorage
- ✅ Toast notification untuk setiap simpan
- ✅ Pengaturan dapat diubah kapan saja

### 2. POS Integration
- ✅ Membaca pengaturan pajak dari localStorage
- ✅ Perhitungan pajak dinamis berdasarkan rate dari Settings
- ✅ Biaya layanan (service charge) jika diaktifkan
- ✅ Tampilan pajak kondisional (hanya muncul jika diaktifkan)
- ✅ Tombol pembayaran terfilter berdasarkan metode yang diaktifkan
- ✅ Total dihitung dengan pajak + service charge

### 3. Receipt Integration
- ✅ Pajak ditampilkan dengan rate yang benar
- ✅ Pajak hanya muncul jika > 0
- ✅ Service charge ditampilkan jika ada
- ✅ Format struk thermal printer (80mm)

## Test Scenarios

### Test 1: Pajak 0% (Nonaktif)
**Steps:**
1. Buka Settings → Tab "Pembayaran"
2. Atur "Tarif Pajak" ke 0%
3. Klik "Simpan Pengaturan Pembayaran"
4. Buka halaman POS
5. Tambahkan produk ke keranjang
6. Periksa ringkasan:
   - ✅ Tidak ada baris "Pajak"
   - ✅ Total = Subtotal

**Expected Result:**
- Pajak tidak tampil di POS
- Total = Subtotal (tanpa tambahan)

### Test 2: Pajak 10%
**Steps:**
1. Buka Settings → Tab "Pembayaran"
2. Atur "Tarif Pajak" ke 10%
3. Pastikan "Tampilkan Pajak Terpisah" ON
4. Klik "Simpan Pengaturan Pembayaran"
5. Refresh halaman POS (F5)
6. Tambahkan produk Rp 10,000
7. Periksa ringkasan:
   - ✅ Subtotal: Rp 10,000
   - ✅ Pajak (10%): Rp 1,000
   - ✅ Total: Rp 11,000

**Expected Result:**
- Pajak 10% muncul
- Perhitungan benar
- Total termasuk pajak

### Test 3: Pajak 15% + Service Charge 5%
**Steps:**
1. Buka Settings → Tab "Pembayaran"
2. Atur "Tarif Pajak" ke 15%
3. Atur "Biaya Layanan" ke 5%
4. Pastikan "Tampilkan Pajak Terpisah" ON
5. Klik "Simpan Pengaturan Pembayaran"
6. Refresh halaman POS
7. Tambahkan produk Rp 10,000
8. Periksa ringkasan:
   - ✅ Subtotal: Rp 10,000
   - ✅ Pajak (15%): Rp 1,500
   - ✅ Biaya Layanan: Rp 500
   - ✅ Total: Rp 12,000

**Expected Result:**
- Pajak dan service charge muncul
- Perhitungan: 10000 + 1500 + 500 = 12000

### Test 4: Pajak Tersembunyi
**Steps:**
1. Buka Settings → Tab "Pembayaran"
2. Atur "Tarif Pajak" ke 10%
3. Matikan "Tampilkan Pajak Terpisah" (OFF)
4. Klik "Simpan Pengaturan Pembayaran"
5. Refresh halaman POS
6. Tambahkan produk Rp 10,000
7. Periksa ringkasan:
   - ✅ Tidak ada baris "Pajak"
   - ✅ Total = Subtotal: Rp 10,000

**Expected Result:**
- Pajak tidak ditampilkan (tersembunyi)
- Total tidak termasuk pajak
- Pajak sudah termasuk dalam harga

### Test 5: Filter Metode Pembayaran
**Steps:**
1. Buka Settings → Tab "Pembayaran"
2. Matikan "E-Wallet / QRIS" (OFF)
3. Matikan "Transfer Bank" (OFF)
4. Pastikan "Tunai" ON
5. Klik "Simpan Pengaturan Pembayaran"
6. Refresh halaman POS
7. Tambahkan produk
8. Periksa tombol pembayaran:
   - ✅ Tombol "Tunai" muncul
   - ✅ Tombol "QRIS" TIDAK muncul
   - ✅ Tombol "Transfer Bank" TIDAK muncul

**Expected Result:**
- Hanya metode pembayaran yang diaktifkan yang muncul

### Test 6: Receipt Print Test
**Steps:**
1. Buka Settings → Tab "Pembayaran"
2. Atur "Tarif Pajak" ke 12%
3. Atur "Biaya Layanan" ke 3%
4. Pastikan "Tampilkan Pajak Terpisah" ON
5. Klik "Simpan Pengaturan Pembayaran"
6. Buka halaman POS
7. Tambahkan produk Rp 20,000
8. Klik "Tunai"
9. Masukkan Rp 30,000
10. Klik "Proses Pembayaran"
11. Periksa struk:
    - ✅ Subtotal: Rp 20,000
    - ✅ Pajak (12%): Rp 2,400
    - ✅ Biaya Layanan: Rp 600
    - ✅ TOTAL: Rp 23,000
    - ✅ Bayar: Rp 30,000
    - ✅ Kembalian: Rp 7,000
12. Klik "Cetak Struk"

**Expected Result:**
- Struk menampilkan semua perhitungan dengan benar
- Format thermal printer 80mm
- Pajak dan service charge terpisah

### Test 7: Persistence Test
**Steps:**
1. Atur pajak ke 8% di Settings
2. Simpan
3. Refresh halaman (F5)
4. Buka POS
5. Tambahkan produk
6. Periksa pajak tetap 8%
7. Tutup browser
8. Buka kembali
9. Buka POS
10. Periksa pajak masih 8%

**Expected Result:**
- Pengaturan persisten setelah refresh
- Pengaturan persisten setelah tutup browser

## Calculation Examples

### Example 1: Rp 50,000 dengan Pajak 10%
```
Subtotal:  Rp 50,000
Pajak 10%: Rp  5,000
----------------------
Total:     Rp 55,000
```

### Example 2: Rp 100,000 dengan Pajak 11% + Service 2%
```
Subtotal:       Rp 100,000
Pajak 11%:      Rp  11,000
Biaya Layanan:  Rp   2,000
--------------------------
Total:          Rp 113,000
```

### Example 3: Multiple Items
```
Item 1: 2 x Rp 15,000 = Rp 30,000
Item 2: 1 x Rp 25,000 = Rp 25,000
----------------------------------
Subtotal:               Rp 55,000
Pajak 10%:              Rp  5,500
----------------------------------
Total:                  Rp 60,500
```

## Troubleshooting

### Pajak Tidak Berubah
**Solusi:**
1. Pastikan sudah klik "Simpan Pengaturan Pembayaran"
2. Lihat toast notification "Pengaturan pembayaran berhasil disimpan"
3. Refresh halaman POS (F5)
4. Periksa localStorage di DevTools → Application → Local Storage
5. Cari key "settings_payment"
6. Pastikan taxRate sudah berubah

### Tombol Pembayaran Tidak Hilang
**Solusi:**
1. Pastikan matikan toggle di Settings
2. Klik "Simpan Pengaturan Pembayaran"
3. Refresh halaman POS
4. Periksa localStorage "settings_payment"
5. Pastikan cashEnabled/ewalletEnabled/transferEnabled = false

### Struk Tidak Menampilkan Pajak
**Solusi:**
1. Periksa "Tampilkan Pajak Terpisah" di Settings
2. Pastikan "Tarif Pajak" > 0
3. Simpan pengaturan
4. Lakukan transaksi baru
5. Periksa struk

## Files Modified
1. `src/pages/Settings.tsx` - State management & save handlers
2. `src/pages/POS.tsx` - Tax calculation & payment filtering
3. `src/components/Receipt.tsx` - Dynamic tax display

## Technical Notes
- **Storage:** localStorage
- **Keys:** settings_payment, settings_general, settings_store, settings_receipt, settings_notification
- **Tax Calculation:** `subtotal * (taxRate / 100)`
- **Service Charge:** `subtotal * (serviceCharge / 100)`
- **Total:** `subtotal + tax + serviceCharge`

## Success Criteria
✅ Semua 7 test scenario berhasil  
✅ Perhitungan pajak akurat  
✅ Settings persisten  
✅ Struk menampilkan informasi yang benar  
✅ Tidak ada error di console  
✅ Toast notifications muncul  
