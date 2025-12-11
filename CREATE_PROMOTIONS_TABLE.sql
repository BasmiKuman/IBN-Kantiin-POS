-- Create promotions table for discount/promo management
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed', 'buy_x_get_y')),
  value DECIMAL(10, 2) NOT NULL,
  min_purchase DECIMAL(10, 2) DEFAULT 0,
  max_discount DECIMAL(10, 2),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  applicable_products JSONB, -- Array of product IDs, null means all products
  applicable_categories JSONB, -- Array of category IDs, null means all categories
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_active ON promotions(is_active);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);

-- Add RLS policies
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON promotions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON promotions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON promotions
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON promotions
  FOR DELETE USING (true);

-- Add promotion_id column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS promotion_id UUID REFERENCES promotions(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS promotion_discount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS promotion_code VARCHAR(50);

-- Create function to update promotion usage count
CREATE OR REPLACE FUNCTION update_promotion_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.promotion_id IS NOT NULL THEN
    UPDATE promotions 
    SET usage_count = usage_count + 1
    WHERE id = NEW.promotion_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update promotion usage
DROP TRIGGER IF EXISTS trigger_update_promotion_usage ON transactions;
CREATE TRIGGER trigger_update_promotion_usage
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_promotion_usage();

-- Insert sample promotions
INSERT INTO promotions (code, name, description, type, value, min_purchase, start_date, end_date, is_active) VALUES
('DISKON10', 'Diskon 10%', 'Diskon 10% untuk semua pembelian', 'percentage', 10, 0, NOW(), NOW() + INTERVAL '1 year', true),
('HEMAT50K', 'Potongan Rp50.000', 'Potongan Rp50.000 untuk pembelian minimal Rp200.000', 'fixed', 50000, 200000, NOW(), NOW() + INTERVAL '1 year', true),
('WELCOME20', 'Welcome Diskon 20%', 'Diskon 20% untuk pelanggan baru', 'percentage', 20, 50000, NOW(), NOW() + INTERVAL '1 year', true);
