-- ============================================================
-- ADD PRODUCT VARIANTS FEATURE - FIXED
-- ============================================================

-- STEP 1: Create table product_variants
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    cost NUMERIC(10,2),
    sku_suffix TEXT,
    stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_variant_per_product UNIQUE (product_id, name)
);

-- STEP 2: Create indexes (with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_active ON product_variants(is_active);

-- STEP 3: Add column has_variants
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT false;

-- STEP 4: Disable RLS
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;
GRANT ALL ON product_variants TO anon;
GRANT ALL ON product_variants TO authenticated;

-- STEP 5: Verify
SELECT 'Product Variants migration completed!' as status;
