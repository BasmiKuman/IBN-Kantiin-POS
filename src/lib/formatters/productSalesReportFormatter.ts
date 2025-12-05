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
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, BOLD_ON, BOLD_OFF, LINE_FEED, SEPARATOR, SEPARATOR_BOLD, LINE_FEED_3, CUT_PAPER } = PrinterCommands;
  const { receiptSettings } = getReceiptSettings();
  
  let receipt = INIT;
  
  // Header - Centered
  receipt += ALIGN_CENTER + LINE_FEED;
  receipt += SEPARATOR_BOLD;
  receipt += BOLD_ON;
  receipt += 'BK POS\n';
  receipt += BOLD_OFF;
  receipt += SEPARATOR_BOLD;
  receipt += LINE_FEED;
  
  // Report Title
  receipt += BOLD_ON;
  receipt += 'LAPORAN PENJUALAN\n';
  receipt += 'PRODUK\n';
  receipt += BOLD_OFF;
  receipt += LINE_FEED;
  
  // Period - Left aligned
  receipt += ALIGN_LEFT;
  receipt += `Periode: ${data.period}\n`;
  if (data.startDate && data.endDate) {
    receipt += `Dari: ${new Date(data.startDate).toLocaleDateString('id-ID')}\n`;
    receipt += `Sampai: ${new Date(data.endDate).toLocaleDateString('id-ID')}\n`;
  } else {
    receipt += `Tanggal: ${new Date().toLocaleDateString('id-ID')}\n`;
  }
  receipt += LINE_FEED;
  receipt += SEPARATOR_BOLD;
  
  // Products List
  receipt += LINE_FEED;
  receipt += BOLD_ON;
  receipt += 'DETAIL PRODUK:\n';
  receipt += BOLD_OFF;
  receipt += SEPARATOR;
  
  data.products.forEach((product) => {
    const hargaSatuan = product.total_quantity > 0 
      ? Math.round(product.total_revenue / product.total_quantity)
      : 0;
    
    receipt += LINE_FEED;
    
    // Product name - wrap if too long
    const productLines = wrapText(product.product_name, 24);
    productLines.forEach((line, idx) => {
      if (idx === 0) {
        receipt += BOLD_ON + line + '\n' + BOLD_OFF;
      } else {
        receipt += line + '\n';
      }
    });
    
    // Quantity and unit price
    receipt += `${product.total_quantity} x Rp${hargaSatuan.toLocaleString('id-ID')}\n`;
    
    // Total for this product - using padText manually
    const totalLabel = 'Total:';
    const totalValue = `Rp${product.total_revenue.toLocaleString('id-ID')}`;
    const padding = 24 - totalLabel.length - totalValue.length;
    receipt += totalLabel + ' '.repeat(Math.max(1, padding)) + totalValue + '\n';
  });
  
  receipt += LINE_FEED;
  receipt += SEPARATOR_BOLD;
  
  // Summary
  receipt += LINE_FEED;
  receipt += BOLD_ON;
  receipt += 'RINGKASAN PENJUALAN\n';
  receipt += BOLD_OFF;
  receipt += LINE_FEED;
  
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
  
  receipt += LINE_FEED;
  receipt += SEPARATOR_BOLD;
  
  // GRAND TOTAL - Make it prominent
  receipt += LINE_FEED;
  receipt += BOLD_ON;
  const grandLabel = 'TOTAL PENJUALAN:';
  const grandValue = `Rp${data.totalRevenue.toLocaleString('id-ID')}`;
  const grandPadding = 24 - grandLabel.length - grandValue.length;
  receipt += grandLabel + ' '.repeat(Math.max(1, grandPadding)) + grandValue + '\n';
  receipt += BOLD_OFF;
  receipt += SEPARATOR_BOLD;
  receipt += LINE_FEED;
  
  // Footer - Centered & wrapped
  receipt += LINE_FEED + LINE_FEED;
  receipt += ALIGN_CENTER;
  receipt += SEPARATOR;
  
  const footerLines = wrapText(receiptSettings.footer, 24);
  receipt += BOLD_ON;
  footerLines.forEach(line => {
    receipt += `${line}\n`;
  });
  receipt += BOLD_OFF;
  
  if (data.cashierName) {
    receipt += LINE_FEED;
    receipt += `Dicetak: ${data.cashierName}\n`;
  }
  
  receipt += SEPARATOR;
  receipt += LINE_FEED_3;
  
  // Cut paper
  receipt += CUT_PAPER;
  
  return receipt;
}
