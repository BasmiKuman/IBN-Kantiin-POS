import { useState, useEffect, useCallback } from 'react';
import { CapacitorThermalPrinter } from 'capacitor-thermal-printer';
import type { BluetoothDevice } from 'capacitor-thermal-printer';
import { Capacitor } from '@capacitor/core';

interface UseNativeBluetoothPrinterReturn {
  isConnected: boolean;
  isConnecting: boolean;
  isScanning: boolean;
  availableDevices: BluetoothDevice[];
  connectedDevice: BluetoothDevice | null;
  printerName: string | null; // Add this for compatibility with web hook
  connect: (address: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
  printReceipt: (receiptData: {
    storeName: string;
    items: Array<{ name: string; qty: number; price: number; subtotal: number }>;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod?: string;
    change?: number;
    cashierName?: string;
    orderType?: 'dine-in' | 'takeaway';
  }) => Promise<void>;
  printKitchenReceipt: (receiptData: {
    items: Array<{ name: string; qty: number; notes?: string }>;
    orderType?: 'dine-in' | 'takeaway';
    tableNumber?: string;
  }) => Promise<void>;
  printSalesSummary: (summaryData: {
    startDate: string;
    endDate: string;
    transactions: Array<{
      transactionNumber: string;
      items: Array<{ name: string; qty: number; price: number; subtotal: number }>;
      subtotal: number;
      tax: number;
      total: number;
      paymentMethod?: string;
    }>;
    totalTransactions: number;
    totalRevenue: number;
    totalTax: number;
    grandTotal: number;
  }) => Promise<void>;
  isNativeSupported: boolean;
}

export const useNativeBluetoothPrinter = (): UseNativeBluetoothPrinterReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);

  // Check if we're running in a native app
  const isNativeSupported = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isNativeSupported) return;

    // Setup event listeners
    const setupListeners = async () => {
      // Listen for discovered devices
      await CapacitorThermalPrinter.addListener('discoverDevices', (data) => {
        setAvailableDevices(data.devices);
      });

      // Listen for discovery finish
      await CapacitorThermalPrinter.addListener('discoveryFinish', () => {
        setIsScanning(false);
      });

      // Listen for connection
      await CapacitorThermalPrinter.addListener('connected', (device) => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectedDevice(device);
      });

      // Listen for disconnection
      await CapacitorThermalPrinter.addListener('disconnected', () => {
        setIsConnected(false);
        setConnectedDevice(null);
      });
    };

    setupListeners();

    // Check initial connection status
    const checkConnection = async () => {
      try {
        const connected = await CapacitorThermalPrinter.isConnected();
        setIsConnected(connected);
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };

    checkConnection();
  }, [isNativeSupported]);

  const startScan = useCallback(async () => {
    if (!isNativeSupported) return;
    
    try {
      setIsScanning(true);
      setAvailableDevices([]);
      await CapacitorThermalPrinter.startScan();
    } catch (error) {
      console.error('Error starting scan:', error);
      setIsScanning(false);
      throw error;
    }
  }, [isNativeSupported]);

  const stopScan = useCallback(async () => {
    if (!isNativeSupported) return;
    
    try {
      await CapacitorThermalPrinter.stopScan();
      setIsScanning(false);
    } catch (error) {
      console.error('Error stopping scan:', error);
      throw error;
    }
  }, [isNativeSupported]);

  const connect = useCallback(async (address: string): Promise<boolean> => {
    if (!isNativeSupported) return false;

    try {
      setIsConnecting(true);
      const device = await CapacitorThermalPrinter.connect({ address });
      
      if (device) {
        setIsConnected(true);
        setConnectedDevice(device);
        setIsConnecting(false);
        return true;
      } else {
        setIsConnecting(false);
        return false;
      }
    } catch (error) {
      console.error('Error connecting to printer:', error);
      setIsConnecting(false);
      throw error;
    }
  }, [isNativeSupported]);

  const disconnect = useCallback(async () => {
    if (!isNativeSupported) return;

    try {
      await CapacitorThermalPrinter.disconnect();
      setIsConnected(false);
      setConnectedDevice(null);
    } catch (error) {
      console.error('Error disconnecting from printer:', error);
      throw error;
    }
  }, [isNativeSupported]);

  const printReceipt = useCallback(async (receiptData: {
    storeName: string;
    items: Array<{ name: string; qty: number; price: number; subtotal: number }>;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod?: string;
    change?: number;
    cashierName?: string;
    orderType?: 'dine-in' | 'takeaway';
  }) => {
    if (!isNativeSupported || !isConnected) {
      throw new Error('Printer not connected');
    }

    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID');
      const timeStr = now.toLocaleTimeString('id-ID');

      // Build receipt with chaining (no await until write())
      let printer = CapacitorThermalPrinter.begin()
        .align('center')
        .bold()
        .doubleWidth()
        .text(`${receiptData.storeName}\n`)
        .clearFormatting()
        .align('center')
        .text(`${dateStr} ${timeStr}\n`)
        .text('================================\n')
        .align('left');

      // Order type
      if (receiptData.orderType) {
        printer = printer
          .text(`Jenis: ${receiptData.orderType === 'dine-in' ? 'Makan Di Tempat' : 'Bawa Pulang'}\n`)
          .text('================================\n');
      }

      // Items header
      printer = printer.text('PESANAN:\n');

      // Items - format sederhana tanpa align kanan-kiri
      for (const item of receiptData.items) {
        printer = printer
          .text(`${item.name}\n`)
          .text(`${item.qty} x ${item.price.toLocaleString('id-ID')} = ${item.subtotal.toLocaleString('id-ID')}\n`)
          .text('\n');
      }

      printer = printer.text('================================\n');

      // Totals - format sederhana left aligned
      printer = printer
        .text(`Subtotal: Rp ${receiptData.subtotal.toLocaleString('id-ID')}\n`)
        .text(`Pajak ${receiptData.tax > 0 ? '(11%)' : '(0%)'}: Rp ${receiptData.tax.toLocaleString('id-ID')}\n`)
        .text('--------------------------------\n')
        .bold()
        .text(`TOTAL: Rp ${receiptData.total.toLocaleString('id-ID')}\n`)
        .clearFormatting()
        .text('================================\n');

      // Payment info
      if (receiptData.paymentMethod) {
        printer = printer
          .text(`Metode Bayar: ${receiptData.paymentMethod}\n`);
        
        if (receiptData.change !== undefined && receiptData.change > 0) {
          printer = printer
            .text(`Kembalian: Rp ${receiptData.change.toLocaleString('id-ID')}\n`);
        }
        printer = printer.text('\n');
      }

      // Footer
      printer = printer
        .align('center')
        .text('Terima Kasih\n')
        .text(`${receiptData.storeName}\n`);

      if (receiptData.cashierName) {
        printer = printer.text(`Kasir: ${receiptData.cashierName}\n`);
      }

      printer = printer
        .text('\n\n\n')
        .feedCutPaper();

      // Now send to printer
      await printer.write();

    } catch (error) {
      console.error('Error printing receipt:', error);
      throw error;
    }
  }, [isNativeSupported, isConnected]);

  const printKitchenReceipt = useCallback(async (receiptData: {
    items: Array<{ name: string; qty: number; notes?: string }>;
    orderType?: 'dine-in' | 'takeaway';
    tableNumber?: string;
  }) => {
    if (!isNativeSupported || !isConnected) {
      throw new Error('Printer not connected');
    }

    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID');

      // Build kitchen receipt with chaining
      let printer = CapacitorThermalPrinter.begin()
        .align('center')
        .bold()
        .doubleWidth()
        .text('STRUK DAPUR\n')
        .clearFormatting()
        .align('center')
        .text(`${timeStr}\n`)
        .text('================================\n')
        .align('left');

      // Order info
      if (receiptData.orderType || receiptData.tableNumber) {
        printer = printer
          .bold()
          .text('Info Pesanan:\n')
          .clearFormatting();

        if (receiptData.orderType) {
          printer = printer
            .text(`Jenis: ${receiptData.orderType === 'dine-in' ? 'Makan Di Tempat' : 'Bawa Pulang'}\n`);
        }

        if (receiptData.tableNumber) {
          printer = printer.text(`Meja: ${receiptData.tableNumber}\n`);
        }

        printer = printer.text('================================\n');
      }

      // Items
      printer = printer
        .bold()
        .text('Pesanan:\n')
        .clearFormatting();

      for (const item of receiptData.items) {
        printer = printer
          .bold()
          .doubleWidth()
          .text(`${item.qty}x ${item.name}\n`)
          .clearFormatting();

        if (item.notes) {
          printer = printer
            .text(`   Catatan: ${item.notes}\n`);
        }

        printer = printer.text('\n');
      }

      printer = printer
        .text('================================\n')
        .align('center')
        .text('\n\n')
        .feedCutPaper();

      // Send to printer
      await printer.write();

    } catch (error) {
      console.error('Error printing kitchen receipt:', error);
      throw error;
    }
  }, [isNativeSupported, isConnected]);

  const printSalesSummary = useCallback(async (summaryData: {
    startDate: string;
    endDate: string;
    transactions: Array<{
      transactionNumber: string;
      items: Array<{ name: string; qty: number; price: number; subtotal: number }>;
      subtotal: number;
      tax: number;
      total: number;
      paymentMethod?: string;
    }>;
    totalTransactions: number;
    totalRevenue: number;
    totalTax: number;
    grandTotal: number;
  }) => {
    if (!isNativeSupported || !isConnected) {
      throw new Error('Printer not connected');
    }

    try {
      const now = new Date();
      const printTime = now.toLocaleString('id-ID');

      // Build sales summary receipt
      let printer = CapacitorThermalPrinter.begin()
        .align('center')
        .bold()
        .doubleWidth()
        .text('LAPORAN PENJUALAN\n')
        .clearFormatting()
        .align('center')
        .text(`Cetak: ${printTime}\n`)
        .text('================================\n')
        .align('left')
        .bold()
        .text(`Periode:\n`)
        .clearFormatting()
        .text(`${summaryData.startDate} s/d ${summaryData.endDate}\n`)
        .text('================================\n');

      // Aggregate items across all transactions
      const itemSummary = new Map<string, { qty: number; revenue: number }>();
      
      for (const transaction of summaryData.transactions) {
        for (const item of transaction.items) {
          const existing = itemSummary.get(item.name) || { qty: 0, revenue: 0 };
          itemSummary.set(item.name, {
            qty: existing.qty + item.qty,
            revenue: existing.revenue + item.subtotal,
          });
        }
      }

      // Print aggregated items
      printer = printer
        .bold()
        .text('RINGKASAN PRODUK:\n')
        .clearFormatting();

      for (const [itemName, data] of itemSummary.entries()) {
        printer = printer
          .text(`${itemName}\n`)
          .text(`  ${data.qty} pcs = Rp ${data.revenue.toLocaleString('id-ID')}\n`);
      }

      printer = printer.text('================================\n');

      // Payment method breakdown
      const paymentSummary = new Map<string, number>();
      for (const transaction of summaryData.transactions) {
        const method = transaction.paymentMethod || 'Cash';
        paymentSummary.set(method, (paymentSummary.get(method) || 0) + 1);
      }

      printer = printer
        .bold()
        .text('METODE PEMBAYARAN:\n')
        .clearFormatting();

      for (const [method, count] of paymentSummary.entries()) {
        printer = printer.text(`${method}: ${count} transaksi\n`);
      }

      printer = printer.text('================================\n');

      // Summary totals
      printer = printer
        .bold()
        .text('TOTAL PENJUALAN:\n')
        .clearFormatting()
        .text(`Jumlah Transaksi: ${summaryData.totalTransactions}\n`)
        .text(`Subtotal: Rp ${summaryData.totalRevenue.toLocaleString('id-ID')}\n`)
        .text(`Pajak: Rp ${summaryData.totalTax.toLocaleString('id-ID')}\n`)
        .text('--------------------------------\n')
        .bold()
        .text(`GRAND TOTAL: Rp ${summaryData.grandTotal.toLocaleString('id-ID')}\n`)
        .clearFormatting()
        .text('================================\n');

      // Footer
      printer = printer
        .align('center')
        .text('Laporan ini dicetak otomatis\n')
        .text('dari sistem POS\n')
        .text('\n\n\n')
        .feedCutPaper();

      // Send to printer
      await printer.write();

    } catch (error) {
      console.error('Error printing sales summary:', error);
      throw error;
    }
  }, [isNativeSupported, isConnected]);

  return {
    isConnected,
    isConnecting,
    isScanning,
    availableDevices,
    connectedDevice,
    printerName: connectedDevice?.name || null, // For compatibility with web hook
    connect,
    disconnect,
    startScan,
    stopScan,
    printReceipt,
    printKitchenReceipt,
    printSalesSummary,
    isNativeSupported,
  };
};
