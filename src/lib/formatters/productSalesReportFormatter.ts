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
  receipt += '========================\n';
  receipt += 'BK POS\n';
  receipt += '========================\n';
  receipt += '\n';
  
  // Report Title
  receipt += 'LAPORAN PENJUALAN\n';
  receipt += 'PRODUK\n';
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
  receipt += '\n';
  receipt += '========================\n';
  
  // Products List - NO header, direct to products
  receipt += '\n';
  
  console.log('Formatting', data.products.length, 'products...');
  data.products.forEach((product, idx) => {
    console.log(`Product ${idx}:`, product.product_name, product.total_quantity, product.total_revenue);
    
    const hargaSatuan = product.total_quantity > 0 
      ? Math.round(product.total_revenue / product.total_quantity)
      : 0;
    
    // Product name - direct without formatting
    receipt += `${product.product_name}\n`;
    
    // Quantity and price per item
    receipt += `${product.total_quantity} x Rp${hargaSatuan.toLocaleString('id-ID')}\n`;
    receipt += '\n';
  });
  
  console.log('Products formatted, adding summary...');
  
  receipt += '========================\n';
  
  // Summary - simplified for Android
  receipt += '\n';
  receipt += 'RINGKASAN PENJUALAN\n';
  receipt += '\n';
  
  // Total jenis produk
  const jenisLabel = 'Total Jenis Produk:';
  const jenisValue = `${data.products.length}`;
  const jenisPadding = 24 - jenisLabel.length - jenisValue.length;
  receipt += jenisLabel + ' '.repeat(Math.max(1, jenisPadding)) + jenisValue + '\n';
  
  // Total item terjual
  const itemLabel = 'Total Item Terjual:';
  const itemValue = `${data.totalItems}`;
  const itemPadding = 24 - itemLabel.length - itemValue.length;
  receipt += itemLabel + ' '.repeat(Math.max(1, itemPadding)) + itemValue + '\n';
  
  receipt += '\n';
  receipt += '========================\n';
  
  // GRAND TOTAL - simplified for Android
  receipt += '\n';
  const grandLabel = 'TOTAL PENJUALAN:';
  const grandValue = `Rp${data.totalRevenue.toLocaleString('id-ID')}`;
  const grandPadding = 24 - grandLabel.length - grandValue.length;
  receipt += grandLabel + ' '.repeat(Math.max(1, grandPadding)) + grandValue + '\n';
  receipt += '========================\n';
  
  console.log('Grand total added:', grandValue);
  console.log('Receipt length:', receipt.length);
  
  // Footer - simplified for Android
  receipt += '\n\n';
  receipt += ALIGN_CENTER;
  
  receipt += `Dicetak: ${new Date().toLocaleString('id-ID')}\n`;
  if (data.cashierName) {
    receipt += `Oleh: ${data.cashierName}\n`;
  }
  
  receipt += '\n\n\n';
  
  // Cut paper
  receipt += CUT_PAPER;
  
  console.log('=== PRODUCT SALES REPORT END ===');
  console.log('Final receipt length:', receipt.length);
  
  return receipt;
}
