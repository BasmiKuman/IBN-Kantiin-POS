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

// Helper function to pad text for alignment (58mm = 32 chars)
function padText(left: string, right: string, width: number = 32): string {
  const totalLength = left.length + right.length;
  const spaces = width - totalLength;
  return left + ' '.repeat(Math.max(1, spaces)) + right;
}

// Format currency (shorter format for 58mm)
function formatCurrency(amount: number): string {
  return 'Rp' + amount.toLocaleString('id-ID');
}

// Get settings from localStorage
function getReceiptSettings() {
  try {
    const savedReceipt = localStorage.getItem('settings_receipt');
    const savedStore = localStorage.getItem('settings_store');
    
    const receiptSettings = savedReceipt ? JSON.parse(savedReceipt) : {
      header: 'BK POS',
      tagline: 'Makanan Enak, Harga Terjangkau',
      footer: 'Terima kasih atas kunjungan Anda!',
    };
    
    const storeSettings = savedStore ? JSON.parse(savedStore) : {
      name: 'Toko Pusat',
      address: 'Jl. Contoh No. 123',
      phone: '(021) 12345678',
    };
    
    return { receiptSettings, storeSettings };
  } catch (error) {
    console.error('Error loading receipt settings:', error);
    return {
      receiptSettings: {
        header: 'BASMIKUMAN POS',
        tagline: 'Makanan Enak, Harga Terjangkau',
        footer: 'Terima kasih!',
      },
      storeSettings: {
        name: 'Toko Pusat',
        address: 'Jl. Contoh No. 123',
        phone: '(021) 12345678',
      },
    };
  }
}

// Generate Kitchen Receipt (untuk dapur)
export function generateKitchenReceipt(data: ReceiptData): string {
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, BOLD_ON, BOLD_OFF, FONT_SIZE_DOUBLE, FONT_SIZE_LARGE, FONT_SIZE_NORMAL, LINE_FEED, SEPARATOR, SEPARATOR_BOLD, LINE_FEED_3 } = PrinterCommands;
  const { storeSettings } = getReceiptSettings();
  
  let receipt = INIT; // Initialize printer
  
  // Brand Header - MODERN STYLE
  receipt += ALIGN_CENTER + FONT_SIZE_DOUBLE + BOLD_ON;
  receipt += 'BK POS\n';
  receipt += FONT_SIZE_NORMAL + BOLD_OFF;
  receipt += storeSettings.name.toUpperCase() + '\n';
  receipt += LINE_FEED;
  
  // Kitchen Badge
  receipt += BOLD_ON + FONT_SIZE_LARGE;
  receipt += '[ DAPUR ]\n';
  receipt += FONT_SIZE_NORMAL + BOLD_OFF;
  receipt += LINE_FEED;
  receipt += SEPARATOR_BOLD;
  
  // Order info with better spacing
  receipt += ALIGN_LEFT + LINE_FEED;
  receipt += BOLD_ON;
  receipt += `ORDER #${data.orderNumber}\n`;
  receipt += BOLD_OFF;
  receipt += `\u23F0 ${data.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}\n`;
  if (data.customerName) {
    receipt += `\uD83D\uDC64 ${data.customerName}\n`;
  }
  receipt += LINE_FEED;
  receipt += SEPARATOR_BOLD;
  
  // Items with better formatting
  receipt += LINE_FEED + BOLD_ON;
  receipt += 'PESANAN:\n';
  receipt += BOLD_OFF + LINE_FEED;
  
  data.items.forEach((item, index) => {
    receipt += BOLD_ON + FONT_SIZE_LARGE;
    receipt += `${item.quantity}x  ${item.name}\n`;
    receipt += FONT_SIZE_NORMAL + BOLD_OFF;
    if (item.variant) {
      receipt += `     \u2514\u2500 ${item.variant}\n`;
    }
    if (index < data.items.length - 1) {
      receipt += LINE_FEED;
    }
  });
  
  receipt += LINE_FEED + SEPARATOR;
  receipt += ALIGN_CENTER + BOLD_ON;
  receipt += `TOTAL: ${data.items.reduce((sum, item) => sum + item.quantity, 0)} ITEM\n`;
  receipt += BOLD_OFF;
  receipt += LINE_FEED_3;
  
  return receipt;
}

// Generate Cashier Receipt (untuk kasir/customer)
export function generateCashierReceipt(data: ReceiptData): string {
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, BOLD_ON, BOLD_OFF, FONT_SIZE_DOUBLE, FONT_SIZE_LARGE, FONT_SIZE_NORMAL, LINE_FEED, SEPARATOR, SEPARATOR_BOLD, CUT_PAPER, LINE_FEED_3 } = PrinterCommands;
  const { receiptSettings, storeSettings } = getReceiptSettings();
  
  let receipt = INIT; // Initialize printer
  
  // Modern Header with Box Design
  receipt += ALIGN_CENTER + LINE_FEED;
  receipt += '\u256D' + '\u2500'.repeat(30) + '\u256E\n';
  receipt += '\u2502' + ' '.repeat(30) + '\u2502\n';
  
  // Brand Header - ALWAYS SHOW (tidak bisa diubah)
  receipt += '\u2502  ' + BOLD_ON + FONT_SIZE_DOUBLE;
  receipt += 'BK POS';
  receipt += FONT_SIZE_NORMAL + BOLD_OFF + '  \u2502\n';
  receipt += '\u2502' + ' '.repeat(30) + '\u2502\n';
  receipt += '\u2570' + '\u2500'.repeat(30) + '\u256F\n';
  receipt += LINE_FEED;
  
  // Store Header (dari settings - bisa diubah)
  receipt += BOLD_ON + FONT_SIZE_LARGE;
  receipt += `${receiptSettings.header}\n`;
  receipt += FONT_SIZE_NORMAL + BOLD_OFF;
  
  // Tagline (dari settings)
  if (receiptSettings.tagline) {
    receipt += `${receiptSettings.tagline}\n`;
  }
  
  // Store Info (dari settings)
  receipt += `\uD83D\uDCCD ${storeSettings.address}\n`;
  if (storeSettings.phone) {
    receipt += `\uD83D\uDCDE ${storeSettings.phone}\n`;
  }
  receipt += LINE_FEED;
  receipt += SEPARATOR_BOLD;
  
  // Order info with icons
  receipt += ALIGN_LEFT + LINE_FEED;
  receipt += BOLD_ON;
  receipt += `\uD83D\uDCDD Order #${data.orderNumber}\n`;
  receipt += BOLD_OFF;
  receipt += `\uD83D\uDCC5 ${data.date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })} \u23F0 ${data.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}\n`;
  if (data.cashierName) {
    receipt += `\uD83D\uDC68\u200D\uD83D\uDCBC Kasir: ${data.cashierName}\n`;
  }
  if (data.customerName) {
    receipt += `\uD83D\uDC64 ${data.customerName}\n`;
  }
  receipt += LINE_FEED;
  receipt += SEPARATOR_BOLD;
  
  // Items with better spacing
  receipt += LINE_FEED;
  data.items.forEach((item, index) => {
    const itemName = item.variant ? `${item.name} (${item.variant})` : item.name;
    
    // Item name (bold)
    receipt += BOLD_ON;
    receipt += `${itemName}\n`;
    receipt += BOLD_OFF;
    
    // Price line (quantity x price = total)
    const pricePerItem = formatCurrency(item.price);
    const totalItemPrice = formatCurrency(item.price * item.quantity);
    receipt += padText(`  ${item.quantity}x @ ${pricePerItem}`, totalItemPrice) + '\n';
    
    // Add spacing between items
    if (index < data.items.length - 1) {
      receipt += LINE_FEED;
    }
  });
  
  receipt += LINE_FEED;
  receipt += SEPARATOR;
  
  // Totals with better formatting
  receipt += LINE_FEED;
  receipt += padText('Subtotal:', formatCurrency(data.subtotal)) + '\n';
  
  if (data.tax > 0) {
    receipt += padText('Pajak:', formatCurrency(data.tax)) + '\n';
  }
  
  receipt += LINE_FEED;
  receipt += SEPARATOR_BOLD;
  receipt += BOLD_ON + FONT_SIZE_LARGE;
  receipt += padText('TOTAL:', formatCurrency(data.total)) + '\n';
  receipt += FONT_SIZE_NORMAL + BOLD_OFF;
  receipt += SEPARATOR_BOLD;
  
  // Payment method with icon
  receipt += LINE_FEED;
  const paymentLabels: Record<string, string> = {
    cash: '\uD83D\uDCB5 Tunai',
    qris: '\uD83D\uDCF1 QRIS',
    transfer: '\uD83C\uDFE6 Transfer',
    debit: '\uD83D\uDCB3 Debit',
    credit: '\uD83D\uDCB3 Kartu Kredit',
  };
  receipt += BOLD_ON;
  receipt += `Metode: ${paymentLabels[data.paymentMethod] || data.paymentMethod}\n`;
  receipt += BOLD_OFF;
  
  // Footer with decorative elements (dari settings)
  receipt += LINE_FEED + LINE_FEED;
  receipt += ALIGN_CENTER;
  receipt += '\u2726'.repeat(32) + '\n';
  receipt += LINE_FEED;
  receipt += BOLD_ON;
  receipt += `${receiptSettings.footer}\n`;
  receipt += BOLD_OFF;
  receipt += '\u2665 Sampai jumpa lagi! \u2665\n';
  receipt += LINE_FEED;
  receipt += '\u2726'.repeat(32) + '\n';
  receipt += LINE_FEED_3;
  
  // Cut paper
  receipt += CUT_PAPER;
  
  return receipt;
}

// Simple test receipt with modern design
export function generateTestReceipt(): string {
  const { INIT, ALIGN_CENTER, BOLD_ON, BOLD_OFF, FONT_SIZE_DOUBLE, FONT_SIZE_NORMAL, LINE_FEED, SEPARATOR, SEPARATOR_BOLD, LINE_FEED_3 } = PrinterCommands;
  
  let receipt = INIT;
  receipt += ALIGN_CENTER + LINE_FEED;
  
  // Header box
  receipt += '\u256D' + '\u2500'.repeat(30) + '\u256E\n';
  receipt += '\u2502' + ' '.repeat(12) + 'TEST' + ' '.repeat(14) + '\u2502\n';
  receipt += '\u2502' + ' '.repeat(11) + 'PRINT' + ' '.repeat(14) + '\u2502\n';
  receipt += '\u2570' + '\u2500'.repeat(30) + '\u256F\n';
  
  receipt += LINE_FEED + SEPARATOR_BOLD + LINE_FEED;
  
  receipt += BOLD_ON + FONT_SIZE_DOUBLE;
  receipt += '\u2705 SUKSES!\n';
  receipt += FONT_SIZE_NORMAL + BOLD_OFF;
  
  receipt += LINE_FEED;
  receipt += 'Printer berhasil terhubung\n';
  receipt += 'dan siap digunakan!\n';
  
  receipt += LINE_FEED + SEPARATOR + LINE_FEED;
  
  receipt += `\u23F0 ${new Date().toLocaleString('id-ID')}\n`;
  
  receipt += LINE_FEED + SEPARATOR_BOLD + LINE_FEED;
  
  receipt += BOLD_ON;
  receipt += 'BK POS System\n';
  receipt += BOLD_OFF;
  receipt += 'Bluetooth Printer Ready\n';
  
  receipt += LINE_FEED_3;
  
  return receipt;
}
