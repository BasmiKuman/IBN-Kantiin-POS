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
  totalPromotionDiscount?: number;
  transactionsWithPromo?: number;
  totalTransactions?: number;
  cashTransactionCount?: number;
  qrisTransactionCount?: number;
  cashTotal?: number;
  qrisTotal?: number;
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
  
  // Safety check: ensure we don't overflow
  const maxProducts = 50; // Limit to prevent overflow
  const productsToShow = data.products.slice(0, maxProducts);
  
  if (data.products.length > maxProducts) {
    console.warn(`⚠️ Showing only ${maxProducts} of ${data.products.length} products`);
  }
  
  productsToShow.forEach((product, idx) => {
    console.log(`Product ${idx}:`, product.product_name, product.total_quantity, product.total_revenue);
    
    // Safety check for null/undefined values
    const quantity = product.total_quantity || 0;
    const revenue = product.total_revenue || 0;
    const productName = product.product_name || 'Unknown Product';
    
    const hargaSatuan = quantity > 0 
      ? Math.round(revenue / quantity)
      : 0;
    
    // Wrap long product names (max 24 chars for 58mm)
    const nameLines = wrapText(productName, 24);
    nameLines.forEach((line, i) => {
      if (i === 0) {
        receipt += `${idx + 1}. ${line}\n`;
      } else {
        receipt += `   ${line}\n`;
      }
    });
    
    // Qty x price = total - with proper currency formatting
    const qtyText = quantity + ' pcs';
    const priceText = formatCurrency(hargaSatuan);
    const totalText = formatCurrency(revenue);
    
    receipt += '   ' + qtyText + ' x ' + priceText + '\n';
    receipt += '   = ' + totalText + '\n';
    receipt += '\n';
  });
  
  console.log('Products formatted, adding summary...');
  
  receipt += '\n';
  receipt += '========================\n';
  
  // Summary - simple and aligned (force LEFT align)
  receipt += ALIGN_LEFT;
  receipt += 'RINGKASAN\n';
  receipt += '------------------------\n';
  
  // Safety checks for totals
  const totalProducts = data.products?.length || 0;
  const totalItems = data.totalItems || 0;
  const totalRevenue = data.totalRevenue || 0;
  
  console.log('Summary values:', { totalProducts, totalItems, totalRevenue });
  
  const jenisLabel = 'Jenis Produk';
  const jenisValue = String(totalProducts);
  const jenisSpaces = ' '.repeat(Math.max(1, 24 - jenisLabel.length - jenisValue.length));
  receipt += jenisLabel + jenisSpaces + jenisValue + '\n';
  
  const itemLabel = 'Total Item';
  const itemValue = totalItems + ' pcs';
  const itemSpaces = ' '.repeat(Math.max(1, 24 - itemLabel.length - itemValue.length));
  receipt += itemLabel + itemSpaces + itemValue + '\n';
  
  // Add promotion info if any
  if (data.totalPromotionDiscount && data.totalPromotionDiscount > 0) {
    receipt += '------------------------\n';
    
    const promoLabel = 'Diskon Promo';
    const promoValue = formatCurrency(data.totalPromotionDiscount);
    const promoSpaces = ' '.repeat(Math.max(1, 24 - promoLabel.length - promoValue.length));
    receipt += promoLabel + promoSpaces + promoValue + '\n';
    
    if (data.transactionsWithPromo && data.totalTransactions) {
      const promoTrxLabel = 'Trx dgn Promo';
      const promoTrxValue = `${data.transactionsWithPromo}/${data.totalTransactions}`;
      const promoTrxSpaces = ' '.repeat(Math.max(1, 24 - promoTrxLabel.length - promoTrxValue.length));
      receipt += promoTrxLabel + promoTrxSpaces + promoTrxValue + '\n';
    }
  }
  
  receipt += '------------------------\n';
  
  // Grand total - with proper alignment
  const totalLabel = 'TOTAL';
  const totalValue = formatCurrency(totalRevenue);
  const totalSpaces = ' '.repeat(Math.max(1, 24 - totalLabel.length - totalValue.length));
  receipt += totalLabel + totalSpaces + totalValue + '\n';
  
  receipt += '========================\n';
  receipt += '\n';
  
  console.log('Grand total added:', totalRevenue);
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
