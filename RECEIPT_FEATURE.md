# 🖨️ Fitur Cetak Struk - IBN Kantiin POS

## Overview
Sistem POS sekarang dilengkapi dengan fitur cetak struk otomatis untuk setiap transaksi tunai dan QRIS.

---

## ✨ Fitur Baru

### 1. **Struk Digital**
- Tampilan struk profesional dengan format thermal printer (80mm)
- Informasi lengkap: No. transaksi, tanggal, kasir, items, total, pembayaran
- Support untuk customer loyalty (nama pelanggan & poin)

### 2. **Cetak Struk**
- Print langsung ke printer thermal atau printer biasa
- Format optimized untuk thermal printer 80mm
- Auto-adjust untuk print preview browser

### 3. **Payment Flow**

#### **Tunai (Cash)**
```
1. Pilih produk → Add to cart
2. Klik "Tunai"
3. Dialog pembayaran muncul:
   - Input jumlah uang diterima
   - Auto calculate kembalian
   - Validasi jumlah harus >= total
4. Klik "Proses Pembayaran"
5. ✅ Struk otomatis muncul
6. Cetak atau tutup
```

#### **QRIS / Transfer**
```
1. Pilih produk → Add to cart
2. Klik "QRIS" atau "Transfer Bank"
3. ✅ Struk otomatis muncul (tanpa input amount)
4. Cetak atau tutup
```

---

## 📋 Informasi di Struk

### Header
```
IBN KANTIIN POS
Jl. Contoh No. 123, Kota
Telp: (021) 12345678
```

### Transaction Info
- **No. Transaksi:** TR-20251103-001
- **Tanggal:** 03/11/2025, 13:45
- **Kasir:** admin (dari localStorage)
- **Pelanggan:** Nama pelanggan (jika ada)

### Items
| Item | Qty | Harga | Subtotal |
|------|-----|-------|----------|
| Nasi Goreng | 2 | Rp 25.000 | Rp 50.000 |
| Es Teh | 1 | Rp 5.000 | Rp 5.000 |

### Totals
- **Subtotal:** Rp 55.000
- **Pajak (10%):** Rp 5.500
- **TOTAL:** Rp 60.500

### Payment
- **Metode:** TUNAI / QRIS / TRANSFER BANK
- **Bayar:** Rp 100.000 (hanya cash)
- **Kembalian:** Rp 39.500 (hanya cash)

### Loyalty Points (jika pelanggan terdaftar)
```
Poin Didapat: +60 poin
Total Poin: 560 poin
```

### Footer
```
Terima Kasih!
Barang yang sudah dibeli
tidak dapat dikembalikan

www.ibnkantiin.com

Powered by IBN Kantiin POS System
2025
```

---

## 🖥️ Testing Guide

### Test 1: Pembayaran Tunai dengan Struk
1. Login ke POS
2. Tambah 2-3 produk ke cart
3. Klik tombol **"Tunai"**
4. Dialog pembayaran muncul ✅
5. Input uang: Rp 100.000 (jika total Rp 60.000)
6. Kembalian auto calculate: Rp 40.000 ✅
7. Klik **"Proses Pembayaran"**
8. Toast "Transaksi Berhasil" muncul ✅
9. Dialog struk muncul ✅
10. Preview struk terlihat lengkap ✅
11. Klik **"Cetak Struk"** → Print dialog browser muncul ✅

### Test 2: Pembayaran QRIS dengan Struk
1. Tambah produk ke cart
2. Klik **"QRIS"**
3. Struk langsung muncul (tanpa dialog payment) ✅
4. Metode bayar di struk: "QRIS" ✅
5. Tidak ada info bayar & kembalian ✅
6. Bisa cetak struk ✅

### Test 3: Struk dengan Customer Loyalty
1. Input nomor HP customer di field pelanggan
2. Tambah produk (total Rp 50.000)
3. Proses pembayaran
4. Struk menampilkan:
   - Nama pelanggan ✅
   - Poin didapat: +50 ✅
   - Total poin: [accumulated] ✅

### Test 4: Cetak Struk Thermal Printer
**Jika memiliki thermal printer:**
1. Connect thermal printer (USB/Bluetooth)
2. Proses transaksi
3. Klik "Cetak Struk"
4. Pilih thermal printer di print dialog
5. Print settings:
   - Paper size: 80mm (auto)
   - Margins: None
   - Scale: 100%
6. Klik Print ✅

**Jika tidak ada thermal printer:**
- Tetap bisa cetak ke printer biasa
- Atau Save as PDF untuk dokumentasi

---

## 🛠️ Technical Implementation

### Components
```tsx
// New Component
src/components/Receipt.tsx
- Professional receipt layout
- Thermal printer optimized (80mm)
- Print-friendly CSS with @media print

// Modified Component
src/pages/POS.tsx
- Added receipt state & dialog
- Payment flow updated
- Auto-show receipt after transaction
```

### Libraries
```json
{
  "react-to-print": "^2.15.1"
}
```

### Key Features
```typescript
// Print handler
const handlePrint = useReactToPrint({
  contentRef: receiptRef,
});

// Transaction data for receipt
const lastTransaction = {
  transactionNumber,
  date,
  items,
  subtotal,
  tax,
  total,
  paymentMethod,
  paymentAmount,
  changeAmount,
  customerName,
  customerPoints,
  earnedPoints,
};
```

---

## 🎨 CSS Print Styling

```css
@media print {
  /* Hide everything except receipt */
  body * { visibility: hidden; }
  .receipt-container, .receipt-container * { 
    visibility: visible; 
  }
  
  /* Position receipt */
  .receipt-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 80mm;
    padding: 10mm;
  }
  
  /* Set page size for thermal printer */
  @page {
    size: 80mm auto;
    margin: 0;
  }
}
```

---

## 📱 Responsive Design

### Desktop
- Full struk preview di dialog
- Scrollable jika konten panjang
- Tombol cetak & tutup di bawah

### Mobile
- Struk fit to screen
- Touch-friendly buttons
- Same print functionality

---

## 🚀 Future Enhancements

### Planned Features
1. **Email Receipt** - Kirim struk via email
2. **SMS Receipt** - Kirim link struk via SMS
3. **WhatsApp Receipt** - Share struk via WhatsApp
4. **Receipt History** - Reprint struk transaksi lama
5. **Custom Header** - Upload logo & edit business info
6. **Barcode** - Add transaction barcode untuk tracking
7. **QR Code** - QR untuk review/feedback

### Configuration Options
1. **Business Info Settings**
   - Nama toko
   - Alamat
   - Telepon
   - Website
   - Logo

2. **Receipt Settings**
   - Show/hide tax
   - Show/hide points
   - Custom footer message
   - Paper size (58mm / 80mm)

3. **Auto-print**
   - Option to auto-print after transaction
   - No confirmation dialog

---

## 🐛 Troubleshooting

### Issue: Print dialog tidak muncul
**Solution:**
- Pastikan browser allow popups
- Check browser print permissions
- Try Ctrl+P manual

### Issue: Struk terpotong saat print
**Solution:**
- Set printer margins to None/Minimum
- Check paper size di print settings
- Pilih "Fit to page" jika ada

### Issue: Font terlalu kecil
**Solution:**
- Adjust scale di print settings (100% - 125%)
- Atau edit font-size di Receipt.tsx

### Issue: Tidak ada printer
**Solution:**
- Gunakan "Save as PDF"
- Share PDF via WhatsApp/Email
- Print dari device lain

---

## 📊 Print Settings Recommendation

### Thermal Printer (80mm)
```
Paper Size: 80mm x continuous
Orientation: Portrait
Margins: None
Scale: 100%
Background Graphics: On
```

### Regular Printer (A4)
```
Paper Size: A4
Orientation: Portrait
Margins: Minimum
Scale: Fit to page
Print background: Yes
```

### Save as PDF
```
Destination: Save as PDF
Paper Size: A4 or 80mm
Color: Black & White (recommended)
```

---

## ✅ Checklist

### Basic Functionality
- [x] Struk muncul setelah transaksi tunai
- [x] Struk muncul setelah transaksi QRIS
- [x] Struk muncul setelah transaksi transfer
- [x] Info transaksi lengkap
- [x] Kembalian calculate otomatis (tunai)
- [x] Customer loyalty points displayed
- [x] Print button berfungsi
- [x] Print dialog muncul
- [x] Thermal printer support (80mm)

### UI/UX
- [x] Receipt preview clear & readable
- [x] Dialog responsive
- [x] Buttons accessible
- [x] Loading states
- [x] Error handling

### Edge Cases
- [x] Transaksi tanpa customer
- [x] Transaksi dengan customer
- [x] Payment validation (tunai)
- [x] Multiple items in cart
- [x] Long product names (wrap)

---

**Status:** ✅ Fully Implemented  
**Version:** 1.0.0  
**Last Updated:** November 3, 2025
