# Product Variants Feature

## ✨ Fitur Baru: Varian Produk

Fitur untuk menambahkan varian pada produk (contoh: ukuran Small/Medium/Large dengan harga berbeda).

## 📊 Database Schema

### Table: `product_variants`
```sql
- id: UUID (PK)
- product_id: UUID (FK → products.id)
- name: TEXT (nama varian, contoh: "Small", "Large")
- price: NUMERIC (harga khusus varian ini)
- cost: NUMERIC (harga modal)
- sku_suffix: TEXT (suffix SKU, contoh: "-S", "-L")
- stock: INTEGER (stock per varian, optional)
- is_active: BOOLEAN
- sort_order: INTEGER (urutan tampil)
- created_at, updated_at: TIMESTAMPTZ
```

### Update: `products` table
```sql
- has_variants: BOOLEAN (flag apakah produk punya varian)
```

## 🚀 Implementasi

### 1. Migration SQL
File: `supabase/migrations/20251111_add_product_variants.sql`

**Cara Jalankan:**
1. Buka Supabase Dashboard → SQL Editor
2. Copy-paste isi file migration
3. Klik "Run"

### 2. React Hooks
File: `src/hooks/supabase/useProductVariants.ts`

**Hooks Available:**
- `useProductVariants(productId)` - Get variants untuk product
- `useCreateVariant()` - Tambah variant baru
- `useUpdateVariant()` - Update variant
- `useDeleteVariant()` - Hapus variant (soft delete)
- `useToggleProductVariants()` - Toggle flag has_variants

### 3. UI Components
File: `src/components/VariantSelector.tsx`

**Component untuk POS:**
- Dialog untuk pilih variant saat add product ke cart
- Tampilkan nama variant dan harga
- Radio button selection

## 📋 TODO - Next Steps

### A. Update Inventory Page
- [ ] Tambah button "Kelola Varian" di setiap product row
- [ ] Dialog untuk manage variants per product:
  - [ ] List variants yang sudah ada
  - [ ] Form add new variant (nama, harga, SKU suffix)
  - [ ] Edit/Delete variant
  - [ ] Toggle "has_variants" checkbox

### B. Update POS Page  
- [ ] Cek `product.has_variants` saat add to cart
- [ ] Jika true, tampilkan VariantSelector dialog
- [ ] Simpan variant_id dan variant_name di cart item
- [ ] Tampilkan variant name di cart list

### C. Update Transaction Items
- [ ] Add columns ke table `transaction_items`:
  ```sql
  ALTER TABLE transaction_items 
  ADD COLUMN variant_id UUID REFERENCES product_variants(id),
  ADD COLUMN variant_name TEXT;
  ```
- [ ] Update insert transaction untuk simpan variant info

### D. Update Receipt/Struk
- [ ] Tampilkan variant name di struk
  ```
  Kopi - Large   Rp 25.000
  Kopi - Small   Rp 15.000
  ```

## 💡 Use Cases

### Case 1: Minuman dengan Ukuran
```
Product: "Kopi"
Variants:
  - Small: Rp 15.000
  - Medium: Rp 20.000
  - Large: Rp 25.000
```

### Case 2: Makanan dengan Level Pedas
```
Product: "Ayam Geprek"
Variants:
  - Tidak Pedas: Rp 18.000
  - Pedas: Rp 18.000
  - Extra Pedas: Rp 20.000
```

### Case 3: Produk dengan Topping
```
Product: "Es Krim"
Variants:
  - Polos: Rp 10.000
  - + Coklat: Rp 12.000
  - + Keju: Rp 13.000
  - + Coklat & Keju: Rp 15.000
```

## 🔄 Flow Aplikasi

### Di Inventory:
1. User buat produk "Kopi"
2. Set harga default Rp 20.000
3. Klik "Kelola Varian"
4. Tambah varian:
   - Small: Rp 15.000
   - Medium: Rp 20.000
   - Large: Rp 25.000
5. Toggle "has_variants" = true

### Di POS:
1. Kasir klik produk "Kopi" 
2. Muncul dialog "Pilih Varian"
3. Kasir pilih "Large"
4. Product masuk cart dengan:
   - Name: "Kopi - Large"
   - Price: Rp 25.000
   - variant_id: xxx

### Di Transaksi:
1. Saat checkout, transaction_items disimpan dengan variant info
2. Receipt print:
   ```
   Kopi - Large  1x  Rp 25.000
   Kopi - Small  2x  Rp 30.000
   ```

## ⚙️ Configuration

### Enable Variants untuk Product
```typescript
// Di Inventory, toggle checkbox
await toggleProductVariants.mutate({
  productId: product.id,
  hasVariants: true
});
```

### Add Variant
```typescript
await createVariant.mutate({
  product_id: productId,
  name: "Large",
  price: 25000,
  cost: 10000,
  sku_suffix: "-L",
  sort_order: 3,
  is_active: true
});
```

## 🎨 UI Mockup

### Inventory - Manage Variants Dialog
```
┌─────────────────────────────────────┐
│ Kelola Varian - Kopi                │
├─────────────────────────────────────┤
│ ☑ Produk ini memiliki varian        │
│                                     │
│ Daftar Varian:                      │
│ ┌────────────────────────────────┐ │
│ │ Small     Rp 15.000  [Edit][×] │ │
│ │ Medium    Rp 20.000  [Edit][×] │ │
│ │ Large     Rp 25.000  [Edit][×] │ │
│ └────────────────────────────────┘ │
│                                     │
│ [+ Tambah Varian]                   │
│                                     │
│ Form Tambah Varian:                 │
│ Nama: [______________]              │
│ Harga: [______________]             │
│ SKU Suffix: [______________]        │
│                                     │
│ [Batal]        [Simpan]             │
└─────────────────────────────────────┘
```

### POS - Variant Selector
```
┌─────────────────────────────────────┐
│ Pilih Varian                        │
│ Kopi                                │
├─────────────────────────────────────┤
│ ○ Small          Rp 15.000          │
│ ● Medium         Rp 20.000          │
│ ○ Large          Rp 25.000          │
│                                     │
│ [Batal]        [Tambahkan]          │
└─────────────────────────────────────┘
```

## 📝 Status

- [x] Database schema created
- [x] Migration SQL ready
- [x] React hooks implemented
- [x] VariantSelector component created
- [x] Product interface updated
- [ ] Inventory UI for managing variants
- [ ] POS integration with variant selector
- [ ] Transaction items update
- [ ] Receipt/struk update

## 🚀 Next: Run Migration

**Jalankan SQL migration dulu:**
```bash
# Copy isi file: supabase/migrations/20251111_add_product_variants.sql
# Paste di Supabase Dashboard → SQL Editor → Run
```

Setelah migration berhasil, saya akan lanjutkan implementasi UI di Inventory dan POS.
