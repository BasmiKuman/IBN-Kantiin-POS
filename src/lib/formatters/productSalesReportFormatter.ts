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
  
  // Products List - Centered Header
  receipt += ALIGN_CENTER;
  receipt += 'PRODUK TERJUAL\n';
  receipt += ALIGN_LEFT;
  receipt += '------------------------\n';
  
  console.log('Formatting', data.products.length, 'products...');
  data.products.forEach((product, idx) => {
    console.log(`Product ${idx}:`, product.product_name, product.total_quantity, product.total_revenue);
    
    const hargaSatuan = product.total_quantity > 0 
      ? Math.round(product.total_revenue / product.total_quantity)
      : 0;
    
    // Wrap long product names (max 24 chars for 58mm)
    const nameLines = wrapText(product.product_name, 24);
    nameLines.forEach((line, i) => {
      if (i === 0) {
        receipt += `${idx + 1}. ${line}\n`;
      } else {
        receipt += `   ${line}\n`;
      }
    });
    
    // Qty x price = total - with proper currency formatting
    const qtyText = product.total_quantity + ' pcs';
    const priceText = formatCurrency(hargaSatuan);
    const totalText = formatCurrency(product.total_revenue);
    
    receipt += '   ' + qtyText + ' x ' + priceText + '\n';
    receipt += '   = ' + totalText + '\n';
    receipt += '\n';
  });
  
  console.log('Products formatted, adding summary...');
  
  receipt += '========================\n';
  
  // Summary - centered header, left-aligned content
  receipt += ALIGN_CENTER;
  receipt += 'RINGKASAN\n';
  receipt += ALIGN_LEFT;
  receipt += '------------------------\n';
  
  receipt += 'Jenis Produk: ' + data.products.length + '\n';
  receipt += 'Total Item: ' + data.totalItems + ' pcs\n';
  receipt += '\n';
  
  // Grand total - emphasized
  let label = 'TOTAL PENJUALAN:';
  let value = 'Rp ' + data.totalRevenue;
  let spaces = 24 - label.length - value.length;
  receipt += label + ' '.repeat(Math.max(1, spaces)) + value + '\n';
  receipt += '========================\n';
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
