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

      await CapacitorThermalPrinter.begin()
        .align('center')
        .bold()
        .doubleWidth()
        .text(`${receiptData.storeName}\n`)
        .clearFormatting()
        .align('center')
        .text(`${dateStr} ${timeStr}\n`)
        .text('--------------------------------\n')
        .align('left');

      // Order type
      if (receiptData.orderType) {
        await CapacitorThermalPrinter
          .text(`Jenis: ${receiptData.orderType === 'dine-in' ? 'Makan Di Tempat' : 'Bawa Pulang'}\n`)
          .text('--------------------------------\n');
      }

      // Items
      for (const item of receiptData.items) {
        await CapacitorThermalPrinter
          .text(`${item.name}\n`)
          .text(`  ${item.qty} x Rp ${item.price.toLocaleString('id-ID')}\n`)
          .align('right')
          .text(`Rp ${item.subtotal.toLocaleString('id-ID')}\n`)
          .align('left');
      }

      await CapacitorThermalPrinter.text('--------------------------------\n');

      // Totals
      await CapacitorThermalPrinter
        .align('left')
        .text(`Subtotal:`)
        .align('right')
        .text(`Rp ${receiptData.subtotal.toLocaleString('id-ID')}\n`)
        .align('left')
        .text(`Pajak (${receiptData.tax > 0 ? '11%' : '0%'}):`)
        .align('right')
        .text(`Rp ${receiptData.tax.toLocaleString('id-ID')}\n`)
        .align('left')
        .bold()
        .doubleWidth()
        .text(`TOTAL:`)
        .align('right')
        .text(`Rp ${receiptData.total.toLocaleString('id-ID')}\n`)
        .clearFormatting();

      // Payment info
      if (receiptData.paymentMethod) {
        await CapacitorThermalPrinter
          .align('left')
          .text('--------------------------------\n')
          .text(`Metode: ${receiptData.paymentMethod}\n`);
        
        if (receiptData.change !== undefined && receiptData.change > 0) {
          await CapacitorThermalPrinter
            .text(`Kembalian: Rp ${receiptData.change.toLocaleString('id-ID')}\n`);
        }
      }

      // Footer
      await CapacitorThermalPrinter
        .align('center')
        .text('--------------------------------\n')
        .text('Terima Kasih\n')
        .text(`${receiptData.storeName}\n`);

      if (receiptData.cashierName) {
        await CapacitorThermalPrinter.text(`Kasir: ${receiptData.cashierName}\n`);
      }

      await CapacitorThermalPrinter
        .text('\n\n')
        .feedCutPaper()
        .write();

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

      await CapacitorThermalPrinter.begin()
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
        await CapacitorThermalPrinter
          .bold()
          .text('Info Pesanan:\n')
          .clearFormatting();

        if (receiptData.orderType) {
          await CapacitorThermalPrinter
            .text(`Jenis: ${receiptData.orderType === 'dine-in' ? 'Makan Di Tempat' : 'Bawa Pulang'}\n`);
        }

        if (receiptData.tableNumber) {
          await CapacitorThermalPrinter.text(`Meja: ${receiptData.tableNumber}\n`);
        }

        await CapacitorThermalPrinter.text('================================\n');
      }

      // Items
      await CapacitorThermalPrinter
        .bold()
        .text('Pesanan:\n')
        .clearFormatting();

      for (const item of receiptData.items) {
        await CapacitorThermalPrinter
          .bold()
          .doubleWidth()
          .text(`${item.qty}x ${item.name}\n`)
          .clearFormatting();

        if (item.notes) {
          await CapacitorThermalPrinter
            .text(`   Catatan: ${item.notes}\n`);
        }

        await CapacitorThermalPrinter.text('\n');
      }

      await CapacitorThermalPrinter
        .text('================================\n')
        .align('center')
        .text('\n\n')
        .feedCutPaper()
        .write();

    } catch (error) {
      console.error('Error printing kitchen receipt:', error);
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
    isNativeSupported,
  };
};
