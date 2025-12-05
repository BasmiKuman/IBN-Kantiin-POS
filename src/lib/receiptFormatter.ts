// Re-export all formatter functions from separate files
// This file maintains backward compatibility

export { 
  generateCashierReceipt,
  type CashierReceiptData,
  type CashierReceiptItem
} from './formatters/cashierReceiptFormatter';

export { 
  generateKitchenReceipt,
  generateTestReceipt,
  type KitchenReceiptData,
  type KitchenReceiptItem
} from './formatters/kitchenReceiptFormatter';

export { 
  generateProductSalesReport,
  type ProductSalesReportData,
  type ProductSalesItem
} from './formatters/productSalesReportFormatter';

// Export shared types for backward compatibility
import type { CashierReceiptData, CashierReceiptItem } from './formatters/cashierReceiptFormatter';

export type ReceiptItem = CashierReceiptItem;
export type ReceiptData = CashierReceiptData;
