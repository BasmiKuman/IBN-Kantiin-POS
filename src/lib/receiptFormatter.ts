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
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, BOLD_ON, BOLD_OFF, FONT_SIZE_NORMAL, LINE_FEED, SEPARATOR, SEPARATOR_BOLD, LINE_FEED_3 } = PrinterCommands;
  const { receiptSettings, storeSettings } = getReceiptSettings();
  
  let receipt = INIT; // Initialize printer
  
  // Brand Header - BK POS (selalu muncul)
  receipt += ALIGN_CENTER + BOLD_ON;
  receipt += '== BK POS ==\n';
  receipt += BOLD_OFF;
  
  // Store name dari settings
  if (receiptSettings.header) {
    receipt += receiptSettings.header + '\n';
  }
  receipt += LINE_FEED;
  
  // Kitchen Badge
  receipt += BOLD_ON;
  receipt += '[ DAPUR ]\n';
  receipt += BOLD_OFF;
  receipt += LINE_FEED;
  receipt += SEPARATOR_BOLD;
  
  // Order info with better spacing
  receipt += ALIGN_LEFT + LINE_FEED;
  receipt += BOLD_ON;
  receipt += `ORDER #${data.orderNumber}\n`;
  receipt += BOLD_OFF;
  receipt += `Waktu: ${data.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}\n`;
  if (data.customerName) {
    receipt += `Pelanggan: ${data.customerName}\n`;
  }
  receipt += LINE_FEED;
  receipt += SEPARATOR_BOLD;
  
  // Items with better formatting
  receipt += LINE_FEED + BOLD_ON;
  receipt += 'PESANAN:\n';
  receipt += BOLD_OFF + LINE_FEED;
  
  data.items.forEach((item, index) => {
    // Check if item.name already contains variant in parentheses
    const hasVariantInName = item.name.includes('(') && item.name.includes(')');
    
    receipt += BOLD_ON;
    // If variant is NOT already in name, show variant separately below
    if (!hasVariantInName && item.variant) {
      receipt += `${item.quantity}x  ${item.name}\n`;
      receipt += BOLD_OFF;
      receipt += `     > ${item.variant}\n`;
    } else {
      // If variant already in name or no variant, just show the name
      receipt += `${item.quantity}x  ${item.name}\n`;
      receipt += BOLD_OFF;
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
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, BOLD_ON, BOLD_OFF, FONT_SIZE_NORMAL, LINE_FEED, SEPARATOR, SEPARATOR_BOLD, CUT_PAPER, LINE_FEED_3 } = PrinterCommands;
  const { receiptSettings, storeSettings } = getReceiptSettings();
  
  let receipt = INIT; // Initialize printer
  
  // Header
  receipt += ALIGN_CENTER + LINE_FEED;
  receipt += SEPARATOR_BOLD;
  
  // Brand Header - ALWAYS SHOW (BK POS tetap muncul)
  receipt += BOLD_ON;
  receipt += 'BK POS\n';
  receipt += BOLD_OFF;
  receipt += SEPARATOR_BOLD;
  receipt += LINE_FEED;
  
  // Store Header (dari settings)
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
  
  // Items with better spacing
  receipt += LINE_FEED;
  data.items.forEach((item, index) => {
    // Check if item.name already contains variant in parentheses
    const hasVariantInName = item.name.includes('(') && item.name.includes(')');
    const itemName = (!hasVariantInName && item.variant) ? `${item.name} (${item.variant})` : item.name;
    
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
  
  // Footer (dari settings)
  receipt += LINE_FEED + LINE_FEED;
  receipt += ALIGN_CENTER;
  receipt += SEPARATOR;
  receipt += BOLD_ON;
  receipt += `${receiptSettings.footer}\n`;
  receipt += BOLD_OFF;
  receipt += 'Terima kasih!\n';
  receipt += SEPARATOR;
  receipt += LINE_FEED_3;
  
  // Cut paper
  receipt += CUT_PAPER;
  
  return receipt;
}

// Simple test receipt with modern design
export function generateTestReceipt(): string {
  const { INIT, ALIGN_CENTER, BOLD_ON, BOLD_OFF, FONT_SIZE_NORMAL, LINE_FEED, SEPARATOR, SEPARATOR_BOLD, LINE_FEED_3 } = PrinterCommands;
  
  let receipt = INIT;
  receipt += ALIGN_CENTER + LINE_FEED;
  
  // Header
  receipt += SEPARATOR_BOLD;
  receipt += BOLD_ON;
  receipt += 'TEST PRINT\n';
  receipt += BOLD_OFF;
  receipt += SEPARATOR_BOLD;
  
  receipt += LINE_FEED;
  
  receipt += BOLD_ON;
  receipt += 'SUKSES!\n';
  receipt += BOLD_OFF;
  
  receipt += LINE_FEED;
  receipt += 'Printer berhasil terhubung\n';
  receipt += 'dan siap digunakan!\n';
  
  receipt += LINE_FEED + SEPARATOR + LINE_FEED;
  
  receipt += `${new Date().toLocaleString('id-ID')}\n`;
  
  receipt += LINE_FEED + SEPARATOR_BOLD + LINE_FEED;
  
  receipt += BOLD_ON;
  receipt += 'BK POS System\n';
  receipt += BOLD_OFF;
  receipt += 'Bluetooth Printer Ready\n';
  
  receipt += LINE_FEED_3;
  
  return receipt;
}

// Generate Product Sales Report
export function generateProductSalesReport(data: ProductSalesReportData): string {
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, BOLD_ON, BOLD_OFF, LINE_FEED, SEPARATOR, SEPARATOR_BOLD, LINE_FEED_3 } = PrinterCommands;
  const { receiptSettings } = getReceiptSettings();
  
  let receipt = INIT;
  
  // Header
  receipt += ALIGN_CENTER + LINE_FEED;
  receipt += SEPARATOR_BOLD;
  receipt += BOLD_ON;
  receipt += 'BK POS\n';
  receipt += BOLD_OFF;
  receipt += SEPARATOR_BOLD;
  receipt += LINE_FEED;
  
  // Report Title
  receipt += BOLD_ON;
  receipt += 'LAPORAN PENJUALAN PRODUK\n';
  receipt += BOLD_OFF;
  receipt += LINE_FEED;
  
  // Period
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
  
  data.products.forEach((product, index) => {
    const hargaSatuan = product.total_quantity > 0 
      ? Math.round(product.total_revenue / product.total_quantity)
      : 0;
    
    receipt += LINE_FEED;
    receipt += BOLD_ON;
    receipt += `${product.product_name}\n`;
    receipt += BOLD_OFF;
    receipt += `Qty: ${product.total_quantity} x Rp ${hargaSatuan.toLocaleString('id-ID')}\n`;
    receipt += padText('Total:', `Rp ${product.total_revenue.toLocaleString('id-ID')}`) + '\n';
  });
  
  receipt += LINE_FEED;
  receipt += SEPARATOR_BOLD;
  
  // Summary
  receipt += LINE_FEED;
  receipt += BOLD_ON;
  receipt += 'RINGKASAN PENJUALAN\n';
  receipt += BOLD_OFF;
  receipt += LINE_FEED;
  
  receipt += padText('Total Jenis Produk:', `${data.products.length}`) + '\n';
  receipt += padText('Total Item Terjual:', `${data.totalItems}`) + '\n';
  receipt += LINE_FEED;
  receipt += SEPARATOR_BOLD;
  receipt += BOLD_ON;
  receipt += padText('TOTAL PENJUALAN:', `Rp ${data.totalRevenue.toLocaleString('id-ID')}`) + '\n';
  receipt += BOLD_OFF;
  receipt += SEPARATOR_BOLD;
  
  // Footer
  receipt += LINE_FEED + LINE_FEED;
  receipt += ALIGN_CENTER;
  receipt += SEPARATOR;
  receipt += BOLD_ON;
  receipt += `${receiptSettings.footer}\n`;
  receipt += BOLD_OFF;
  if (data.cashierName) {
    receipt += `Dicetak oleh: ${data.cashierName}\n`;
  }
  receipt += SEPARATOR;
  receipt += LINE_FEED_3;
  
  return receipt;
}
