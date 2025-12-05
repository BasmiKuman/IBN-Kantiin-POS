import { PrinterCommands } from '@/hooks/useBluetoothPrinter';
import { getReceiptSettings } from './sharedHelpers';

export interface KitchenReceiptItem {
  name: string;
  quantity: number;
  variant?: string;
}

export interface KitchenReceiptData {
  orderNumber: string;
  items: KitchenReceiptItem[];
  date: Date;
  customerName?: string;
}

// Generate Kitchen Receipt (untuk dapur)
export function generateKitchenReceipt(data: KitchenReceiptData): string {
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, BOLD_ON, BOLD_OFF, FONT_SIZE_DOUBLE, FONT_SIZE_NORMAL, LINE_FEED, SEPARATOR, LINE_FEED_3 } = PrinterCommands;
  const { receiptSettings } = getReceiptSettings();
  
  let receipt = INIT;
  
  // Header
  receipt += ALIGN_CENTER + FONT_SIZE_DOUBLE + LINE_FEED;
  receipt += BOLD_ON;
  receipt += '=== DAPUR ===\n';
  receipt += BOLD_OFF;
  receipt += FONT_SIZE_NORMAL + LINE_FEED;
  
  // Store name
  receipt += BOLD_ON;
  receipt += `${receiptSettings.header}\n`;
  receipt += BOLD_OFF;
  receipt += SEPARATOR;
  
  // Order info
  receipt += ALIGN_LEFT + LINE_FEED;
  receipt += BOLD_ON;
  receipt += `Order #${data.orderNumber}\n`;
  receipt += BOLD_OFF;
  receipt += `${data.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}\n`;
  
  if (data.customerName) {
    receipt += `Customer: ${data.customerName}\n`;
  }
  receipt += LINE_FEED + SEPARATOR;
  
  // Items (tanpa harga)
  receipt += LINE_FEED;
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

// Generate Test Receipt
export function generateTestReceipt(): string {
  const { INIT, ALIGN_CENTER, BOLD_ON, BOLD_OFF, LINE_FEED, SEPARATOR, SEPARATOR_BOLD, LINE_FEED_3 } = PrinterCommands;
  
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
