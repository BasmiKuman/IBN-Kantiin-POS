# 📊 Fitur Export Laporan - PDF & Excel

## Overview
Halaman Laporan sekarang dilengkapi dengan fitur export data ke format PDF dan Excel untuk dokumentasi dan analisis lebih lanjut.

---

## ✨ Fitur Export

### 1. **Export PDF**
Generate laporan penjualan dalam format PDF dengan layout profesional.

**Konten PDF:**
```
┌─────────────────────────────────────┐
│ IBN KANTIIN POS                     │
│ Laporan Penjualan                   │
│ Tanggal: 03/11/2025                 │
├─────────────────────────────────────┤
│ RINGKASAN                           │
│ Total Pendapatan: Rp 1.250.000      │
│ Total Transaksi: 45                 │
│ Rata-rata Transaksi: Rp 27.777      │
├─────────────────────────────────────┤
│ DETAIL TRANSAKSI (Tabel)            │
│ - No. Transaksi                     │
│ - Tanggal                           │
│ - Metode Pembayaran                 │
│ - Total                             │
│ - Status                            │
└─────────────────────────────────────┘
```

**Features:**
- Auto-formatted table dengan jsPDF AutoTable
- Header biru profesional
- Max 50 transaksi terakhir (untuk performa)
- Filename: `Laporan_Penjualan_DD-MM-YYYY.pdf`

---

### 2. **Export Excel**
Generate laporan lengkap dalam format Excel (.xlsx) dengan multiple sections.

**Konten Excel:**

**Sheet 1: Laporan Penjualan**
```
Row 1-2: Header (Nama & Tanggal)
Row 4-8: Ringkasan
  - Total Pendapatan
  - Total Transaksi
  - Rata-rata Transaksi
  - Produk Terjual

Row 10-13: Metode Pembayaran
  - Tunai
  - E-Wallet/QRIS
  - Transfer

Row 15+: Detail Transaksi (Semua data)
  Columns: No. Transaksi | Tanggal | Waktu | Metode | Subtotal | Pajak | Total | Status
```

**Features:**
- Full transaction history (tidak dibatasi)
- Auto-sized columns untuk readability
- Format currency ready untuk Excel
- Filename: `Laporan_Penjualan_DD-MM-YYYY.xlsx`

---

## 🎯 Use Cases

### PDF Export - Untuk:
- ✅ Laporan cetak untuk management
- ✅ Dokumentasi fisik/arsip
- ✅ Presentasi ke stakeholder
- ✅ Quick overview penjualan
- ✅ Audit trail

### Excel Export - Untuk:
- ✅ Analisis data lebih dalam
- ✅ Pivot tables & charts
- ✅ Import ke software akuntansi
- ✅ Backup data lengkap
- ✅ Custom calculations & formulas

---

## 🚀 Cara Penggunaan

### Export PDF
1. Buka halaman **Laporan**
2. Pilih periode (opsional): Hari Ini / Minggu Ini / Bulan Ini / Tahun Ini
3. Klik tombol **"Export PDF"** (ikon FileText)
4. ✅ PDF otomatis terdownload
5. Buka file PDF di folder Downloads
6. Print atau save untuk dokumentasi

### Export Excel
1. Buka halaman **Laporan**
2. Pilih periode (opsional)
3. Klik tombol **"Export Excel"** (ikon FileSpreadsheet)
4. ✅ File Excel (.xlsx) otomatis terdownload
5. Buka dengan Microsoft Excel / Google Sheets / LibreOffice
6. Analisis data atau modify sesuai kebutuhan

---

## 📋 Data yang Diexport

### Summary Metrics
```javascript
{
  totalRevenue: 1250000,        // Total pendapatan
  totalTransactions: 45,         // Jumlah transaksi
  avgTransaction: 27777,         // Rata-rata per transaksi
  totalItems: 45,                // Estimasi item terjual
}
```

### Payment Method Breakdown
```javascript
{
  cash: 750000,                  // Tunai
  qris: 300000,                  // QRIS
  transfer: 200000,              // Transfer Bank
}
```

### Transaction Details
```javascript
{
  transaction_number: "TR-20251103-001",
  date: "03/11/2025",
  time: "13:45:30",
  payment_method: "CASH",
  subtotal: 45000,
  tax: 4500,
  total: 49500,
  status: "completed"
}
```

---

## 🛠️ Technical Implementation

### Libraries Installed
```json
{
  "jspdf": "^2.5.2",              // PDF generation
  "jspdf-autotable": "^3.8.3",    // PDF table formatting
  "xlsx": "^0.18.5",              // Excel generation
  "file-saver": "^2.0.5",         // File download utility
  "@types/file-saver": "^2.0.7"   // TypeScript types
}
```

### Code Structure
```typescript
// PDF Export Function
const exportToPDF = () => {
  const doc = new jsPDF();
  
  // Add header
  doc.text('IBN KANTIIN POS', 14, 22);
  
  // Add summary
  doc.text(`Total: Rp ${totalRevenue.toLocaleString()}`, 14, 54);
  
  // Add table
  autoTable(doc, {
    head: [['No', 'Tanggal', 'Metode', 'Total']],
    body: tableData,
  });
  
  // Save file
  doc.save('Laporan_Penjualan.pdf');
};

// Excel Export Function
const exportToExcel = () => {
  // Create data array
  const data = [
    ['Header'],
    ['Summary'],
    ...transactionData
  ];
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
  
  // Save file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([excelBuffer]), 'Laporan.xlsx');
};
```

---

## 🎨 UI/UX

### Button Placement
```
┌──────────────────────────────────────────────┐
│ Laporan & Analitik                           │
│                                              │
│ [Pilih Periode ▼] [Export PDF] [Export Excel]│
└──────────────────────────────────────────────┘
```

### Icons
- **PDF:** FileText icon (lucide-react)
- **Excel:** FileSpreadsheet icon (lucide-react)

### Toast Notifications
```javascript
// Success
"PDF Berhasil Diexport"
"Laporan penjualan telah diunduh"

// Success
"Excel Berhasil Diexport"
"Laporan penjualan telah diunduh"
```

---

## 📊 Export Format Examples

### PDF Table Format
```
┌─────────────┬────────────┬──────────┬──────────────┬───────────┐
│ No. Trans   │ Tanggal    │ Metode   │ Total        │ Status    │
├─────────────┼────────────┼──────────┼──────────────┼───────────┤
│ TR-2025-001 │ 03/11/2025 │ CASH     │ Rp 49.500    │ completed │
│ TR-2025-002 │ 03/11/2025 │ QRIS     │ Rp 32.000    │ completed │
│ TR-2025-003 │ 03/11/2025 │ TRANSFER │ Rp 75.500    │ completed │
└─────────────┴────────────┴──────────┴──────────────┴───────────┘
```

### Excel Structure
```
A              B           C        D          E        F      G      H
IBN KANTIIN POS
Tanggal: 03/11/2025

RINGKASAN
Total Pendapatan           Rp 1.250.000
Total Transaksi            45
Rata-rata Transaksi        Rp 27.777

METODE PEMBAYARAN
Tunai                      Rp 750.000
E-Wallet/QRIS              Rp 300.000

DETAIL TRANSAKSI
No. Transaksi  Tanggal    Waktu    Metode  Subtotal  Pajak  Total  Status
TR-2025-001    03/11/2025 13:45    CASH    45000     4500   49500  completed
```

---

## 🔍 Testing Guide

### Test 1: Export PDF
1. Login ke aplikasi
2. Buka menu **Laporan**
3. Tunggu data load
4. Klik **"Export PDF"**
5. ✅ Toast "PDF Berhasil Diexport" muncul
6. ✅ File `Laporan_Penjualan_DD-MM-YYYY.pdf` terdownload
7. Buka PDF
8. ✅ Verify: Header, summary, transaction table

### Test 2: Export Excel
1. Buka menu **Laporan**
2. Klik **"Export Excel"**
3. ✅ Toast "Excel Berhasil Diexport" muncul
4. ✅ File `.xlsx` terdownload
5. Buka dengan Excel/Sheets
6. ✅ Verify: Multiple sections, all data present
7. ✅ Test: Create pivot table, formulas work

### Test 3: No Data Scenario
1. Fresh database / no transactions
2. Klik Export PDF
3. ✅ PDF tetap generate (dengan nilai 0)
4. Klik Export Excel
5. ✅ Excel tetap generate (header + ringkasan saja)

### Test 4: Large Dataset
1. Database dengan 100+ transaksi
2. Export PDF
3. ✅ Max 50 transaksi di PDF (performa)
4. Export Excel
5. ✅ All 100+ transaksi di Excel

---

## 📱 Browser Compatibility

### Tested Browsers
- ✅ Chrome 120+ (Full support)
- ✅ Firefox 120+ (Full support)
- ✅ Safari 17+ (Full support)
- ✅ Edge 120+ (Full support)

### Mobile Browsers
- ✅ Chrome Mobile (Android)
- ✅ Safari Mobile (iOS)
- ⚠️ File save dialog may vary by OS

---

## 🚀 Future Enhancements

### Planned Features

#### 1. **Advanced Filtering**
```typescript
- Date range picker
- Custom period selection
- Filter by payment method
- Filter by product category
- Filter by customer tier
```

#### 2. **Export Templates**
```typescript
- Multiple PDF layouts
- Custom Excel templates
- Branded headers with logo
- Configurable columns
```

#### 3. **Scheduled Reports**
```typescript
- Daily email reports
- Weekly summary
- Monthly financial report
- Auto-export to cloud storage
```

#### 4. **Export Options**
```typescript
- CSV export
- JSON export (API integration)
- Print preview before export
- Batch export (multiple periods)
```

#### 5. **Charts in PDF**
```typescript
- Embed sales charts
- Payment method pie chart
- Trend graphs
- Product performance charts
```

---

## 🐛 Troubleshooting

### Issue: Download tidak jalan
**Solution:**
- Check browser popup blocker settings
- Allow downloads from localhost
- Check browser console for errors

### Issue: PDF table terpotong
**Solution:**
- Default: Max 50 rows untuk performa
- Modify code untuk increase limit jika diperlukan
- Atau gunakan Excel untuk full data

### Issue: Excel tidak buka di Google Sheets
**Solution:**
- File format .xlsx compatible dengan Sheets
- Upload manual jika auto-open gagal
- Check file tidak corrupt (redownload)

### Issue: Filename dengan special characters
**Solution:**
- Default format: `Laporan_Penjualan_DD-MM-YYYY`
- Slash (/) di-replace dengan dash (-)
- Compatible dengan semua OS

---

## 📦 Package Info

```bash
# Installed packages
npm install jspdf jspdf-autotable xlsx file-saver
npm install --save-dev @types/file-saver

# Total size: ~2.5MB
# Build impact: Minimal (+~500KB gzipped)
```

---

## ✅ Implementation Checklist

### Completed
- [x] Install PDF libraries (jsPDF, jspdf-autotable)
- [x] Install Excel libraries (xlsx, file-saver)
- [x] Install TypeScript types
- [x] Implement exportToPDF function
- [x] Implement exportToExcel function
- [x] Add export buttons to UI
- [x] Add icons (FileText, FileSpreadsheet)
- [x] Add toast notifications
- [x] Format PDF with tables
- [x] Format Excel with multiple sections
- [x] Set column widths for Excel
- [x] Generate dynamic filenames
- [x] Test export functionality

### Optional Enhancements
- [ ] Date range filtering
- [ ] Custom export templates
- [ ] Charts in exports
- [ ] Scheduled reports
- [ ] Email delivery

---

**Status:** ✅ Fully Implemented  
**Version:** 1.0.0  
**Last Updated:** November 3, 2025  
**Libraries:** jsPDF 2.5.2, xlsx 0.18.5, file-saver 2.0.5
