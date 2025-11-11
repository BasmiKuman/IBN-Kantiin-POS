import { Capacitor } from '@capacitor/core';

// Type definitions for the thermal printer plugin
interface ThermalPrinter {
  listPrinters: () => Promise<{ printers: Array<{ name: string; address: string }> }>;
  connect: (options: { address: string }) => Promise<void>;
  disconnect: () => Promise<void>;
  printText: (options: { text: string; align?: 'left' | 'center' | 'right'; bold?: boolean; size?: number }) => Promise<void>;
  printImage: (options: { base64: string; align?: 'left' | 'center' | 'right' }) => Promise<void>;
  printBarcode: (options: { value: string; type?: string; height?: number }) => Promise<void>;
  printQRCode: (options: { value: string; size?: number }) => Promise<void>;
  printDivider: (options?: { char?: string; length?: number }) => Promise<void>;
  feed: (options?: { lines?: number }) => Promise<void>;
  cut: () => Promise<void>;
}

// Check if plugin is available
const getThermalPrinter = (): ThermalPrinter | null => {
  if (!Capacitor.isNativePlatform()) {
    console.warn('Bluetooth printer only works on native platforms (Android/iOS)');
    return null;
  }
  
  try {
    // @ts-ignore - Plugin might not have types
    return window.CapacitorThermalPrinter || null;
  } catch (error) {
    console.error('Thermal printer plugin not found:', error);
    return null;
  }
};

export interface BluetoothPrinter {
  name: string;
  address: string;
}

export const bluetoothPrinterService = {
  /**
   * Check if Bluetooth printing is available
   */
  isAvailable: (): boolean => {
    return Capacitor.isNativePlatform() && getThermalPrinter() !== null;
  },

  /**
   * List available Bluetooth printers
   */
  listPrinters: async (): Promise<BluetoothPrinter[]> => {
    const printer = getThermalPrinter();
    if (!printer) {
      throw new Error('Bluetooth printer not available on this platform');
    }

    try {
      const result = await printer.listPrinters();
      return result.printers || [];
    } catch (error) {
      console.error('Error listing printers:', error);
      throw error;
    }
  },

  /**
   * Connect to a Bluetooth printer
   */
  connect: async (address: string): Promise<void> => {
    const printer = getThermalPrinter();
    if (!printer) {
      throw new Error('Bluetooth printer not available on this platform');
    }

    try {
      await printer.connect({ address });
      // Save connected printer address to localStorage
      localStorage.setItem('connected_printer_address', address);
    } catch (error) {
      console.error('Error connecting to printer:', error);
      throw error;
    }
  },

  /**
   * Disconnect from current printer
   */
  disconnect: async (): Promise<void> => {
    const printer = getThermalPrinter();
    if (!printer) {
      throw new Error('Bluetooth printer not available on this platform');
    }

    try {
      await printer.disconnect();
      localStorage.removeItem('connected_printer_address');
    } catch (error) {
      console.error('Error disconnecting printer:', error);
      throw error;
    }
  },

  /**
   * Get saved printer address
   */
  getSavedPrinterAddress: (): string | null => {
    return localStorage.getItem('connected_printer_address');
  },

  /**
   * Print receipt directly to Bluetooth printer
   */
  printReceipt: async (receiptData: {
    transactionNumber: string;
    date: Date;
    items: Array<{ name: string; quantity: number; price: number; subtotal: number }>;
    subtotal: number;
    tax: number;
    taxRate: number;
    serviceCharge: number;
    total: number;
    paymentMethod: string;
    paymentAmount: number;
    changeAmount: number;
    customerName?: string;
    customerPoints?: number;
    earnedPoints?: number;
  }): Promise<void> => {
    const printer = getThermalPrinter();
    if (!printer) {
      throw new Error('Bluetooth printer not available on this platform');
    }

    try {
      // Header
      await printer.printText({ text: 'BASMIKUMAN POS', align: 'center', bold: true, size: 2 });
      await printer.printText({ text: 'Makanan Enak, Harga Terjangkau', align: 'center' });
      await printer.printDivider({ char: '-', length: 32 });
      await printer.feed({ lines: 1 });

      // Transaction Info
      await printer.printText({ text: `No: ${receiptData.transactionNumber}`, align: 'left' });
      await printer.printText({ 
        text: `Tanggal: ${receiptData.date.toLocaleDateString('id-ID')} ${receiptData.date.toLocaleTimeString('id-ID')}`, 
        align: 'left' 
      });
      
      if (receiptData.customerName) {
        await printer.printText({ text: `Customer: ${receiptData.customerName}`, align: 'left' });
      }
      
      await printer.printDivider({ char: '-', length: 32 });
      await printer.feed({ lines: 1 });

      // Items
      for (const item of receiptData.items) {
        await printer.printText({ text: item.name, align: 'left', bold: true });
        const itemLine = `  ${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}`;
        const itemTotal = `Rp ${item.subtotal.toLocaleString('id-ID')}`;
        const spacer = ' '.repeat(Math.max(1, 32 - itemLine.length - itemTotal.length));
        await printer.printText({ text: itemLine + spacer + itemTotal, align: 'left' });
      }

      await printer.feed({ lines: 1 });
      await printer.printDivider({ char: '-', length: 32 });

      // Totals
      const printLine = async (label: string, value: string) => {
        const spacer = ' '.repeat(Math.max(1, 32 - label.length - value.length));
        await printer.printText({ text: label + spacer + value, align: 'left' });
      };

      await printLine('Subtotal:', `Rp ${receiptData.subtotal.toLocaleString('id-ID')}`);
      
      if (receiptData.tax > 0) {
        await printLine(`Pajak (${receiptData.taxRate}%):`, `Rp ${receiptData.tax.toLocaleString('id-ID')}`);
      }
      
      if (receiptData.serviceCharge > 0) {
        await printLine('Service:', `Rp ${receiptData.serviceCharge.toLocaleString('id-ID')}`);
      }

      await printer.printDivider({ char: '=', length: 32 });
      await printer.printText({ 
        text: `TOTAL: Rp ${receiptData.total.toLocaleString('id-ID')}`, 
        align: 'left', 
        bold: true, 
        size: 2 
      });
      await printer.printDivider({ char: '=', length: 32 });

      // Payment
      await printer.feed({ lines: 1 });
      const paymentMethodLabel = receiptData.paymentMethod === 'cash' ? 'Tunai' : 
                                  receiptData.paymentMethod === 'qris' ? 'QRIS' : 'Transfer';
      await printLine('Metode:', paymentMethodLabel);
      await printLine('Bayar:', `Rp ${receiptData.paymentAmount.toLocaleString('id-ID')}`);
      
      if (receiptData.changeAmount > 0) {
        await printLine('Kembali:', `Rp ${receiptData.changeAmount.toLocaleString('id-ID')}`);
      }

      // Loyalty Points
      if (receiptData.earnedPoints && receiptData.earnedPoints > 0) {
        await printer.feed({ lines: 1 });
        await printer.printDivider({ char: '-', length: 32 });
        await printer.printText({ text: 'LOYALTY POINTS', align: 'center', bold: true });
        await printLine('Poin didapat:', `+${receiptData.earnedPoints}`);
        if (receiptData.customerPoints !== undefined) {
          await printLine('Total poin:', `${receiptData.customerPoints}`);
        }
      }

      // Footer
      await printer.feed({ lines: 1 });
      await printer.printDivider({ char: '-', length: 32 });
      await printer.printText({ text: 'Terima kasih atas kunjungan Anda!', align: 'center' });
      await printer.printText({ text: 'Selamat menikmati!', align: 'center' });
      
      // Feed and cut
      await printer.feed({ lines: 3 });
      await printer.cut();

    } catch (error) {
      console.error('Error printing receipt:', error);
      throw error;
    }
  },

  /**
   * Print kitchen receipt (simpler format)
   */
  printKitchenReceipt: async (data: {
    orderNumber: string;
    date: Date;
    items: Array<{ name: string; quantity: number; category: string }>;
    customerName?: string;
    notes?: string;
  }): Promise<void> => {
    const printer = getThermalPrinter();
    if (!printer) {
      throw new Error('Bluetooth printer not available on this platform');
    }

    try {
      await printer.printText({ text: '=== ORDER DAPUR ===', align: 'center', bold: true, size: 2 });
      await printer.feed({ lines: 1 });
      
      await printer.printText({ text: `Order: ${data.orderNumber}`, align: 'left', bold: true });
      await printer.printText({ 
        text: `Waktu: ${data.date.toLocaleTimeString('id-ID')}`, 
        align: 'left' 
      });
      
      if (data.customerName) {
        await printer.printText({ text: `Nama: ${data.customerName}`, align: 'left' });
      }
      
      await printer.printDivider({ char: '=', length: 32 });
      await printer.feed({ lines: 1 });

      // Group items by category
      const grouped = data.items.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {} as Record<string, typeof data.items>);

      for (const [category, items] of Object.entries(grouped)) {
        await printer.printText({ text: `[${category}]`, align: 'left', bold: true });
        for (const item of items) {
          await printer.printText({ 
            text: `  ${item.quantity}x  ${item.name}`, 
            align: 'left',
            size: 2
          });
        }
        await printer.feed({ lines: 1 });
      }

      if (data.notes) {
        await printer.printDivider({ char: '-', length: 32 });
        await printer.printText({ text: 'CATATAN:', align: 'left', bold: true });
        await printer.printText({ text: data.notes, align: 'left' });
      }

      await printer.feed({ lines: 3 });
      await printer.cut();

    } catch (error) {
      console.error('Error printing kitchen receipt:', error);
      throw error;
    }
  }
};
