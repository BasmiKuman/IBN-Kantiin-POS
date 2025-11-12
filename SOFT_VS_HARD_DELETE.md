# 🗑️ SOFT DELETE vs HARD DELETE

## Situasi Sekarang

Ketika kamu klik **"Hapus Produk"** di aplikasi:
- ❌ Produk **TIDAK BENAR-BENAR DIHAPUS** dari database
- ✅ Produk hanya di-mark sebagai `is_active: false` (SOFT DELETE)
- ✅ Produk **tetap ada** di Supabase
- ❌ Produk **tidak muncul** di aplikasi (karena filter `is_active: true`)

## Kenapa Pakai SOFT DELETE?

### ✅ Keuntungan SOFT DELETE:
1. **Data Historis Aman** - Transaksi lama yang pakai produk ini tetap valid
2. **Bisa Di-Restore** - Kalau salah hapus, bisa dikembalikan
3. **Audit Trail** - Bisa track kapan produk di-delete
4. **Reporting Akurat** - Laporan bulan lalu tetap bisa show produk yang sudah dihapus

### ❌ Kerugian SOFT DELETE:
1. **Database Membengkak** - Produk "sampah" tetap ada
2. **Membingungkan** - Pas cek Supabase kok masih ada
3. **Perlu Cleanup Manual** - Harus rutin bersihkan data lama

---

## 🔄 Pilihan 1: TETAP SOFT DELETE (Rekomendasi)

**Tidak perlu ubah code!** Sistem sudah bekerja dengan benar.

Produk "terhapus" tetap ada di database tapi tidak muncul di aplikasi.

### Cara Cek Produk yang Terhapus:

Jalankan SQL ini di **Supabase SQL Editor**:

```sql
-- Lihat produk yang di-soft delete
SELECT id, name, sku, is_active, updated_at
FROM products
WHERE is_active = false
ORDER BY updated_at DESC;
```

### Cara Restore Produk:

```sql
-- Aktifkan kembali produk
UPDATE products 
SET is_active = true 
WHERE id = 'PRODUCT_ID_DISINI';
```

### Cara Hapus Permanen (Cleanup):

```sql
-- HATI-HATI! Ini permanen!
DELETE FROM products 
WHERE is_active = false 
  AND updated_at < NOW() - INTERVAL '30 days';  -- Hapus yang > 30 hari
```

---

## 🔥 Pilihan 2: GANTI KE HARD DELETE (Hapus Permanen)

**Risiko**: Data transaksi lama bisa error kalau produknya sudah dihapus!

### Ubah Code di `useProducts.ts`:

**BEFORE (Soft Delete)**:
```typescript
export function useDeleteProduct() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })  // ← SOFT DELETE
        .eq('id', id);
      if (error) throw error;
    },
    // ...
  });
}
```

**AFTER (Hard Delete)**:
```typescript
export function useDeleteProduct() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()  // ← HARD DELETE
        .eq('id', id);
      if (error) throw error;
    },
    // ...
  });
}
```

---

## 📊 Perbandingan

| Fitur | SOFT DELETE | HARD DELETE |
|-------|-------------|-------------|
| Data tetap ada di DB | ✅ Ya | ❌ Tidak |
| Bisa di-restore | ✅ Ya | ❌ Tidak |
| Transaksi lama aman | ✅ Ya | ⚠️ Bisa error |
| Database clean | ❌ Tidak | ✅ Ya |
| Perlu cleanup manual | ✅ Ya | ❌ Tidak |

---

## 🎯 Rekomendasi

### Untuk PRODUCTION:
**TETAP SOFT DELETE** ✅
- Lebih aman untuk data bisnis
- Bisa track history
- Bisa restore kalau salah

### Untuk DEVELOPMENT/TESTING:
**HARD DELETE** juga oke
- Database lebih clean
- Tidak perlu cleanup
- Lebih simpel

---

## ⚡ Quick Fix: Biar Jelas di Supabase

Kalau mau tetap soft delete tapi biar jelas, bisa:

### 1. Rename Column
```sql
ALTER TABLE products 
RENAME COLUMN is_active TO status;

-- Update nilai
UPDATE products SET status = true WHERE is_active = true;
UPDATE products SET status = false WHERE is_active = false;
```

### 2. Atau tambah column `deleted_at`
```sql
ALTER TABLE products 
ADD COLUMN deleted_at TIMESTAMPTZ NULL;

-- Update yang udah di-delete
UPDATE products 
SET deleted_at = updated_at 
WHERE is_active = false;
```

---

## 🤔 Mana yang Mau Dipilih?

Jawab:
- **A: Tetap SOFT DELETE** (tidak ubah apa-apa, sistem sudah benar)
- **B: Ganti ke HARD DELETE** (saya akan ubah code-nya)
- **C: Soft delete + tambah fitur cleanup** (auto-delete setelah X hari)

Bilang A, B, atau C, nanti saya implement! 🚀
