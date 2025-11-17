import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  transaction_number: string;
  customer_id: string | null;
  cashier_id: string | null;
  subtotal: number;
  discount: number | null;
  tax: number | null;
  total: number;
  payment_method: 'cash' | 'debit' | 'credit' | 'qris' | 'transfer';
  payment_amount: number;
  change_amount: number | null;
  status: 'completed' | 'pending' | 'cancelled' | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  variant_id?: string | null;
  variant_name?: string | null;
  created_at: string;
}

export function useTransactions(limit?: number) {
  return useQuery({
    queryKey: ['transactions', limit],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          customers (
            name,
            phone,
            tier
          ),
          employees:cashier_id (
            name
          ),
          transaction_items (
            id,
            product_id,
            product_name,
            quantity,
            unit_price,
            subtotal,
            variant_id,
            variant_name,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          customers (
            name,
            phone,
            tier
          ),
          employees:cashier_id (
            name
          ),
          transaction_items (
            *,
            products (
              name,
              sku
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      transaction, 
      items 
    }: { 
      transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>; 
      items: Omit<TransactionItem, 'id' | 'transaction_id' | 'created_at'>[];
    }) => {
      // Create transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create transaction items
      const transactionItems = items.map(item => ({
        ...item,
        transaction_id: transactionData.id,
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (product) {
          await supabase
            .from('products')
            .update({ stock: product.stock - item.quantity })
            .eq('id', item.product_id);
        }
      }

      return transactionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Transaksi Berhasil',
        description: 'Transaksi telah berhasil disimpan',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Transaksi Gagal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Generate transaction number
export function generateTransactionNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TRX${year}${month}${day}${random}`;
}

// Get daily sales
export function useDailySales(date?: string) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['daily-sales', targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('total')
        .gte('created_at', `${targetDate}T00:00:00`)
        .lte('created_at', `${targetDate}T23:59:59`)
        .eq('status', 'completed');

      if (error) throw error;
      
      const totalSales = data.reduce((sum, t) => sum + parseFloat(t.total.toString()), 0);
      return {
        total: totalSales,
        count: data.length,
        transactions: data,
      };
    },
  });
}

// Get sales by date range
export function useSalesByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['sales-range', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Get product sales analytics
export function useProductSales(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['product-sales', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('transaction_items')
        .select(`
          *,
          transactions!inner (
            created_at,
            status,
            transaction_number
          ),
          products (
            name,
            sku,
            category_id,
            categories (
              name
            )
          )
        `)
        .eq('transactions.status', 'completed');

      // Filter by date range if provided
      if (startDate && endDate) {
        query = query
          .gte('transactions.created_at', startDate)
          .lte('transactions.created_at', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Product sales query error:', error);
        throw error;
      }

      // Aggregate data by product
      const productMap = new Map();
      
      data?.forEach((item: any) => {
        const productId = item.product_id;
        const productName = item.product_name || item.products?.name;
        const variantName = item.variant_name;
        const displayName = variantName ? `${productName} (${variantName})` : productName;
        
        // Use product_id + variant_id as unique key
        const key = `${productId}-${item.variant_id || 'no-variant'}`;
        
        if (!productMap.has(key)) {
          productMap.set(key, {
            product_id: productId,
            product_name: displayName,
            variant_id: item.variant_id,
            variant_name: variantName,
            sku: item.products?.sku || '',
            category: item.products?.categories?.name || 'Uncategorized',
            total_quantity: 0,
            total_sales: 0,
            transaction_count: 0,
            avg_price: 0,
            last_sold: null,
            transactions: [],
          });
        }
        
        const product = productMap.get(key);
        product.total_quantity += item.quantity;
        product.total_sales += item.subtotal;
        product.transaction_count += 1;
        product.avg_price = product.total_sales / product.total_quantity;
        product.last_sold = item.transactions?.created_at;
        product.transactions.push({
          transaction_number: item.transactions?.transaction_number,
          date: item.transactions?.created_at,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        });
      });

      // Convert map to array and sort by total sales
      const productSales = Array.from(productMap.values()).sort(
        (a, b) => b.total_sales - a.total_sales
      );

      return productSales;
    },
  });
}
