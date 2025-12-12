import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y';
  value: number;
  min_purchase: number;
  max_discount?: number;
  start_date: string;
  end_date: string;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  applicable_products?: string[];
  applicable_categories?: string[];
  created_at: string;
  updated_at: string;
}

// Get all promotions (for admin/settings page)
export function useAllPromotions() {
  return useQuery({
    queryKey: ['promotions', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Promotion[];
    },
  });
}

// Get all active promotions (for POS checkout)
export function usePromotions() {
  return useQuery({
    queryKey: ['promotions', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Promotion[];
    },
  });
}

// Get promotion by code
export function usePromotionByCode(code: string) {
  return useQuery({
    queryKey: ['promotion', code],
    queryFn: async () => {
      if (!code) return null;
      
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data as Promotion;
    },
    enabled: !!code && code.length > 0,
  });
}

// Validate and calculate promotion discount
export function calculatePromotionDiscount(
  promotion: Promotion | null,
  subtotal: number,
  cartItems: any[]
): { discount: number; isValid: boolean; error?: string } {
  if (!promotion) {
    return { discount: 0, isValid: false, error: 'Promosi tidak ditemukan' };
  }

  // Check if promotion is active
  if (!promotion.is_active) {
    return { discount: 0, isValid: false, error: 'Promosi tidak aktif' };
  }

  // Check date validity
  const now = new Date();
  const startDate = new Date(promotion.start_date);
  const endDate = new Date(promotion.end_date);
  
  if (now < startDate || now > endDate) {
    return { discount: 0, isValid: false, error: 'Promosi sudah tidak berlaku' };
  }

  // Check minimum purchase
  if (subtotal < promotion.min_purchase) {
    return {
      discount: 0,
      isValid: false,
      error: `Minimal pembelian Rp${promotion.min_purchase.toLocaleString('id-ID')}`,
    };
  }

  // Check usage limit
  if (promotion.usage_limit && promotion.usage_count >= promotion.usage_limit) {
    return { discount: 0, isValid: false, error: 'Kuota promosi sudah habis' };
  }

  // Calculate discount based on type
  let discount = 0;

  switch (promotion.type) {
    case 'percentage':
      discount = (subtotal * promotion.value) / 100;
      if (promotion.max_discount) {
        discount = Math.min(discount, promotion.max_discount);
      }
      break;

    case 'fixed':
      discount = promotion.value;
      break;

    case 'buy_x_get_y':
      // TODO: Implement buy X get Y logic
      discount = 0;
      break;

    default:
      discount = 0;
  }

  // Ensure discount doesn't exceed subtotal
  discount = Math.min(discount, subtotal);

  return { discount, isValid: true };
}

// Create promotion
export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promotion: Omit<Promotion, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
      const { data, error } = await supabase
        .from('promotions')
        .insert([promotion])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['promotions', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['promotions', 'active'] });
    },
  });
}

// Update promotion
export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Promotion> & { id: string }) => {
      const { data, error } = await supabase
        .from('promotions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['promotions', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['promotions', 'active'] });
    },
  });
}

// Delete promotion
export function useDeletePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['promotions', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['promotions', 'active'] });
    },
  });
}
