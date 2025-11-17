import { PrinterCommands } from '@/hooks/useBluetoothPrinter';

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  variant?: string;
}

export interface ReceiptData {
  orderNumber: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashierName?: string;
  customerName?: string;
  date: Date;
}

// Helper function to pad text for alignment
function padText(left: string, right: string, width: number = 32): string {
  const totalLength = left.length + right.length;
  const spaces = width - totalLength;
  return left + ' '.repeat(Math.max(1, spaces)) + right;
}

// Format currency
function formatCurrency(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

// Generate Kitchen Receipt (untuk dapur)
export function generateKitchenReceipt(data: ReceiptData): string {
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, BOLD_ON, BOLD_OFF, FONT_SIZE_LARGE, FONT_SIZE_NORMAL, LINE_FEED, SEPARATOR, LINE_FEED_3 } = PrinterCommands;
  
  let receipt = INIT; // Initialize printer
  
  // Header
  receipt += ALIGN_CENTER + FONT_SIZE_LARGE + BOLD_ON;
  receipt += '*** DAPUR ***\n';
  receipt += BOLD_OFF + FONT_SIZE_NORMAL;
  receipt += LINE_FEED;
  
  // Order info
  receipt += ALIGN_LEFT + BOLD_ON;
  receipt += `Order #: ${data.orderNumber}\n`;
  receipt += BOLD_OFF;
  receipt += `Waktu: ${data.date.toLocaleTimeString('id-ID')}\n`;
  if (data.customerName) {
    receipt += `Pelanggan: ${data.customerName}\n`;
  }
  receipt += SEPARATOR;
  
  // Items
  receipt += BOLD_ON + 'PESANAN:\n' + BOLD_OFF;
  data.items.forEach((item) => {
    receipt += LINE_FEED;
    receipt += BOLD_ON + `${item.quantity}x ${item.name}\n` + BOLD_OFF;
    if (item.variant) {
      receipt += `   (${item.variant})\n`;
    }
  });
  
  receipt += LINE_FEED + SEPARATOR;
  receipt += ALIGN_CENTER;
  receipt += `Total Item: ${data.items.reduce((sum, item) => sum + item.quantity, 0)}\n`;
  receipt += LINE_FEED_3;
  
  return receipt;
}

// Generate Cashier Receipt (untuk kasir/customer)
export function generateCashierReceipt(data: ReceiptData, storeName: string = 'IBN KANTIIN'): string {
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, BOLD_ON, BOLD_OFF, FONT_SIZE_LARGE, FONT_SIZE_NORMAL, LINE_FEED, SEPARATOR, SEPARATOR_BOLD, CUT_PAPER, LINE_FEED_3 } = PrinterCommands;
  
  let receipt = INIT; // Initialize printer
  
  // Store Header
  receipt += ALIGN_CENTER + FONT_SIZE_LARGE + BOLD_ON;
  receipt += `${storeName}\n`;
  receipt += BOLD_OFF + FONT_SIZE_NORMAL;
  receipt += LINE_FEED;
  
  // Order info
  receipt += ALIGN_LEFT;
  receipt += `No. Order: ${data.orderNumber}\n`;
  receipt += `Tanggal: ${data.date.toLocaleDateString('id-ID')}\n`;
  receipt += `Waktu: ${data.date.toLocaleTimeString('id-ID')}\n`;
  if (data.cashierName) {
    receipt += `Kasir: ${data.cashierName}\n`;
  }
  if (data.customerName) {
    receipt += `Pelanggan: ${data.customerName}\n`;
  }
  receipt += SEPARATOR_BOLD;
  
  // Items
  data.items.forEach((item) => {
    const itemName = item.variant ? `${item.name} (${item.variant})` : item.name;
    
    // Item name and quantity
    receipt += `${itemName}\n`;
    
    // Price line
    const pricePerItem = formatCurrency(item.price);
    const totalItemPrice = formatCurrency(item.price * item.quantity);
    receipt += padText(`  ${item.quantity} x ${pricePerItem}`, totalItemPrice) + '\n';
    receipt += LINE_FEED;
  });
  
  receipt += SEPARATOR;
  
  // Totals
  receipt += BOLD_ON;
  receipt += padText('Subtotal:', formatCurrency(data.subtotal)) + '\n';
  receipt += padText('Pajak:', formatCurrency(data.tax)) + '\n';
  receipt += SEPARATOR_BOLD;
  receipt += FONT_SIZE_LARGE;
  receipt += padText('TOTAL:', formatCurrency(data.total), 28) + '\n';
  receipt += FONT_SIZE_NORMAL + BOLD_OFF;
  receipt += SEPARATOR_BOLD;
  
  // Payment method
  receipt += LINE_FEED;
  receipt += `Metode Bayar: ${data.paymentMethod}\n`;
  
  // Footer
  receipt += LINE_FEED + ALIGN_CENTER;
  receipt += 'Terima kasih atas kunjungan Anda!\n';
  receipt += 'Selamat menikmati!\n';
  receipt += LINE_FEED_3;
  
  // Cut paper
  receipt += CUT_PAPER;
  
  return receipt;
}

// Simple test receipt
export function generateTestReceipt(): string {
  const { INIT, ALIGN_CENTER, BOLD_ON, BOLD_OFF, LINE_FEED, SEPARATOR, LINE_FEED_3 } = PrinterCommands;
  
  let receipt = INIT;
  receipt += ALIGN_CENTER + BOLD_ON;
  receipt += 'TEST PRINT\n';
  receipt += BOLD_OFF;
  receipt += SEPARATOR;
  receipt += 'Printer berhasil terhubung!\n';
  receipt += `Waktu: ${new Date().toLocaleString('id-ID')}\n`;
  receipt += LINE_FEED_3;
  
  return receipt;
}
