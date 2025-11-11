-- ============================================================
-- ADD PRODUCT VARIANTS FEATURE
-- ============================================================
-- Fitur untuk menambah varian produk (ukuran, rasa, dll)
-- Contoh: Kopi → Small/Medium/Large dengan harga berbeda
-- ============================================================

-- STEP 1: Create table product_variants
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,  -- Contoh: "Small", "Medium", "Large"
    price NUMERIC(10,2) NOT NULL,  -- Harga untuk variant ini
    cost NUMERIC(10,2),  -- Harga modal (optional)
    sku_suffix TEXT,  -- Suffix untuk SKU, contoh: "-S", "-M", "-L"
    stock INTEGER DEFAULT 0,  -- Stock per variant (optional, bisa pakai stock induk)
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,  -- Urutan tampil
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: Variant name harus unique per product
    CONSTRAINT unique_variant_per_product UNIQUE (product_id, name)
);

-- STEP 2: Create indexes untuk performa
CREATE INDEX idx_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_variants_active ON product_variants(is_active);

-- STEP 3: Add column 'has_variants' ke table products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT false;

-- STEP 4: Disable RLS untuk product_variants (sesuai setting lainnya)
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;
GRANT ALL ON product_variants TO anon;
GRANT ALL ON product_variants TO authenticated;

-- STEP 5: Insert sample data untuk testing
-- Contoh: Produk "Kopi" dengan 3 varian ukuran

-- Uncomment untuk testing:
/*
-- Assume ada product Kopi dengan ID tertentu
INSERT INTO product_variants (product_id, name, price, cost, sku_suffix, sort_order)
VALUES 
    ('YOUR-PRODUCT-ID-HERE', 'Small', 15000, 5000, '-S', 1),
    ('YOUR-PRODUCT-ID-HERE', 'Medium', 20000, 7000, '-M', 2),
    ('YOUR-PRODUCT-ID-HERE', 'Large', 25000, 9000, '-L', 3);

-- Update product untuk flag has_variants
UPDATE products 
SET has_variants = true 
WHERE id = 'YOUR-PRODUCT-ID-HERE';
*/

-- STEP 6: Verify schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'product_variants'
ORDER BY ordinal_position;

-- STEP 7: Check grants
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'product_variants';

-- ============================================================
-- STRUKTUR DATA SETELAH IMPLEMENTASI:
-- ============================================================
-- products:
--   - id
--   - name: "Kopi"
--   - price: 20000 (harga default/base)
--   - has_variants: true
--
-- product_variants:
--   - id
--   - product_id: (reference ke products)
--   - name: "Small"
--   - price: 15000
--   - sku_suffix: "-S"
--   - sort_order: 1

-- ============================================================
-- NEXT STEPS (akan dilakukan di kode aplikasi):
-- ============================================================
-- 1. Update Inventory UI: Tambah tab/section "Variants"
-- 2. Create hooks: useProductVariants, useCreateVariant, dll
-- 3. Update POS: Popup variant selector saat product dipilih
-- 4. Update transaction_items: Simpan variant_id dan variant_name

-- ============================================================
-- SELESAI! Schema sudah siap untuk Product Variants
-- ============================================================
