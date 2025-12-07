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
  receipt += ALIGN_CENTER + '\n';
  receipt += '========================\n';
  receipt += 'BK POS\n';
  receipt += '========================\n';
  receipt += '\n';
  
  // Store Header (dari settings) - word wrap jika perlu
  const headerLines = wrapText(receiptSettings.header, 24);
  headerLines.forEach(line => {
    receipt += `${line}\n`;
  });
  
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
  receipt += '\n';
  receipt += '========================\n';
  
  // Order info - Left aligned
  receipt += ALIGN_LEFT + '\n';
  receipt += `Order #${data.orderNumber}\n`;
  receipt += `${data.date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${data.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}\n`;
  if (data.cashierName) {
    receipt += `Kasir: ${data.cashierName}\n`;
  }
  if (data.customerName) {
    receipt += `Customer: ${data.customerName}\n`;
  }
  receipt += '\n';
  receipt += '\n';
  
  // Items section - simple format with right-aligned prices
  // No "PESANAN:" header - all products have consistent 2-line format
  console.log('Checking items - exists:', !!data.items, 'length:', data.items?.length);
  
  if (data.items && data.items.length > 0) {
    console.log('Processing', data.items.length, 'items');
    console.log('Items array:', JSON.stringify(data.items));
    
    data.items.forEach((item, idx) => {
      console.log(`Item ${idx}:`, item);
      
      // Product name - truncate if too long (max 24 chars for 58mm printer)
      let itemName = item.name;
      if (item.variant) {
        itemName += ' - ' + item.variant;
      }
      
      // Log original length
      console.log(`Product name: "${itemName}" (${itemName.length} chars)`);
      
      // Wrap long names to multiple lines (24 char width)
      if (itemName.length > 24) {
        const lines = [];
        for (let i = 0; i < itemName.length; i += 24) {
          lines.push(itemName.substring(i, i + 24));
        }
        receipt += lines.join('\n') + '\n';
        console.log(`Wrapped to ${lines.length} lines:`, lines);
      } else {
        receipt += itemName + '\n';
      }
      
      // Qty x price on second line, total on third line
      // Use simple format to avoid truncation on 58mm printer
      const itemTotal = item.price * item.quantity;
      receipt += '  ' + item.quantity + ' x Rp' + item.price + '\n';
      receipt += '  = Rp' + itemTotal + '\n';
      receipt += '\n'; // Add blank line after each item
      
      console.log('Added item to receipt');
    });
    
    console.log('All items processed. Receipt length so far:', receipt.length);
  } else {
    console.log('NO ITEMS FOUND!');
    receipt += 'Tidak ada item\n';
  }
  
  receipt += '\n'; // Blank line instead of separator
  
  // Totals - right aligned
  const subtotalLabel = 'Subtotal:';
  const subtotalValue = 'Rp' + data.subtotal;
  let spaces = 24 - subtotalLabel.length - subtotalValue.length;
  receipt += subtotalLabel + ' '.repeat(Math.max(1, spaces)) + subtotalValue + '\n';
  
  if (data.tax > 0) {
    const taxLabel = 'Pajak:';
    const taxValue = 'Rp' + data.tax;
    spaces = 24 - taxLabel.length - taxValue.length;
    receipt += taxLabel + ' '.repeat(Math.max(1, spaces)) + taxValue + '\n';
  }
  
  const totalLabel = 'TOTAL:';
  const totalValue = 'Rp' + data.total;
  spaces = 24 - totalLabel.length - totalValue.length;
  receipt += totalLabel + ' '.repeat(Math.max(1, spaces)) + totalValue + '\n';
  receipt += '\n'; // Blank line instead of separator
  
  // Payment method
  const paymentLabels: Record<string, string> = {
    cash: 'Tunai',
    qris: 'QRIS',
    transfer: 'Transfer Bank',
    debit: 'Kartu Debit',
    credit: 'Kartu Kredit',
  };
  receipt += `Bayar: ${paymentLabels[data.paymentMethod] || data.paymentMethod}\n`;
  receipt += '\n';
  
  // Footer - compact
  receipt += ALIGN_CENTER;
  const footerLines = wrapText(receiptSettings.footer, 24);
  footerLines.forEach(line => {
    receipt += `${line}\n`;
  });
  receipt += 'Terima kasih!\n';
  receipt += '\n';
  
  // Cut paper
  receipt += CUT_PAPER;
  
  return receipt;
}
