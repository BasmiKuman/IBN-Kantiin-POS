import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  price: number;
  cost: number | null;
  stock: number;
  min_stock: number | null;
  image_url: string | null;
  is_active: boolean | null;
  has_variants: boolean | null;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'categories'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Berhasil',
        description: 'Produk berhasil ditambahkan',
      });
    },
    onError: (error: any) => {
      let errorMessage = error.message;
      
      // Handle specific error codes
      if (error.code === '23505') {
        // Unique constraint violation
        if (error.message.includes('sku')) {
          errorMessage = 'SKU sudah digunakan (mungkin oleh produk yang sudah dihapus). Gunakan SKU yang berbeda atau kosongkan untuk auto-generate.';
        } else {
          errorMessage = 'Data duplikat terdeteksi. Periksa kembali input Anda.';
        }
      } else if (error.message.includes('409')) {
        errorMessage = 'SKU sudah digunakan (mungkin oleh produk yang dihapus). Kosongkan SKU untuk auto-generate atau gunakan SKU lain.';
      }

      toast({
        title: 'Gagal',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Berhasil',
        description: 'Produk berhasil diupdate',
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

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Berhasil',
        description: 'Produk berhasil dihapus',
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

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ stock: quantity })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal Update Stok',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
