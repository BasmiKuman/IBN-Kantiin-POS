# Thermal Receipt Implementation Guide

## 📱 Optimized for Xiaomi Redmi Pad SE 8.7"

Implementasi thermal receipt yang lebih robust dan terstruktur, dengan prioritas untuk device Xiaomi Redmi Pad SE 8.7" menggunakan thermal printer 58mm.

---

## 🎯 Features

### ✅ ThermalReceipt Component
- **Auto text wrapping** - Nama produk panjang otomatis terpotong dengan baik
- **Responsive layout** - Support 58mm (24 chars) dan 80mm (32 chars)
- **Clean formatting** - No separator overlap issues
- **Multi-device support** - Optimized untuk tablet & desktop

### ✅ ThermalDailyReport Component
- Laporan harian dengan format thermal printer
- Top products, payment methods, profit analysis
- Auto-wrap untuk text panjang

### ✅ ESC/POS Converter
- Convert HTML thermal receipt → ESC/POS commands
- Bluetooth printing compatible
- Character width management

---

## 📂 Files Created

```
src/
├── components/
│   ├── ThermalReceipt.tsx           # Cashier receipt component
│   └── ThermalDailyReport.tsx       # Daily report component
└── lib/
    └── formatters/
        └── thermalReceiptConverter.ts  # HTML → ESC/POS converter
```

---

## 🚀 Implementation Steps

### 1. **Import Components**

```typescript
import { ThermalReceipt } from '@/components/ThermalReceipt';
import { generateThermalReceipt } from '@/lib/formatters/thermalReceiptConverter';
import { useBluetoothPrinter } from '@/hooks/useBluetoothPrinter';
```

### 2. **Usage in Cashier/POS Page**

```typescript
// Example: Cashier.tsx atau POS.tsx
import { useRef } from 'react';
import { ThermalReceipt } from '@/components/ThermalReceipt';
import { generateThermalReceipt } from '@/lib/formatters/thermalReceiptConverter';
import { useBluetoothPrinter } from '@/hooks/useBluetoothPrinter';

function CashierPage() {
  const { print, isConnected, connect } = useBluetoothPrinter();
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const handlePrintReceipt = async () => {
    // Prepare receipt data
    const receiptData = {
      transactionNumber: 'TRX-001',
      date: new Date(),
      items: [
        {
          name: 'Susu Telur Madu Jahe',
          quantity: 1,
          price: 15000,
          subtotal: 15000,
        },
        {
          name: 'Kopi Hitam',
          quantity: 2,
          price: 5000,
          subtotal: 10000,
        },
      ],
      subtotal: 25000,
      tax: 0,
      total: 25000,
      paymentMethod: 'tunai',
      paymentAmount: 30000,
      changeAmount: 5000,
      customerName: 'John Doe',
      paperWidth: '58mm' as const, // Optimized for Xiaomi Redmi Pad SE
      storeName: 'BK POS',
      storeAddress: 'Jl. Contoh No. 123',
      storePhone: '(021) 12345678',
      cashierName: localStorage.getItem('username') || 'Kasir',
    };
    
    // Generate ESC/POS commands
    const escPosCommands = generateThermalReceipt(receiptData);
    
    // Check Bluetooth connection
    if (!isConnected) {
      await connect();
    }
    
    // Print via Bluetooth
    await print(escPosCommands, 'Struk Kasir');
  };
  
  return (
    <div>
      <button onClick={handlePrintReceipt}>
        Print Receipt
      </button>
      
      {/* Preview (optional) */}
      <ThermalReceipt
        ref={receiptRef}
        transactionNumber="TRX-001"
        date={new Date()}
        items={[...]}
        subtotal={25000}
        tax={0}
        total={25000}
        paymentMethod="tunai"
        paymentAmount={30000}
        changeAmount={5000}
        paperWidth="58mm"
      />
    </div>
  );
}
```

### 3. **Integration with Existing System**

**Option A: Replace existing formatter** (Recommended)

```typescript
// Before (old cashierReceiptFormatter.ts):
import { generateCashierReceipt } from '@/lib/formatters/cashierReceiptFormatter';

// After (new thermal receipt):
import { generateThermalReceipt } from '@/lib/formatters/thermalReceiptConverter';

// Usage remains similar:
const receiptData = { /* ... */ };
const escPosCommands = generateThermalReceipt(receiptData);
await print(escPosCommands, 'Struk Kasir');
```

**Option B: Keep both systems** (for testing)

```typescript
// Use thermal receipt for Android tablet
const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);

if (isMobile) {
  // New thermal receipt (optimized for tablet)
  const escPos = generateThermalReceipt(receiptData);
  await print(escPos, 'Struk Kasir');
} else {
  // Old receipt formatter (desktop)
  const escPos = generateCashierReceipt(receiptData);
  await print(escPos, 'Struk Kasir');
}
```

---

## 🎨 Format Differences

### Old Formatter Issues:
```
PESANAN:           ← Header mengganggu produk pertama

Susu Telur Madu   ← Terpotong
1 x Rp15000
--------------------  ← Separator overlap
```

### New Thermal Receipt:
```
========================
BK POS
Jl. Contoh No. 123
========================

No: TRX-001
Tgl: 07/12/25 10:30

========================

Susu Telur Madu Jahe    ← Full name, wrapped properly
  1 x Rp15,000
  = Rp15,000

Kopi Hitam
  2 x Rp5,000
  = Rp10,000

------------------------  ← Light separator

Subtotal:       Rp25,000
========================
TOTAL:          Rp25,000
========================

Metode:            TUNAI
Bayar:          Rp30,000
Kembalian:       Rp5,000

========================
Terima Kasih!
========================
```

---

## ⚙️ Configuration

### Paper Width Settings

**58mm (24 characters)** - Recommended for Xiaomi Redmi Pad SE
- Optimal untuk tablet dengan thermal printer kecil
- Minimal text wrapping issues
- Fast printing

**80mm (32 characters)** - Optional untuk desktop
- Lebih banyak informasi per baris
- Better untuk laporan harian yang detail

```typescript
// Set di component
<ThermalReceipt paperWidth="58mm" {...props} />

// Atau di converter
generateThermalReceipt({ 
  ...data, 
  paperWidth: '58mm' 
});
```

---

## 🔧 Troubleshooting

### Issue: Text masih terpotong

**Solution:**
```typescript
// Check maxChars setting
const maxChars = paperWidth === '58mm' ? 24 : 32;

// Atau reduce lebih lanjut untuk printer tertentu
const maxChars = paperWidth === '58mm' ? 22 : 30; // Safety margin
```

### Issue: Separator overlap

**Solution:** Thermal receipt sudah menggunakan spacing yang benar:
- `separator` (====) untuk header/footer
- `lightSeparator` (----) untuk items
- Blank lines (`\n\n`) untuk spacing

### Issue: Bluetooth print gagal

**Check:**
1. Printer sudah paired di Settings Bluetooth tablet
2. Browser Chrome (Web Bluetooth API)
3. Call `connect()` sebelum `print()`

```typescript
if (!isConnected) {
  await connect();
}
await print(escPosCommands, 'Struk');
```

---

## 📊 Daily Report Usage

```typescript
import { ThermalDailyReport } from '@/components/ThermalDailyReport';
import { generateThermalReport } from '@/lib/formatters/thermalReceiptConverter';

const reportData = {
  date: new Date(),
  cashierName: 'John Doe',
  totalTransactions: 50,
  totalRevenue: 1500000,
  avgTransaction: 30000,
  cashAmount: 800000,
  cashCount: 30,
  qrisAmount: 500000,
  qrisCount: 15,
  transferAmount: 200000,
  transferCount: 5,
  topProducts: [
    { name: 'Kopi Hitam', quantity: 25, revenue: 125000 },
    { name: 'Nasi Goreng', quantity: 20, revenue: 400000 },
  ],
  paperWidth: '58mm' as const,
};

const escPosReport = generateThermalReport(reportData);
await print(escPosReport, 'Laporan Harian');
```

---

## ✅ Migration Checklist

- [ ] Install komponen thermal receipt
- [ ] Test preview di browser desktop
- [ ] Test print di Xiaomi Redmi Pad SE
- [ ] Verify text wrapping works
- [ ] Check separator alignment
- [ ] Test dengan produk nama panjang
- [ ] Test semua payment methods (tunai, QRIS, transfer)
- [ ] Test loyalty points (jika ada)
- [ ] Replace old formatter atau keep both
- [ ] Update Settings untuk pilih paper width
- [ ] Deploy ke production
- [ ] Clear tablet browser cache
- [ ] Test final print di production

---

## 🎯 Benefits

✅ **No more text truncation** - Smart word wrapping  
✅ **No separator overlap** - Proper spacing logic  
✅ **Consistent formatting** - All products sama format  
✅ **Device optimized** - Prioritas Xiaomi Redmi Pad SE  
✅ **Universal compatible** - Support 58mm & 80mm  
✅ **Easy maintenance** - Clean component structure  
✅ **Type safe** - Full TypeScript support  

---

## 📝 Notes

1. **Default 58mm** untuk semua printer di project ini
2. **Text wrapping** otomatis untuk nama produk > 24 chars
3. **No "PESANAN:" header** - langsung start dengan produk
4. **Bluetooth printing** tetap menggunakan `useBluetoothPrinter` hook
5. **Preview & Print** - Component bisa untuk preview HTML atau generate ESC/POS

---

**Developed for:** Xiaomi Redmi Pad SE 8.7" with 58mm thermal printer  
**Optimized by:** BasmiKuman POS Team  
**Last Updated:** December 2025
