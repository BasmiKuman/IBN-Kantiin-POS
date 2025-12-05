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
  
  console.log('Formatting', data.products.length, 'products...');
  data.products.forEach((product, idx) => {
    console.log(`Product ${idx}:`, product.product_name, product.total_quantity, product.total_revenue);
    
    const hargaSatuan = product.total_quantity > 0 
      ? Math.round(product.total_revenue / product.total_quantity)
      : 0;
    
    // Simple format - no separator lines
    receipt += product.product_name + '\n';
    receipt += product.total_quantity + ' x Rp' + hargaSatuan + ' = Rp' + product.total_revenue + '\n';
  });
  
  console.log('Products formatted, adding summary...');
  
  receipt += '------------------------\n';
  
  // Summary - compact
  receipt += 'RINGKASAN:\n';
  receipt += 'Jenis Produk: ' + data.products.length + '\n';
  receipt += 'Total Item: ' + data.totalItems + '\n';
  receipt += 'TOTAL PENJUALAN: Rp' + data.totalRevenue + '\n';
  receipt += '------------------------\n';
  
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
