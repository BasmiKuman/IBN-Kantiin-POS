import { PrinterCommands } from '@/hooks/useBluetoothPrinter';
import { wrapText, formatCurrency, getReceiptSettings } from './sharedHelpers';

export interface ProductSalesItem {
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface ProductSalesReportData {
  period: string;
  startDate?: string;
  endDate?: string;
  products: ProductSalesItem[];
  totalItems: number;
  totalRevenue: number;
  cashierName?: string;
}

// Generate Product Sales Report
export function generateProductSalesReport(data: ProductSalesReportData): string {
  console.log('=== PRODUCT SALES REPORT START ===');
  console.log('Products count:', data.products?.length);
  console.log('Total Revenue:', data.totalRevenue);
  console.log('Total Items:', data.totalItems);
  
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, CUT_PAPER } = PrinterCommands;
  const { receiptSettings } = getReceiptSettings();
  
  let receipt = INIT;
  
  // Header - Centered
  receipt += ALIGN_CENTER + '\n';
  receipt += 'BK POS\n';
  receipt += 'LAPORAN PENJUALAN PRODUK\n';
  receipt += '\n';
  
  // Period - Left aligned
  receipt += ALIGN_LEFT;
  receipt += `Periode: ${data.period}\n`;
  if (data.startDate && data.endDate) {
    receipt += `Dari: ${new Date(data.startDate).toLocaleDateString('id-ID')}\n`;
    receipt += `Sampai: ${new Date(data.endDate).toLocaleDateString('id-ID')}\n`;
  } else {
    receipt += `Tanggal: ${new Date().toLocaleDateString('id-ID')}\n`;
  }
  receipt += '------------------------\n';
  receipt += '\n';
  
  // Products List
  receipt += 'PRODUK TERJUAL:\n';
  receipt += '\n';
  
  console.log('Formatting', data.products.length, 'products...');
  data.products.forEach((product, idx) => {
    console.log(`Product ${idx}:`, product.product_name, product.total_quantity, product.total_revenue);
    
    const hargaSatuan = product.total_quantity > 0 
      ? Math.round(product.total_revenue / product.total_quantity)
      : 0;
    
    // Product name on first line
    receipt += product.product_name + '\n';
    
    // Qty x price = total on second line
    receipt += '  ' + product.total_quantity + ' x Rp' + hargaSatuan + ' = Rp' + product.total_revenue + '\n';
    
    // Blank line after each product (no separator lines)
    receipt += '\n';
  });
  
  console.log('Products formatted, adding summary...');
  
  receipt += '------------------------\n';
  
  // Summary - right aligned
  receipt += 'RINGKASAN:\n';
  
  let label = 'Jenis Produk:';
  let value = String(data.products.length);
  let spaces = 24 - label.length - value.length;
  receipt += label + ' '.repeat(Math.max(1, spaces)) + value + '\n';
  
  label = 'Total Item:';
  value = String(data.totalItems);
  spaces = 24 - label.length - value.length;
  receipt += label + ' '.repeat(Math.max(1, spaces)) + value + '\n';
  
  label = 'TOTAL PENJUALAN:';
  value = 'Rp' + data.totalRevenue;
  spaces = 24 - label.length - value.length;
  receipt += label + ' '.repeat(Math.max(1, spaces)) + value + '\n';
  receipt += '------------------------\n';
  receipt += '\n';
  
  console.log('Grand total added:', data.totalRevenue);
  console.log('Receipt length:', receipt.length);
  
  // Footer - compact
  receipt += '\n';
  receipt += ALIGN_CENTER;
  receipt += `Dicetak: ${new Date().toLocaleString('id-ID')}\n`;
  if (data.cashierName) {
    receipt += `Oleh: ${data.cashierName}\n`;
  }
  receipt += '\n';
  
  // Cut paper
  receipt += CUT_PAPER;
  
  console.log('=== PRODUCT SALES REPORT END ===');
  console.log('Final receipt length:', receipt.length);
  
  return receipt;
}
