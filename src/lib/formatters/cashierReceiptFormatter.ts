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
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, CUT_PAPER } = PrinterCommands;
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
  receipt += '\n';
  receipt += '========================\n';
  
  // Items section - NO header, direct to products for Android compatibility
  console.log('Checking items - exists:', !!data.items, 'length:', data.items?.length);
  
  if (data.items && data.items.length > 0) {
    console.log('Processing', data.items.length, 'items');
    
    receipt += '\n';
    
    // Items - direct format without any header
    data.items.forEach((item, idx) => {
      console.log(`Item ${idx}:`, item);
      
      // Check if item.name already contains variant in parentheses
      const hasVariantInName = item.name.includes('(') && item.name.includes(')');
      const itemName = (!hasVariantInName && item.variant) ? `${item.name} (${item.variant})` : item.name;
      
      // Item name on one line
      receipt += itemName + '\n';
      
      // Quantity, price, and subtotal on one line
      const qtyPrice = `${item.quantity} x ${formatCurrency(item.price)}`;
      const subtotal = formatCurrency(item.price * item.quantity);
      receipt += padText(`  ${qtyPrice}`, subtotal) + '\n';
      receipt += '\n';
      
      console.log('Item formatted:', itemName, qtyPrice, subtotal);
    });
  } else {
    console.log('NO ITEMS FOUND!');
    receipt += '\nTidak ada item\n\n';
  }
  
  receipt += '------------------------\n';
  
  // Totals - simplified for Android
  receipt += '\n';
  receipt += padText('Subtotal:', formatCurrency(data.subtotal)) + '\n';
  
  if (data.tax > 0) {
    receipt += padText('Pajak:', formatCurrency(data.tax)) + '\n';
  }
  
  receipt += '\n';
  receipt += SEPARATOR_BOLD;
  receipt += padText('TOTAL:', formatCurrency(data.total)) + '\n';
  receipt += SEPARATOR_BOLD;
  
  // Payment method - simplified
  receipt += '\n';
  const paymentLabels: Record<string, string> = {
    cash: 'Tunai',
    qris: 'QRIS',
    transfer: 'Transfer Bank',
    debit: 'Kartu Debit',
    credit: 'Kartu Kredit',
  };
  receipt += `Pembayaran: ${paymentLabels[data.paymentMethod] || data.paymentMethod}\n`;
  
  // Footer - simplified for Android
  receipt += '\n\n';
  receipt += ALIGN_CENTER;
  receipt += '------------------------\n';
  const footerLines = wrapText(receiptSettings.footer, 24);
  footerLines.forEach(line => {
    receipt += `${line}\n`;
  });
  receipt += 'Terima kasih!\n';
  receipt += '------------------------\n';
  receipt += '\n\n\n';
  
  // Cut paper
  receipt += CUT_PAPER;
  
  return receipt;
}
