import { PrinterCommands } from '@/hooks/useBluetoothPrinter';
import { padText, wrapText, formatCurrency, getReceiptSettings } from './sharedHelpers';

export interface CashierReceiptItem {
  name: string;
  quantity: number;
  price: number;
  variant?: string;
}

export interface CashierReceiptData {
  orderNumber: string;
  items: CashierReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashierName?: string;
  customerName?: string;
  date: Date;
}

// Generate Cashier Receipt (untuk kasir/customer)
export function generateCashierReceipt(data: CashierReceiptData): string {
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, BOLD_ON, BOLD_OFF, LINE_FEED, SEPARATOR, SEPARATOR_BOLD, CUT_PAPER, LINE_FEED_3 } = PrinterCommands;
  const { receiptSettings, storeSettings } = getReceiptSettings();
  
  // Debug log
  console.log('=== CASHIER RECEIPT DATA ===');
  console.log('Items count:', data.items?.length || 0);
  console.log('Items:', data.items);
  console.log('Total:', data.total);
  console.log('Payment Method:', data.paymentMethod);
  
  let receipt = INIT; // Initialize printer
  
  // Header - Centered
  receipt += ALIGN_CENTER + LINE_FEED;
  receipt += SEPARATOR_BOLD;
  receipt += BOLD_ON;
  receipt += 'BK POS\n';
  receipt += BOLD_OFF;
  receipt += SEPARATOR_BOLD;
  receipt += LINE_FEED;
  
  // Store Header (dari settings) - word wrap jika perlu
  receipt += BOLD_ON;
  const headerLines = wrapText(receiptSettings.header, 24);
  headerLines.forEach(line => {
    receipt += `${line}\n`;
  });
  receipt += BOLD_OFF;
  
  // Tagline (dari settings) - word wrap jika perlu
  if (receiptSettings.tagline) {
    const taglineLines = wrapText(receiptSettings.tagline, 24);
    taglineLines.forEach(line => {
      receipt += `${line}\n`;
    });
  }
  
  // Store Info (dari settings) - word wrap jika perlu
  const addressLines = wrapText(storeSettings.address, 24);
  addressLines.forEach(line => {
    receipt += `${line}\n`;
  });
  if (storeSettings.phone) {
    receipt += `Telp: ${storeSettings.phone}\n`;
  }
  receipt += LINE_FEED;
  receipt += SEPARATOR_BOLD;
  
  // Order info - Left aligned
  receipt += ALIGN_LEFT + LINE_FEED;
  receipt += BOLD_ON;
  receipt += `Order #${data.orderNumber}\n`;
  receipt += BOLD_OFF;
  receipt += `${data.date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${data.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}\n`;
  if (data.cashierName) {
    receipt += `Kasir: ${data.cashierName}\n`;
  }
  if (data.customerName) {
    receipt += `Customer: ${data.customerName}\n`;
  }
  receipt += LINE_FEED;
  receipt += SEPARATOR_BOLD;
  
  // Items section - ALWAYS show, even if empty
  receipt += LINE_FEED;
  receipt += BOLD_ON;
  receipt += 'DETAIL PESANAN:\n';
  receipt += BOLD_OFF;
  receipt += SEPARATOR;
  receipt += LINE_FEED;
  
  // Check if items exist and has length
  if (data.items && data.items.length > 0) {
    // Items with detail format
    data.items.forEach((item) => {
      // Check if item.name already contains variant in parentheses
      const hasVariantInName = item.name.includes('(') && item.name.includes(')');
      const itemName = (!hasVariantInName && item.variant) ? `${item.name} (${item.variant})` : item.name;
      
      // Item name - wrap if too long
      const itemLines = wrapText(itemName, 24);
      itemLines.forEach((line, idx) => {
        if (idx === 0) {
          receipt += BOLD_ON + line + '\n' + BOLD_OFF;
        } else {
          receipt += line + '\n';
        }
      });
      
      // Quantity, price, and subtotal on one line
      const qtyPrice = `${item.quantity} x ${formatCurrency(item.price)}`;
      const subtotal = formatCurrency(item.price * item.quantity);
      receipt += padText(`  ${qtyPrice}`, subtotal) + '\n';
      receipt += LINE_FEED;
    });
  } else {
    receipt += 'Tidak ada item\n';
    receipt += LINE_FEED;
  }
  
  receipt += SEPARATOR;
  
  // Totals with better formatting
  receipt += LINE_FEED;
  receipt += padText('Subtotal:', formatCurrency(data.subtotal)) + '\n';
  
  if (data.tax > 0) {
    receipt += padText('Pajak:', formatCurrency(data.tax)) + '\n';
  }
  
  receipt += LINE_FEED;
  receipt += SEPARATOR_BOLD;
  receipt += BOLD_ON;
  receipt += padText('TOTAL:', formatCurrency(data.total)) + '\n';
  receipt += BOLD_OFF;
  receipt += SEPARATOR_BOLD;
  
  // Payment method
  receipt += LINE_FEED;
  const paymentLabels: Record<string, string> = {
    cash: 'Tunai',
    qris: 'QRIS',
    transfer: 'Transfer Bank',
    debit: 'Kartu Debit',
    credit: 'Kartu Kredit',
  };
  receipt += BOLD_ON;
  receipt += `Pembayaran: ${paymentLabels[data.paymentMethod] || data.paymentMethod}\n`;
  receipt += BOLD_OFF;
  
  // Footer (dari settings) - centered & word wrap
  receipt += LINE_FEED + LINE_FEED;
  receipt += ALIGN_CENTER;
  receipt += SEPARATOR;
  const footerLines = wrapText(receiptSettings.footer, 24);
  receipt += BOLD_ON;
  footerLines.forEach(line => {
    receipt += `${line}\n`;
  });
  receipt += BOLD_OFF;
  receipt += 'Terima kasih!\n';
  receipt += SEPARATOR;
  receipt += LINE_FEED_3;
  
  // Cut paper
  receipt += CUT_PAPER;
  
  return receipt;
}
