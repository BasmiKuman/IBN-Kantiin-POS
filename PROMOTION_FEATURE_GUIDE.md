# Fitur Promosi/Diskon di POS

## Fitur yang Ditambahkan

### 1. Database
- **Tabel `promotions`** dengan fields:
  - `code`: Kode promosi (unique)
  - `name`: Nama promosi
  - `type`: Jenis promosi (percentage, fixed, buy_x_get_y)
  - `value`: Nilai diskon
  - `min_purchase`: Minimum pembelian
  - `max_discount`: Maksimal diskon (untuk percentage)
  - `start_date` & `end_date`: Periode berlaku
  - `usage_limit` & `usage_count`: Batasan penggunaan
  - `is_active`: Status aktif/nonaktif

- **Update tabel `transactions`**:
  - `promotion_id`: Foreign key ke promotions
  - `promotion_code`: Kode promosi yang digunakan
  - `promotion_discount`: Jumlah diskon dari promosi

### 2. Hooks
File: `src/hooks/supabase/usePromotions.ts`
- `usePromotions()` - Get semua promosi aktif
- `usePromotionByCode(code)` - Get promosi by kode
- `calculatePromotionDiscount()` - Hitung diskon dan validasi
- `useCreatePromotion()` - Create promosi baru
- `useUpdatePromotion()` - Update promosi
- `useDeletePromotion()` - Delete promosi

### 3. UI di POS
- Button "Gunakan Promosi" di cart summary
- Dialog untuk:
  - Input kode promosi manual
  - Pilih dari list promosi tersedia
  - Lihat detail promosi (syarat, diskon yang didapat)
- Display promosi yang diterapkan dengan tombol remove
- Diskon promosi muncul di summary sebelum total

### 4. Validasi
- Cek promosi aktif dan dalam periode valid
- Cek minimum purchase
- Cek usage limit
- Cek apakah subtotal memenuhi syarat
- Auto-calculate discount sesuai type (percentage/fixed)
- Respect max_discount untuk percentage type

## Cara Menggunakan

### Setup Database
1. Jalankan SQL dari file `CREATE_PROMOTIONS_TABLE.sql` di Supabase:
```bash
# Copy isi file dan execute di SQL Editor Supabase
```

### Membuat Promosi Baru
Saat ini harus via SQL, nanti bisa dibuat halaman admin untuk manage promosi:

```sql
INSERT INTO promotions (code, name, description, type, value, min_purchase, start_date, end_date, is_active) 
VALUES 
('DISKON10', 'Diskon 10%', 'Diskon 10% untuk semua pembelian', 'percentage', 10, 0, NOW(), NOW() + INTERVAL '1 year', true),
('HEMAT50K', 'Potongan Rp50.000', 'Potongan Rp50.000 untuk pembelian minimal Rp200.000', 'fixed', 50000, 200000, NOW(), NOW() + INTERVAL '1 year', true);
```

### Menggunakan Promosi di POS
1. Tambahkan produk ke cart
2. Klik button "Gunakan Promosi"
3. Pilih cara apply:
   - **Via Kode**: Ketik kode promosi lalu klik "Terapkan"
   - **Via List**: Klik salah satu promosi yang valid dari list
4. Promosi akan otomatis diterapkan jika valid
5. Diskon muncul di summary
6. Untuk remove, klik tombol X di card promosi
7. Lanjut checkout seperti biasa

## Jenis Promosi

### 1. Percentage Discount
```sql
type = 'percentage'
value = 10  -- 10% discount
max_discount = 50000  -- Max Rp50.000
```

### 2. Fixed Amount Discount
```sql
type = 'fixed'
value = 50000  -- Rp50.000 off
```

### 3. Buy X Get Y (Coming Soon)
```sql
type = 'buy_x_get_y'
-- Logic belum diimplementasikan
```

## Fitur Lanjutan yang Bisa Ditambahkan

1. **Admin Page untuk Manage Promosi**
   - CRUD promosi via UI
   - Set applicable products/categories
   - View analytics penggunaan promosi

2. **Kombinasi Promosi**
   - Allow multiple promotions per transaction
   - Priority/stacking rules

3. **Auto-apply Promosi**
   - Promosi otomatis diterapkan jika syarat terpenuhi

4. **Promosi Member/Customer Specific**
   - Promosi khusus untuk customer tertentu
   - Birthday discount

5. **Buy X Get Y Logic**
   - Beli 2 gratis 1
   - Bundle deals

6. **Time-based Promotions**
   - Happy hour discounts
   - Weekend specials

## Notes
- Promosi dan poin loyalty bisa digunakan bersamaan
- Promosi dihitung sebelum diskon poin
- Usage count auto-increment via trigger
- Promosi expired otomatis tidak muncul di list
