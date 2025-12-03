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
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, BOLD_ON, BOLD_OFF, FONT_SIZE_NORMAL, LINE_FEED, SEPARATOR, LINE_FEED_3 } = PrinterCommands;
  const { storeSettings } = getReceiptSettings();
  
  let receipt = INIT; // Initialize printer
  
  // Brand Header - ALWAYS SHOW
  receipt += ALIGN_CENTER + BOLD_ON;
  receipt += 'BK POS\n';
  receipt += BOLD_OFF;
  
  // Store name (dari settings)
  receipt += storeSettings.name.toUpperCase() + '\n';
  receipt += '*** DAPUR ***\n';
  receipt += LINE_FEED;
  
  // Order info
  receipt += ALIGN_LEFT + BOLD_ON;
  receipt += `Order: ${data.orderNumber}\n`;
  receipt += BOLD_OFF;
  receipt += `Waktu: ${data.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}\n`;
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
  receipt += `Total: ${data.items.reduce((sum, item) => sum + item.quantity, 0)} item\n`;
  receipt += LINE_FEED_3;
  
  return receipt;
}

// Generate Cashier Receipt (untuk kasir/customer)
export function generateCashierReceipt(data: ReceiptData): string {
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, BOLD_ON, BOLD_OFF, FONT_SIZE_NORMAL, LINE_FEED, SEPARATOR, SEPARATOR_BOLD, CUT_PAPER, LINE_FEED_3 } = PrinterCommands;
  const { receiptSettings, storeSettings } = getReceiptSettings();
  
  let receipt = INIT; // Initialize printer
  
  // Brand Header - ALWAYS SHOW (tidak bisa diubah)
  receipt += ALIGN_CENTER + BOLD_ON;
  receipt += 'BK POS\n';
  receipt += BOLD_OFF;
  receipt += '~~~~~~~\n';
  
  // Store Header (dari settings - bisa diubah)
  receipt += BOLD_ON;
  receipt += `${receiptSettings.header}\n`;
  receipt += BOLD_OFF;
  
  // Tagline (dari settings)
  if (receiptSettings.tagline) {
    receipt += `${receiptSettings.tagline}\n`;
  }
  
  // Store Info (dari settings)
  receipt += `${storeSettings.address}\n`;
  if (storeSettings.phone) {
    receipt += `Telp: ${storeSettings.phone}\n`;
  }
  receipt += LINE_FEED;
  receipt += SEPARATOR_BOLD;
  
  // Order info
  receipt += ALIGN_LEFT;
  receipt += `No: ${data.orderNumber}\n`;
  receipt += `${data.date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${data.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}\n`;
  if (data.cashierName) {
    receipt += `Kasir: ${data.cashierName}\n`;
  }
  if (data.customerName) {
    receipt += `Plg: ${data.customerName}\n`;
  }
  receipt += SEPARATOR;
  
  // Items
  data.items.forEach((item) => {
    const itemName = item.variant ? `${item.name}` : item.name;
    
    // Item name
    receipt += `${itemName}\n`;
    
    // Price line (quantity x price = total)
    const pricePerItem = formatCurrency(item.price);
    const totalItemPrice = formatCurrency(item.price * item.quantity);
    receipt += padText(`${item.quantity}x ${pricePerItem}`, totalItemPrice) + '\n';
  });
  
  receipt += SEPARATOR;
  
  // Totals (normal size untuk 58mm)
  receipt += padText('Subtotal', formatCurrency(data.subtotal)) + '\n';
  
  if (data.tax > 0) {
    receipt += padText('Pajak', formatCurrency(data.tax)) + '\n';
  }
  
  receipt += SEPARATOR_BOLD;
  receipt += BOLD_ON;
  receipt += padText('TOTAL', formatCurrency(data.total)) + '\n';
  receipt += BOLD_OFF;
  receipt += SEPARATOR_BOLD;
  
  // Payment method
  receipt += LINE_FEED;
  const paymentLabels: Record<string, string> = {
    cash: 'Tunai',
    qris: 'QRIS',
    transfer: 'Transfer',
    debit: 'Debit',
    credit: 'Kartu Kredit',
  };
  receipt += `Bayar: ${paymentLabels[data.paymentMethod] || data.paymentMethod}\n`;
  
  // Footer (dari settings)
  receipt += LINE_FEED + ALIGN_CENTER;
  receipt += `${receiptSettings.footer}\n`;
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
