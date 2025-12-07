/**
 * EXAMPLE: Thermal Receipt Integration for POS.tsx
 * 
 * This file shows how to integrate ThermalReceipt components
 * into existing POS system.
 * 
 * Copy-paste relevant sections into your POS.tsx
 */

// ============================================
// 1. UPDATE IMPORTS
// ============================================

// OLD:
// import { generateCashierReceipt } from "@/lib/receiptFormatter";

// NEW - Add thermal receipt imports:
import { generateThermalReceipt } from "@/lib/formatters/thermalReceiptConverter";
import { ThermalReceipt } from "@/components/ThermalReceipt";

// Keep existing:
import { useBluetoothPrinter } from "@/hooks/useBluetoothPrinter";

// ============================================
// 2. ADD REF FOR PREVIEW (Optional)
// ============================================

function POS() {
  // Existing refs...
  const receiptRef = useRef<HTMLDivElement>(null);
  
  // NEW - Add thermal receipt preview ref
  const thermalReceiptRef = useRef<HTMLDivElement>(null);
  
  // ... rest of component
}

// ============================================
// 3. UPDATE PRINT HANDLER
// ============================================

// OLD handlePrintLastReceipt:
const handlePrintLastReceiptOLD = async () => {
  if (!lastTransaction) return;
  
  if (isConnected) {
    try {
      const receiptData = {
        orderNumber: lastTransaction.orderNumber,
        items: lastTransaction.items,
        subtotal: lastTransaction.subtotal,
        tax: lastTransaction.tax,
        total: lastTransaction.total,
        paymentMethod: lastTransaction.paymentMethod,
        customerName: lastTransaction.customerName,
        date: lastTransaction.date,
      };
      const receipt = generateCashierReceipt(receiptData);
      await printReceipt(receipt);
      
      toast({
        title: "Struk Dicetak!",
        description: "Struk kasir berhasil dicetak via Bluetooth",
      });
      
      setReceiptDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mencetak struk",
        variant: "destructive",
      });
    }
  } else {
    setReceiptDialogOpen(false);
    setPrintDialogOpen(true);
  }
};

// NEW - Replace with thermal receipt:
const handlePrintLastReceipt = async () => {
  if (!lastTransaction) return;
  
  if (isConnected) {
    try {
      // Get paper width from settings (default 58mm for Xiaomi Redmi Pad SE)
      const settings = JSON.parse(localStorage.getItem('pos_settings') || '{}');
      const paperWidth = settings.paperWidth || '58mm';
      
      // Prepare thermal receipt data
      const thermalReceiptData = {
        transactionNumber: lastTransaction.orderNumber,
        date: new Date(lastTransaction.date),
        items: lastTransaction.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
          variant: item.variantName,
        })),
        subtotal: lastTransaction.subtotal,
        tax: lastTransaction.tax || 0,
        taxRate: lastTransaction.taxRate || 0,
        total: lastTransaction.total,
        paymentMethod: lastTransaction.paymentMethod,
        paymentAmount: lastTransaction.paymentAmount || lastTransaction.total,
        changeAmount: lastTransaction.changeAmount || 0,
        customerName: lastTransaction.customerName,
        earnedPoints: lastTransaction.earnedPoints,
        totalPoints: lastTransaction.totalPoints,
        paperWidth: paperWidth as '58mm' | '80mm',
        storeName: settings.storeName || 'BK POS',
        storeAddress: settings.storeAddress || '',
        storePhone: settings.storePhone || '',
        cashierName: localStorage.getItem('username') || 'Kasir',
      };
      
      // Generate ESC/POS commands using thermal receipt
      const thermalReceipt = generateThermalReceipt(thermalReceiptData);
      
      // Print via Bluetooth
      await printReceipt(thermalReceipt);
      
      toast({
        title: "Struk Dicetak!",
        description: `Struk kasir berhasil dicetak (${paperWidth})`,
      });
      
      setReceiptDialogOpen(false);
    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: "Error",
        description: "Gagal mencetak struk",
        variant: "destructive",
      });
    }
  } else {
    // Not connected, open dialog for connection
    setReceiptDialogOpen(false);
    setPrintDialogOpen(true);
  }
};

// ============================================
// 4. UPDATE CHECKOUT HANDLER
// ============================================

// Find your handleCheckout function and update the print section:

const handleCheckout = async () => {
  // ... existing checkout logic ...
  
  // After transaction saved successfully:
  
  try {
    // Get paper width setting
    const settings = JSON.parse(localStorage.getItem('pos_settings') || '{}');
    const paperWidth = settings.paperWidth || '58mm';
    
    // Prepare thermal receipt data
    const thermalReceiptData = {
      transactionNumber: transactionNumber,
      date: new Date(),
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
        variant: item.variantName,
      })),
      subtotal: subtotalWithDiscount,
      tax: taxAmount,
      taxRate: paymentSettings.taxRate,
      total: total,
      paymentMethod: paymentMethod,
      paymentAmount: parseFloat(paymentAmount),
      changeAmount: changeAmount,
      customerName: selectedCustomer?.name,
      earnedPoints: earnedPoints,
      totalPoints: newTotalPoints,
      paperWidth: paperWidth as '58mm' | '80mm',
      storeName: settings.storeName || 'BK POS',
      storeAddress: settings.storeAddress || '',
      storePhone: settings.storePhone || '',
      cashierName: localStorage.getItem('username') || 'Kasir',
    };
    
    // Generate ESC/POS commands
    const thermalReceipt = generateThermalReceipt(thermalReceiptData);
    
    // Auto print if Bluetooth connected
    if (isConnected) {
      await printReceipt(thermalReceipt);
      toast({
        title: "Transaksi Berhasil!",
        description: "Struk otomatis dicetak via Bluetooth",
      });
    } else {
      toast({
        title: "Transaksi Berhasil!",
        description: "Silakan cetak struk dari riwayat transaksi",
      });
    }
    
    // ... rest of checkout logic (clear cart, etc.)
    
  } catch (error) {
    console.error('Checkout error:', error);
    // ... error handling
  }
};

// ============================================
// 5. ADD THERMAL RECEIPT PREVIEW (Optional)
// ============================================

// Add this section in your return JSX for preview:

return (
  <div>
    {/* ... existing POS UI ... */}
    
    {/* Thermal Receipt Preview - Hidden by default */}
    <div style={{ display: 'none' }}>
      {lastTransaction && (
        <ThermalReceipt
          ref={thermalReceiptRef}
          transactionNumber={lastTransaction.orderNumber}
          date={new Date(lastTransaction.date)}
          items={lastTransaction.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
            variant: item.variantName,
          }))}
          subtotal={lastTransaction.subtotal}
          tax={lastTransaction.tax || 0}
          total={lastTransaction.total}
          paymentMethod={lastTransaction.paymentMethod}
          paymentAmount={lastTransaction.paymentAmount || lastTransaction.total}
          changeAmount={lastTransaction.changeAmount || 0}
          customerName={lastTransaction.customerName}
          paperWidth="58mm" // Default for Xiaomi Redmi Pad SE
          storeName="BK POS"
          cashierName={localStorage.getItem('username') || 'Kasir'}
        />
      )}
    </div>
    
    {/* ... rest of JSX ... */}
  </div>
);

// ============================================
// 6. ADD SETTINGS FOR PAPER WIDTH (Optional)
// ============================================

// In your Settings page, add paper width selector:

// Settings.tsx
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Add to settings form:
<div className="space-y-2">
  <Label>Ukuran Kertas Thermal</Label>
  <Select
    value={settings.paperWidth || '58mm'}
    onValueChange={(value) => {
      const newSettings = { ...settings, paperWidth: value };
      setSettings(newSettings);
      localStorage.setItem('pos_settings', JSON.stringify(newSettings));
    }}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="58mm">58mm (24 chars) - Recommended</SelectItem>
      <SelectItem value="80mm">80mm (32 chars)</SelectItem>
    </SelectContent>
  </Select>
  <p className="text-xs text-muted-foreground">
    58mm optimal untuk Xiaomi Redmi Pad SE 8.7"
  </p>
</div>

// ============================================
// 7. MIGRATION STRATEGY
// ============================================

/**
 * STRATEGY A: Full Migration (Recommended)
 * - Replace all generateCashierReceipt with generateThermalReceipt
 * - Update all print handlers
 * - Test thoroughly
 * - Deploy
 * 
 * STRATEGY B: Gradual Migration
 * - Keep both systems
 * - Use device detection:
 */

const isMobileTablet = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);

if (isMobileTablet) {
  // Use new thermal receipt (optimized for tablets)
  const receipt = generateThermalReceipt(receiptData);
  await printReceipt(receipt);
} else {
  // Use old formatter (desktop/fallback)
  const receipt = generateCashierReceipt(receiptData);
  await printReceipt(receipt);
}

/**
 * STRATEGY C: Settings Toggle
 * - Add setting to switch between old/new formatter
 * - Let user choose which works better
 */

const settings = JSON.parse(localStorage.getItem('pos_settings') || '{}');
const useThermalReceipt = settings.useThermalReceipt !== false; // default true

if (useThermalReceipt) {
  const receipt = generateThermalReceipt(receiptData);
  await printReceipt(receipt);
} else {
  const receipt = generateCashierReceipt(receiptData);
  await printReceipt(receipt);
}

// ============================================
// 8. TESTING CHECKLIST
// ============================================

/**
 * [ ] Test print dengan 1 produk
 * [ ] Test print dengan multiple produk
 * [ ] Test print dengan produk nama panjang (>24 chars)
 * [ ] Test print dengan variant
 * [ ] Test print dengan customer name
 * [ ] Test print dengan loyalty points
 * [ ] Test print dengan payment method: tunai
 * [ ] Test print dengan payment method: QRIS
 * [ ] Test print dengan payment method: transfer
 * [ ] Test print dengan tax > 0
 * [ ] Test print di Xiaomi Redmi Pad SE
 * [ ] Test print di desktop browser
 * [ ] Verify no text truncation
 * [ ] Verify no separator overlap
 * [ ] Verify proper spacing
 * [ ] Test after clear browser cache
 */

// ============================================
// DONE! 🎉
// ============================================

export {}; // Make this a module
