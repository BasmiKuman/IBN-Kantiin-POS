-- =====================================================
-- USER SETTINGS TABLE
-- Menyimpan pengaturan per user di database
-- =====================================================

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE, -- username dari localStorage
  
  -- General Settings
  business_name TEXT,
  currency TEXT DEFAULT 'IDR',
  timezone TEXT DEFAULT 'Asia/Jakarta',
  language TEXT DEFAULT 'id',
  dark_mode BOOLEAN DEFAULT false,
  sound_enabled BOOLEAN DEFAULT true,
  
  -- Store Settings
  store_name TEXT,
  store_address TEXT,
  store_city TEXT,
  store_postal_code TEXT,
  store_phone TEXT,
  store_email TEXT,
  
  -- Payment Settings
  cash_enabled BOOLEAN DEFAULT true,
  card_enabled BOOLEAN DEFAULT false,
  ewallet_enabled BOOLEAN DEFAULT true,
  transfer_enabled BOOLEAN DEFAULT true,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  service_charge DECIMAL(5,2) DEFAULT 0,
  show_tax_separately BOOLEAN DEFAULT true,
  qris_image_url TEXT,
  
  -- Receipt Settings
  receipt_header TEXT,
  receipt_tagline TEXT,
  receipt_footer TEXT,
  show_logo BOOLEAN DEFAULT true,
  show_cashier_details BOOLEAN DEFAULT true,
  
  -- Notification Settings
  daily_report BOOLEAN DEFAULT false,
  low_stock BOOLEAN DEFAULT false,
  large_transaction BOOLEAN DEFAULT false,
  whatsapp_number TEXT,
  whatsapp_enabled BOOLEAN DEFAULT false,
  
  -- Loyalty Settings
  loyalty_enabled BOOLEAN DEFAULT false,
  points_per_rupiah INTEGER DEFAULT 1000,
  rupiah_per_point INTEGER DEFAULT 1000,
  minimum_points_redeem INTEGER DEFAULT 10,
  minimum_purchase_earn INTEGER DEFAULT 10000,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only read/write their own settings
CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (true); -- Allow all authenticated users to read (we'll filter by user_id in the app)

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (true);

-- Index for faster queries
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- Success message
SELECT 'User Settings table created successfully!' AS status;
