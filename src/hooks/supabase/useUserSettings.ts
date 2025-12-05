import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface UserSettings {
  id?: string;
  user_id: string;
  
  // General
  business_name?: string;
  currency?: string;
  timezone?: string;
  language?: string;
  dark_mode?: boolean;
  sound_enabled?: boolean;
  
  // Store
  store_name?: string;
  store_address?: string;
  store_city?: string;
  store_postal_code?: string;
  store_phone?: string;
  store_email?: string;
  
  // Payment
  cash_enabled?: boolean;
  card_enabled?: boolean;
  ewallet_enabled?: boolean;
  transfer_enabled?: boolean;
  tax_rate?: number;
  service_charge?: number;
  show_tax_separately?: boolean;
  qris_image_url?: string;
  
  // Receipt
  receipt_header?: string;
  receipt_tagline?: string;
  receipt_footer?: string;
  show_logo?: boolean;
  show_cashier_details?: boolean;
  
  // Notification
  daily_report?: boolean;
  low_stock?: boolean;
  large_transaction?: boolean;
  whatsapp_number?: string;
  whatsapp_enabled?: boolean;
  
  // Loyalty
  loyalty_enabled?: boolean;
  points_per_rupiah?: number;
  rupiah_per_point?: number;
  minimum_points_redeem?: number;
  minimum_purchase_earn?: number;
  
  created_at?: string;
  updated_at?: string;
}

// Get current username from localStorage
function getCurrentUserId(): string {
  return localStorage.getItem('username') || 'guest';
}

// Fetch user settings from database
export function useUserSettings() {
  const userId = getCurrentUserId();
  
  return useQuery({
    queryKey: ['user-settings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      
      return data as UserSettings | null;
    },
    enabled: !!userId && userId !== 'guest',
  });
}

// Save or update user settings
export function useSaveUserSettings() {
  const queryClient = useQueryClient();
  const userId = getCurrentUserId();
  
  return useMutation({
    mutationFn: async (settings: Partial<UserSettings>) => {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('user_settings')
          .update(settings)
          .eq('user_id', userId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('user_settings')
          .insert({
            user_id: userId,
            ...settings,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings', userId] });
      toast({
        title: 'Pengaturan Disimpan',
        description: 'Pengaturan berhasil disimpan ke database',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal Menyimpan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Migrate localStorage settings to database (one-time migration)
export async function migrateLocalStorageToDatabase() {
  const userId = getCurrentUserId();
  if (!userId || userId === 'guest') return;
  
  try {
    // Check if already migrated
    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (existing) {
      console.log('Settings already in database');
      return;
    }
    
    // Read from localStorage
    const general = localStorage.getItem('settings_general');
    const store = localStorage.getItem('settings_store');
    const payment = localStorage.getItem('settings_payment');
    const receipt = localStorage.getItem('settings_receipt');
    const notification = localStorage.getItem('settings_notification');
    const loyalty = localStorage.getItem('settings_loyalty');
    
    const settings: Partial<UserSettings> = {
      user_id: userId,
    };
    
    if (general) {
      const g = JSON.parse(general);
      settings.business_name = g.businessName;
      settings.currency = g.currency;
      settings.timezone = g.timezone;
      settings.language = g.language;
      settings.dark_mode = g.darkMode;
      settings.sound_enabled = g.soundEnabled;
    }
    
    if (store) {
      const s = JSON.parse(store);
      settings.store_name = s.name;
      settings.store_address = s.address;
      settings.store_city = s.city;
      settings.store_postal_code = s.postalCode;
      settings.store_phone = s.phone;
      settings.store_email = s.email;
    }
    
    if (payment) {
      const p = JSON.parse(payment);
      settings.cash_enabled = p.cashEnabled;
      settings.card_enabled = p.cardEnabled;
      settings.ewallet_enabled = p.ewalletEnabled;
      settings.transfer_enabled = p.transferEnabled;
      settings.tax_rate = p.taxRate;
      settings.service_charge = p.serviceCharge;
      settings.show_tax_separately = p.showTaxSeparately;
      settings.qris_image_url = p.qrisImageUrl;
    }
    
    if (receipt) {
      const r = JSON.parse(receipt);
      settings.receipt_header = r.header;
      settings.receipt_tagline = r.tagline;
      settings.receipt_footer = r.footer;
      settings.show_logo = r.showLogo;
      settings.show_cashier_details = r.showCashierDetails;
    }
    
    if (notification) {
      const n = JSON.parse(notification);
      settings.daily_report = n.dailyReport;
      settings.low_stock = n.lowStock;
      settings.large_transaction = n.largeTransaction;
      settings.whatsapp_number = n.whatsappNumber;
      settings.whatsapp_enabled = n.whatsappEnabled;
    }
    
    if (loyalty) {
      const l = JSON.parse(loyalty);
      settings.loyalty_enabled = l.enabled;
      settings.points_per_rupiah = l.pointsPerRupiah;
      settings.rupiah_per_point = l.rupiahPerPoint;
      settings.minimum_points_redeem = l.minimumPointsRedeem;
      settings.minimum_purchase_earn = l.minimumPurchaseEarn;
    }
    
    // Insert to database
    const { error } = await supabase
      .from('user_settings')
      .insert(settings);
    
    if (error) throw error;
    
    console.log('✅ Settings migrated to database');
    toast({
      title: 'Migrasi Berhasil',
      description: 'Pengaturan telah dipindahkan ke database',
    });
  } catch (error) {
    console.error('Migration error:', error);
  }
}
