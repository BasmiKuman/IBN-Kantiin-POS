# 📝 IMPLEMENTASI USER SETTINGS DI DATABASE

## ✅ Yang Sudah Dibuat:

1. **SQL Migration File**: `/CREATE_USER_SETTINGS_TABLE.sql`
   - Table `user_settings` untuk menyimpan settings per user
   - RLS policies untuk keamanan
   - Indexes untuk performance

2. **React Hooks**: `/src/hooks/supabase/useUserSettings.ts`
   - `useUserSettings()` - Fetch settings dari database
   - `useSaveUserSettings()` - Save/update settings
   - `migrateLocalStorageToDatabase()` - Migrasi dari localStorage ke database

## 🚀 Cara Implementasi:

### STEP 1: Jalankan SQL Migration

1. Buka **Supabase Dashboard**: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/sql/new
2. Copy isi file `CREATE_USER_SETTINGS_TABLE.sql`
3. Paste di SQL Editor
4. Klik **"Run"**
5. Verify: Buka Table Editor, pastikan table `user_settings` sudah ada

### STEP 2: Update Settings.tsx

Ganti import di bagian atas `/src/pages/Settings.tsx`:

```typescript
// Tambahkan import ini
import { useUserSettings, useSaveUserSettings, migrateLocalStorageToDatabase } from "@/hooks/supabase/useUserSettings";
import { useEffect } from "react";
```

Ganti `useEffect` untuk load settings (sekitar line 117-145):

```typescript
// Load settings from DATABASE (bukan localStorage lagi)
const { data: dbSettings, isLoading } = useUserSettings();
const saveSettings = useSaveUserSettings();

useEffect(() => {
  // One-time migration from localStorage to database
  migrateLocalStorageToDatabase();
  
  // Load from database
  if (dbSettings) {
    // General
    setGeneralSettings({
      businessName: dbSettings.business_name || "BK POS",
      currency: dbSettings.currency || "IDR",
      timezone: dbSettings.timezone || "Asia/Jakarta",
      language: dbSettings.language || "id",
      darkMode: dbSettings.dark_mode,
      soundEnabled: dbSettings.sound_enabled,
    });
    
    // Store
    setStoreSettings({
      name: dbSettings.store_name || "Toko Pusat",
      address: dbSettings.store_address || "",
      city: dbSettings.store_city || "",
      postalCode: dbSettings.store_postal_code || "",
      phone: dbSettings.store_phone || "",
      email: dbSettings.store_email || "",
    });
    
    // Payment
    setPaymentSettings({
      cashEnabled: dbSettings.cash_enabled ?? true,
      cardEnabled: dbSettings.card_enabled ?? false,
      ewalletEnabled: dbSettings.ewallet_enabled ?? true,
      transferEnabled: dbSettings.transfer_enabled ?? true,
      taxRate: dbSettings.tax_rate ?? 0,
      serviceCharge: dbSettings.service_charge ?? 0,
      showTaxSeparately: dbSettings.show_tax_separately ?? true,
      qrisImageUrl: dbSettings.qris_image_url,
    });
    
    if (dbSettings.qris_image_url) {
      setQrisImagePreview(dbSettings.qris_image_url);
    }
    
    // Receipt
    setReceiptSettings({
      header: dbSettings.receipt_header || "BK POS",
      tagline: dbSettings.receipt_tagline || "",
      footer: dbSettings.receipt_footer || "",
      showLogo: dbSettings.show_logo ?? true,
      showCashierDetails: dbSettings.show_cashier_details ?? true,
    });
    
    // Notification
    setNotificationSettings({
      dailyReport: dbSettings.daily_report ?? false,
      lowStock: dbSettings.low_stock ?? false,
      largeTransaction: dbSettings.large_transaction ?? false,
      whatsappNumber: dbSettings.whatsapp_number || "",
      whatsappEnabled: dbSettings.whatsapp_enabled ?? false,
    });
    
    // Loyalty
    setLoyaltySettings({
      enabled: dbSettings.loyalty_enabled ?? false,
      pointsPerRupiah: dbSettings.points_per_rupiah ?? 1000,
      rupiahPerPoint: dbSettings.rupiah_per_point ?? 1000,
      minimumPointsRedeem: dbSettings.minimum_points_redeem ?? 10,
      minimumPurchaseEarn: dbSettings.minimum_purchase_earn ?? 10000,
    });
  }
}, [dbSettings]);
```

### STEP 3: Update Save Handlers

Ganti semua fungsi `handleSave*()` untuk menggunakan database:

```typescript
// Save general settings
const handleSaveGeneral = () => {
  saveSettings.mutate({
    business_name: generalSettings.businessName,
    currency: generalSettings.currency,
    timezone: generalSettings.timezone,
    language: generalSettings.language,
    dark_mode: generalSettings.darkMode,
    sound_enabled: generalSettings.soundEnabled,
  });
  
  // Tetap save ke localStorage sebagai backup
  localStorage.setItem("settings_general", JSON.stringify(generalSettings));
};

// Save store settings
const handleSaveStore = () => {
  saveSettings.mutate({
    store_name: storeSettings.name,
    store_address: storeSettings.address,
    store_city: storeSettings.city,
    store_postal_code: storeSettings.postalCode,
    store_phone: storeSettings.phone,
    store_email: storeSettings.email,
  });
  
  localStorage.setItem("settings_store", JSON.stringify(storeSettings));
};

// Save payment settings
const handleSavePayment = () => {
  saveSettings.mutate({
    cash_enabled: paymentSettings.cashEnabled,
    card_enabled: paymentSettings.cardEnabled,
    ewallet_enabled: paymentSettings.ewalletEnabled,
    transfer_enabled: paymentSettings.transferEnabled,
    tax_rate: paymentSettings.taxRate,
    service_charge: paymentSettings.serviceCharge,
    show_tax_separately: paymentSettings.showTaxSeparately,
    qris_image_url: paymentSettings.qrisImageUrl,
  });
  
  localStorage.setItem("settings_payment", JSON.stringify(paymentSettings));
};

// Save receipt settings
const handleSaveReceipt = () => {
  saveSettings.mutate({
    receipt_header: receiptSettings.header,
    receipt_tagline: receiptSettings.tagline,
    receipt_footer: receiptSettings.footer,
    show_logo: receiptSettings.showLogo,
    show_cashier_details: receiptSettings.showCashierDetails,
  });
  
  localStorage.setItem("settings_receipt", JSON.stringify(receiptSettings));
};

// Save notification settings
const handleSaveNotification = () => {
  saveSettings.mutate({
    daily_report: notificationSettings.dailyReport,
    low_stock: notificationSettings.lowStock,
    large_transaction: notificationSettings.largeTransaction,
    whatsapp_number: notificationSettings.whatsappNumber,
    whatsapp_enabled: notificationSettings.whatsappEnabled,
  });
  
  localStorage.setItem("settings_notification", JSON.stringify(notificationSettings));
};

// Save loyalty settings
const handleSaveLoyalty = () => {
  saveSettings.mutate({
    loyalty_enabled: loyaltySettings.enabled,
    points_per_rupiah: loyaltySettings.pointsPerRupiah,
    rupiah_per_point: loyaltySettings.rupiahPerPoint,
    minimum_points_redeem: loyaltySettings.minimumPointsRedeem,
    minimum_purchase_earn: loyaltySettings.minimumPurchaseEarn,
  });
  
  localStorage.setItem("settings_loyalty", JSON.stringify(loyaltySettings));
};
```

## 🎯 Keuntungan Sistem Baru:

1. **✅ Settings Persist Antar Device**
   - Login dari laptop → Atur settings
   - Login dari tablet → Settings sama!

2. **✅ Tidak Hilang Saat Clear Browser**
   - Clear cache → Settings tetap ada di database
   - Clear data → Login lagi, settings kembali

3. **✅ Backup Otomatis**
   - Tetap save ke localStorage (backward compatibility)
   - Database sebagai source of truth

4. **✅ Per User Account**
   - Admin punya settings sendiri
   - Kasir punya settings sendiri
   - Tidak saling timpa

## 📊 Cara Kerja:

```
User Login → Load from Database → Display Settings
     ↓
User Edit → Click Save → Save to Database + localStorage
     ↓
Next Login (any device) → Load from Database → Same Settings!
```

## ⚠️ Notes:

1. **First Time**: Settings dari localStorage akan di-migrasi otomatis ke database
2. **Backward Compatibility**: Tetap save ke localStorage juga
3. **User ID**: Menggunakan `username` dari localStorage sebagai user_id
4. **Guest Mode**: Jika belum login, settings tidak tersimpan ke database

## 🧪 Testing:

1. Login sebagai admin
2. Ubah settings (misal: nama toko, pajak, dll)
3. Klik "Simpan"
4. Logout
5. Login lagi → Settings harus sama
6. Buka dari device lain → Settings harus sama
7. Clear browser cache → Settings tetap ada setelah login

---

**Status**: ✅ Ready to implement
**Priority**: HIGH - Solves persistent settings issue
