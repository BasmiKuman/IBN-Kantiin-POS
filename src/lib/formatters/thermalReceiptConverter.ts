/**
 * Thermal Receipt HTML to ESC/POS Converter
 * Optimized for Xiaomi Redmi Pad SE 8.7" with 58mm thermal printer
 * 
 * Converts ThermalReceipt component output to ESC/POS commands
 * for Bluetooth thermal printer printing
 */

import { PrinterCommands } from '@/hooks/useBluetoothPrinter';
import { getReceiptSettings } from './sharedHelpers';

interface ThermalReceiptData {
  transactionNumber: string;
  date: Date;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    variant?: string;
  }>;
  subtotal: number;
  tax: number;
  taxRate?: number;
  total: number;
  paymentMethod: string;
  paymentAmount: number;
  changeAmount: number;
  customerName?: string;
  earnedPoints?: number;
  totalPoints?: number;
  paperWidth?: '58mm' | '80mm';
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  cashierName?: string;
  promotionCode?: string;
  promotionDiscount?: number;
}

/**
 * Format currency to IDR with thousand separator
 */
function formatCurrency(amount: number): string {
  try {
    // Format with thousand separator (Indonesian style: Rp15.000)
    const formatted = amount.toLocaleString('id-ID');
    return 'Rp' + formatted;
  } catch (e) {
    // Fallback: manual thousand separator
    const str = Math.round(amount).toString();
    return 'Rp' + str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}

/**
 * Format date to Indonesian format
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

/**
 * Get payment method label
 */
function getPaymentMethodLabel(method: string): string {
  switch (method.toLowerCase()) {
    case "cash":
    case "tunai":
      return "TUNAI";
    case "qris":
      return "QRIS";
    case "transfer":
      return "TRANSFER";
    default:
      return method.toUpperCase();
  }
}

/**
 * Wrap text to fit paper width
 * Optimized for 58mm (24 chars) and 80mm (32 chars)
 */
function wrapText(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxLength) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      // If single word is too long, force break it
      if (word.length > maxLength) {
        let remaining = word;
        while (remaining.length > maxLength) {
          lines.push(remaining.substring(0, maxLength));
          remaining = remaining.substring(maxLength);
        }
        currentLine = remaining;
      } else {
        currentLine = word;
      }
    }
  });
  if (currentLine) lines.push(currentLine);
  
  return lines;
}

/**
 * Generate thermal receipt ESC/POS commands
 * Optimized for Xiaomi Redmi Pad SE with 58mm thermal printer
 */
export function generateThermalReceipt(data: ThermalReceiptData): string {
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, CUT_PAPER } = PrinterCommands;
  
  // Get settings from localStorage
  const { receiptSettings, storeSettings } = getReceiptSettings();
  
  // Default to 58mm for Xiaomi Redmi Pad SE optimization
  const paperWidth = data.paperWidth || '58mm';
  const maxChars = paperWidth === '58mm' ? 24 : 32;
  const separator = '='.repeat(maxChars);
  const lightSeparator = '-'.repeat(maxChars);
  
  const storeName = data.storeName || storeSettings.name || 'BK POS';
  const storeAddress = data.storeAddress || storeSettings.address || '';
  const storePhone = data.storePhone || storeSettings.phone || '';
  
  let receipt = INIT; // Initialize printer
  
  // Header - Centered (compact) - dari settings
  receipt += ALIGN_CENTER;
  
  // Custom header dari settings (jika ada)
  if (receiptSettings.header && receiptSettings.header.trim()) {
    const headerLines = wrapText(receiptSettings.header, maxChars);
    headerLines.forEach(line => {
      receipt += line + '\n';
    });
  } else {
    // Default: store name
    receipt += storeName + '\n';
  }
  
  // Tagline dari settings (jika ada)
  if (receiptSettings.tagline && receiptSettings.tagline.trim()) {
    const taglineLines = wrapText(receiptSettings.tagline, maxChars);
    taglineLines.forEach(line => {
      receipt += line + '\n';
    });
  }
  
  // Store info (address & phone) - jika ada
  if (storeAddress && storeAddress.trim()) {
    const addressLines = wrapText(storeAddress, maxChars);
    addressLines.forEach(line => {
      receipt += line + '\n';
    });
  }
  if (storePhone && storePhone.trim()) {
    receipt += storePhone + '\n';
  }
  
  receipt += separator + '\n';
  
  // Transaction Info - Left Aligned (compact)
  receipt += ALIGN_LEFT;
  receipt += 'No: ' + data.transactionNumber + '\n';
  receipt += 'Tgl: ' + formatDate(data.date) + '\n';
  if (data.cashierName) receipt += 'Kasir: ' + data.cashierName + '\n';
  if (data.customerName) receipt += 'Cust: ' + data.customerName + '\n';
  receipt += lightSeparator + '\n';
  
  // Items - Compact format
  data.items.forEach((item, index) => {
    let itemName = item.name;
    if (item.variant) itemName += ' - ' + item.variant;
    
    // Wrap long product names
    const nameLines = wrapText(itemName, maxChars);
    nameLines.forEach(line => {
      receipt += line + '\n';
    });
    
    // Compact: qty x price = total on ONE line with proper alignment
    const qtyPrice = item.quantity + 'x' + formatCurrency(item.price);
    const total = formatCurrency(item.subtotal);
    const spaces = ' '.repeat(Math.max(1, maxChars - qtyPrice.length - total.length));
    receipt += qtyPrice + spaces + total + '\n';
    
    // Only add separator between items, not after last item
    if (index < data.items.length - 1) {
      receipt += '\n';
    }
  });
  
  // Totals - Compact (no extra separator)
  receipt += ALIGN_LEFT;
  receipt += lightSeparator + '\n';
  
  // Subtotal
  const subtotalLabel = 'Subtotal';
  const subtotalValue = formatCurrency(data.subtotal);
  const subtotalSpaces = ' '.repeat(Math.max(1, maxChars - subtotalLabel.length - subtotalValue.length));
  receipt += subtotalLabel + subtotalSpaces + subtotalValue + '\n';
  
  // Promotion discount (if any)
  if (data.promotionDiscount && data.promotionDiscount > 0) {
    const promoLabel = data.promotionCode ? `Promo(${data.promotionCode})` : 'Diskon Promo';
    const promoValue = '-' + formatCurrency(data.promotionDiscount);
    const promoSpaces = ' '.repeat(Math.max(1, maxChars - promoLabel.length - promoValue.length));
    receipt += promoLabel + promoSpaces + promoValue + '\n';
  }
  
  // Tax (if any)
  if (data.tax > 0) {
    const taxRate = data.taxRate || 0;
    const taxLabel = taxRate > 0 ? `Pajak(${taxRate}%)` : 'Pajak';
    const taxValue = formatCurrency(data.tax);
    const taxSpaces = ' '.repeat(Math.max(1, maxChars - taxLabel.length - taxValue.length));
    receipt += taxLabel + taxSpaces + taxValue + '\n';
  }
  
  receipt += separator + '\n';
  
  // TOTAL - Bold
  const totalLabel = 'TOTAL';
  const totalValue = formatCurrency(data.total);
  const totalSpaces = ' '.repeat(Math.max(1, maxChars - totalLabel.length - totalValue.length));
  receipt += totalLabel + totalSpaces + totalValue + '\n';
  
  receipt += separator + '\n';
  
  // Payment Info - Compact
  receipt += ALIGN_LEFT;
  const methodLabel = 'Bayar';
  const methodValue = getPaymentMethodLabel(data.paymentMethod);
  const methodSpaces = ' '.repeat(Math.max(1, maxChars - methodLabel.length - methodValue.length));
  receipt += methodLabel + methodSpaces + methodValue + '\n';
  
  const paymentMethodLower = data.paymentMethod.toLowerCase();
  if (paymentMethodLower === "cash" || paymentMethodLower === "tunai") {
    const payLabel = 'Uang';
    const payValue = formatCurrency(data.paymentAmount);
    const paySpaces = ' '.repeat(Math.max(1, maxChars - payLabel.length - payValue.length));
    receipt += payLabel + paySpaces + payValue + '\n';
    
    const changeLabel = 'Kembali';
    const changeValue = formatCurrency(data.changeAmount);
    const changeSpaces = ' '.repeat(Math.max(1, maxChars - changeLabel.length - changeValue.length));
    receipt += changeLabel + changeSpaces + changeValue + '\n';
  }
  
  // Loyalty Points (if any) - Compact
  if (data.earnedPoints && data.earnedPoints > 0) {
    receipt += lightSeparator + '\n';
    
    receipt += ALIGN_LEFT;
    const pointsLabel = 'Poin+';
    const pointsValue = String(data.earnedPoints);
    const pointsSpaces = ' '.repeat(Math.max(1, maxChars - pointsLabel.length - pointsValue.length));
    receipt += pointsLabel + pointsSpaces + pointsValue + '\n';
    
    if (data.totalPoints !== undefined) {
      const totalPointsLabel = 'Total Poin';
      const totalPointsValue = String(data.totalPoints);
      const totalPointsSpaces = ' '.repeat(Math.max(1, maxChars - totalPointsLabel.length - totalPointsValue.length));
      receipt += totalPointsLabel + totalPointsSpaces + totalPointsValue + '\n';
    }
  }
  
  receipt += separator + '\n';
  
  // Footer - Compact - dari settings
  receipt += ALIGN_CENTER;
  
  if (receiptSettings.footer && receiptSettings.footer.trim()) {
    // Custom footer dari settings
    const footerLines = wrapText(receiptSettings.footer, maxChars);
    footerLines.forEach(line => {
      receipt += line + '\n';
    });
  } else {
    // Default footer
    receipt += 'Terima Kasih!\n';
  }
  
  receipt += '\n';
  receipt += '\n';
  receipt += '\n';

  // Branding - IMPORTANT!
  receipt += 'Powered by BK POS\n';
  receipt += '\n';
  receipt += '\n';
  receipt += '\n';
  
  // Cut paper
  receipt += CUT_PAPER;
  
  console.log('=== THERMAL RECEIPT DEBUG ===');
  console.log('Receipt length:', receipt.length);
  console.log('Last 200 chars:', receipt.slice(-200));
  console.log('Footer check - includes "Powered by BK POS":', receipt.includes('Powered by BK POS'));
  
  return receipt;
}

/**
 * Generate thermal daily report ESC/POS commands
 */
interface ThermalReportData {
  date: Date;
  cashierName: string;
  shift?: string;
  totalTransactions: number;
  totalRevenue: number;
  avgTransaction: number;
  cashAmount: number;
  cashCount: number;
  qrisAmount: number;
  qrisCount: number;
  transferAmount: number;
  transferCount: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  foodRevenue?: number;
  foodCount?: number;
  drinkRevenue?: number;
  drinkCount?: number;
  totalCost?: number;
  profit?: number;
  margin?: number;
  notes?: string[];
  paperWidth?: '58mm' | '80mm';
  storeName?: string;
  totalPromotionDiscount?: number;
  transactionsWithPromo?: number;
}

export function generateThermalReport(data: ThermalReportData): string {
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, CUT_PAPER } = PrinterCommands;
  
  const paperWidth = data.paperWidth || '58mm';
  const maxChars = paperWidth === '58mm' ? 24 : 32;
  const separator = '='.repeat(maxChars);
  
  const storeName = data.storeName || 'BASMIKUMAN POS';
  
  let report = INIT;
  
  // Header
  report += ALIGN_CENTER;
  report += separator + '\n';
  report += 'LAPORAN HARIAN\n';
  report += storeName + '\n';
  report += separator + '\n';
  report += '\n';
  
  // Report Info
  report += ALIGN_LEFT;
  const formatDateLong = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(data.date);
  const formatTime = new Intl.DateTimeFormat("id-ID", {
    timeStyle: "medium",
  }).format(new Date());
  
  report += 'Tanggal: ' + formatDateLong + '\n';
  report += 'Waktu: ' + formatTime + '\n';
  report += 'Kasir: ' + data.cashierName + '\n';
  if (data.shift) report += 'Shift: ' + data.shift + '\n';
  report += '\n';
  
  // Summary
  report += ALIGN_CENTER;
  report += separator + '\n';
  report += 'RINGKASAN\n';
  report += separator + '\n';
  
  report += ALIGN_LEFT;
  report += 'Total Transaksi: ' + data.totalTransactions + '\n';
  report += 'Total Pendapatan:\n';
  report += '  ' + formatCurrency(data.totalRevenue) + '\n';
  report += 'Rata-rata/Trx:\n';
  report += '  ' + formatCurrency(data.avgTransaction) + '\n';
  report += '\n';
  
  // Payment Methods
  report += ALIGN_CENTER;
  report += separator + '\n';
  report += 'METODE BAYAR\n';
  report += separator + '\n';
  
  report += ALIGN_LEFT;
  report += `Tunai (${data.cashCount}x)\n`;
  report += '  ' + formatCurrency(data.cashAmount) + '\n';
  report += `QRIS (${data.qrisCount}x)\n`;
  report += '  ' + formatCurrency(data.qrisAmount) + '\n';
  report += `Transfer (${data.transferCount}x)\n`;
  report += '  ' + formatCurrency(data.transferAmount) + '\n';
  report += '\n';
  
  // Top Products
  report += ALIGN_CENTER;
  report += separator + '\n';
  report += 'TOP PRODUK\n';
  report += separator + '\n';
  
  report += ALIGN_LEFT;
  const topCount = paperWidth === '58mm' ? 5 : 10;
  data.topProducts.slice(0, topCount).forEach((product, index) => {
    const nameLines = wrapText(product.name, maxChars - 3);
    nameLines.forEach((line, i) => {
      if (i === 0) {
        report += `${index + 1}. ${line}\n`;
      } else {
        report += `   ${line}\n`;
      }
    });
    report += `  ${product.quantity} pcs - ` + formatCurrency(product.revenue) + '\n';
    report += '\n';
  });
  
  // Category Breakdown
  if (data.foodRevenue || data.drinkRevenue) {
    report += ALIGN_CENTER;
    report += separator + '\n';
    report += 'KATEGORI\n';
    report += separator + '\n';
    
    report += ALIGN_LEFT;
    if (data.foodRevenue && data.foodRevenue > 0) {
      report += `Makanan (${data.foodCount}x)\n`;
      report += '  ' + formatCurrency(data.foodRevenue) + '\n';
    }
    if (data.drinkRevenue && data.drinkRevenue > 0) {
      report += `Minuman (${data.drinkCount}x)\n`;
      report += '  ' + formatCurrency(data.drinkRevenue) + '\n';
    }
    report += '\n';
  }
  
  // Profit
  if (data.profit !== undefined && data.totalCost !== undefined) {
    report += ALIGN_CENTER;
    report += separator + '\n';
    report += 'PROFIT\n';
    report += separator + '\n';
    
    report += ALIGN_LEFT;
    report += 'Modal:\n';
    report += '  ' + formatCurrency(data.totalCost) + '\n';
    report += 'Profit Kotor:\n';
    report += '  ' + formatCurrency(data.profit) + '\n';
    if (data.margin !== undefined) {
      report += `Margin: ${data.margin.toFixed(1)}%\n`;
    }
    report += '\n';
  }
  
  // Promotion Summary
  if (data.totalPromotionDiscount && data.totalPromotionDiscount > 0) {
    report += ALIGN_CENTER;
    report += separator + '\n';
    report += 'PROMOSI\n';
    report += separator + '\n';
    
    report += ALIGN_LEFT;
    report += 'Total Diskon Promo:\n';
    report += '  ' + formatCurrency(data.totalPromotionDiscount) + '\n';
    if (data.transactionsWithPromo && data.totalTransactions) {
      report += `Transaksi dgn Promo:\n`;
      report += `  ${data.transactionsWithPromo}/${data.totalTransactions} transaksi\n`;
    }
    report += '\n';
  }
  
  // Notes
  if (data.notes && data.notes.length > 0) {
    report += ALIGN_CENTER;
    report += separator + '\n';
    report += 'CATATAN\n';
    report += separator + '\n';
    
    report += ALIGN_LEFT;
    data.notes.forEach(note => {
      const noteLines = wrapText(`- ${note}`, maxChars);
      noteLines.forEach((line, i) => {
        if (i === 0) {
          report += line + '\n';
        } else {
          report += '  ' + line + '\n';
        }
      });
    });
    report += '\n';
  }
  
  // Footer
  report += ALIGN_CENTER;
  report += separator + '\n';
  report += 'Laporan Valid\n';
  report += 'Dicetak Otomatis\n';
  report += separator + '\n';
  report += '\n';
  report += 'Powered by BasmiKuman POS\n';
  report += '(c) ' + new Date().getFullYear() + '\n';
  report += '\n';
  
  report += CUT_PAPER;
  
  return report;
}
