import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price: number;
  cost: number | null;
  sku_suffix: string | null;
  stock: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Get all variants for a product
export function useProductVariants(productId: string) {
  return useQuery({
    queryKey: ['product-variants', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as ProductVariant[];
    },
    enabled: !!productId,
  });
}

// Create new variant
export function useCreateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('product_variants')
        .insert(variant)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', data.product_id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Berhasil',
        description: 'Varian berhasil ditambahkan',
      });
    },
    onError: (error: any) => {
      let errorMessage = error.message;
      if (error.code === '23505') {
        errorMessage = 'Nama varian sudah ada untuk produk ini';
      }
      toast({
        title: 'Gagal',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
}

// Update variant
export function useUpdateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductVariant> & { id: string }) => {
      const { data, error } = await supabase
        .from('product_variants')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', data.product_id] });
      toast({
        title: 'Berhasil',
        description: 'Varian berhasil diupdate',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Delete variant (soft delete)
export function useDeleteVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
      const { error } = await supabase
        .from('product_variants')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return { id, productId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', data.productId] });
      toast({
        title: 'Berhasil',
        description: 'Varian berhasil dihapus',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Toggle has_variants flag on product
export function useToggleProductVariants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, hasVariants }: { productId: string; hasVariants: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ has_variants: hasVariants })
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
