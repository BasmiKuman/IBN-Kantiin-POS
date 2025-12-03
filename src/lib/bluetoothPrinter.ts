import { Capacitor, registerPlugin } from '@capacitor/core';

// Web Bluetooth API type definitions
declare global {
  interface Window {
    CapacitorThermalPrinter?: ThermalPrinter;
  }
  
  interface Navigator {
    bluetooth?: {
      requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
    };
  }
  
  interface RequestDeviceOptions {
    filters?: BluetoothLEScanFilter[];
    optionalServices?: string[];
    acceptAllDevices?: boolean;
  }
  
  interface BluetoothLEScanFilter {
    services?: string[];
    name?: string;
    namePrefix?: string;
  }
  
  interface BluetoothDevice {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
  }
  
  interface BluetoothRemoteGATTServer {
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    getPrimaryServices(): Promise<BluetoothRemoteGATTService[]>;
  }
  
  interface BluetoothRemoteGATTService {
    uuid: string;
    getCharacteristics(): Promise<BluetoothRemoteGATTCharacteristic[]>;
  }
  
  interface BluetoothRemoteGATTCharacteristic {
    uuid: string;
    properties: {
      write: boolean;
      writeWithoutResponse: boolean;
    };
    writeValue(value: BufferSource): Promise<void>;
  }
}

// Define our custom Bluetooth Permissions plugin
interface BluetoothPermissionsPlugin {
  checkPermissions(): Promise<{ [key: string]: 'granted' | 'denied' }>;
  requestPermissions(): Promise<{ [key: string]: 'granted' | 'denied' }>;
}

const BluetoothPermissions = registerPlugin<BluetoothPermissionsPlugin>('BluetoothPermissions');

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
    return null;
  }
  
  try {
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

// ============== WEB BLUETOOTH API (for Desktop/Browser) ==============

let webBluetoothDevice: BluetoothDevice | null = null;
let webBluetoothCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

// ESC/POS commands
const ESC = '\x1B';
const GS = '\x1D';

const escPosCommands = {
  init: ESC + '@',
  alignLeft: ESC + 'a' + '\x00',
  alignCenter: ESC + 'a' + '\x01',
  alignRight: ESC + 'a' + '\x02',
  bold: ESC + 'E' + '\x01',
  boldOff: ESC + 'E' + '\x00',
  textNormal: ESC + '!' + '\x00',
  textDouble: ESC + '!' + '\x30',
  textLarge: ESC + '!' + '\x20',
  feedLine: '\n',
  cut: GS + 'V' + '\x00',
};

/**
 * Check if Web Bluetooth is supported in browser
 */
function isWebBluetoothSupported(): boolean {
  return typeof navigator !== 'undefined' && 
         'bluetooth' in navigator && 
         typeof (navigator as any).bluetooth?.requestDevice === 'function';
}

/**
 * Convert text to ESC/POS bytes
 */
function textToBytes(text: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(text);
}

/**
 * Send data to Web Bluetooth printer
 */
async function sendToWebBluetooth(data: string | Uint8Array): Promise<void> {
  if (!webBluetoothCharacteristic) {
    throw new Error('Printer not connected via Web Bluetooth');
  }
  
  const bytes = typeof data === 'string' ? textToBytes(data) : data;
  
  // Split into chunks (some printers have MTU limits)
  const chunkSize = 512;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    await webBluetoothCharacteristic.writeValue(chunk);
    // Small delay between chunks
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

/**
 * Web Bluetooth: List printers (request device from user)
 */
async function webBluetoothListPrinters(): Promise<BluetoothPrinter[]> {
  if (!isWebBluetoothSupported()) {
    throw new Error('Web Bluetooth tidak didukung di browser ini. Gunakan Chrome/Edge desktop.');
  }

  try {
    // Request device from user (shows browser dialog)
    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', // Common printer service
        '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Another common UUID
      ]
    });

    // Cache the device for connection
    webBluetoothDevice = device;

    return [{
      name: device.name || 'Unknown Printer',
      address: device.id || 'web-bluetooth-device'
    }];
  } catch (error) {
    console.error('Web Bluetooth scan error:', error);
    throw error;
  }
}

/**
 * Web Bluetooth: Connect to printer
 */
async function webBluetoothConnect(deviceId: string): Promise<void> {
  if (!isWebBluetoothSupported()) {
    throw new Error('Web Bluetooth tidak didukung di browser ini');
  }

  try {
    // If we already have a cached device, reconnect
    if (webBluetoothDevice && (webBluetoothDevice.id === deviceId || deviceId === 'web-bluetooth-device')) {
      if (!webBluetoothDevice.gatt?.connected) {
        const server = await webBluetoothDevice.gatt!.connect();
        
        // Find printer service and characteristic
        const services = await server.getPrimaryServices();
        
        for (const service of services) {
          try {
            const characteristics = await service.getCharacteristics();
            for (const char of characteristics) {
              if (char.properties.write || char.properties.writeWithoutResponse) {
                webBluetoothCharacteristic = char;
                console.log('Connected to printer characteristic:', char.uuid);
                
                // Initialize printer
                await sendToWebBluetooth(escPosCommands.init);
                return;
              }
            }
          } catch (err) {
            // Try next service
            continue;
          }
        }
        
        throw new Error('Tidak dapat menemukan characteristic printer yang sesuai');
      }
    } else {
      throw new Error('Device tidak ditemukan. Silakan scan ulang printer.');
    }
  } catch (error) {
    console.error('Web Bluetooth connect error:', error);
    throw error;
  }
}

/**
 * Web Bluetooth: Disconnect
 */
async function webBluetoothDisconnect(): Promise<void> {
  if (webBluetoothDevice?.gatt?.connected) {
    webBluetoothDevice.gatt.disconnect();
  }
  webBluetoothDevice = null;
  webBluetoothCharacteristic = null;
}

/**
 * Web Bluetooth: Print receipt using ESC/POS commands
 */
async function webBluetoothPrintReceipt(receiptData: {
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
}): Promise<void> {
  try {
    // Initialize
    await sendToWebBluetooth(escPosCommands.init);
    
    // Header
    await sendToWebBluetooth(escPosCommands.alignCenter + escPosCommands.bold + escPosCommands.textDouble);
    await sendToWebBluetooth('BASMIKUMAN POS\n');
    await sendToWebBluetooth(escPosCommands.boldOff + escPosCommands.textNormal);
    await sendToWebBluetooth('Makanan Enak, Harga Terjangkau\n');
    await sendToWebBluetooth(escPosCommands.alignLeft);
    await sendToWebBluetooth('-'.repeat(32) + '\n');
    
    // Transaction Info
    await sendToWebBluetooth(`No: ${receiptData.transactionNumber}\n`);
    await sendToWebBluetooth(`Tanggal: ${receiptData.date.toLocaleDateString('id-ID')} ${receiptData.date.toLocaleTimeString('id-ID')}\n`);
    
    if (receiptData.customerName) {
      await sendToWebBluetooth(`Customer: ${receiptData.customerName}\n`);
    }
    
    await sendToWebBluetooth('-'.repeat(32) + '\n');
    
    // Items
    for (const item of receiptData.items) {
      await sendToWebBluetooth(escPosCommands.bold + item.name + escPosCommands.boldOff + '\n');
      const itemLine = `  ${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}`;
      const itemTotal = `Rp ${item.subtotal.toLocaleString('id-ID')}`;
      const spacer = ' '.repeat(Math.max(1, 32 - itemLine.length - itemTotal.length));
      await sendToWebBluetooth(itemLine + spacer + itemTotal + '\n');
    }
    
    await sendToWebBluetooth('\n' + '-'.repeat(32) + '\n');
    
    // Totals
    const printLine = async (label: string, value: string) => {
      const spacer = ' '.repeat(Math.max(1, 32 - label.length - value.length));
      await sendToWebBluetooth(label + spacer + value + '\n');
    };
    
    await printLine('Subtotal:', `Rp ${receiptData.subtotal.toLocaleString('id-ID')}`);
    
    if (receiptData.tax > 0) {
      await printLine(`Pajak (${receiptData.taxRate}%):`, `Rp ${receiptData.tax.toLocaleString('id-ID')}`);
    }
    
    if (receiptData.serviceCharge > 0) {
      await printLine('Service:', `Rp ${receiptData.serviceCharge.toLocaleString('id-ID')}`);
    }
    
    await sendToWebBluetooth('='.repeat(32) + '\n');
    await sendToWebBluetooth(escPosCommands.bold + escPosCommands.textLarge);
    await printLine('TOTAL:', `Rp ${receiptData.total.toLocaleString('id-ID')}`);
    await sendToWebBluetooth(escPosCommands.boldOff + escPosCommands.textNormal);
    await sendToWebBluetooth('='.repeat(32) + '\n\n');
    
    // Payment
    const paymentMethodLabel = receiptData.paymentMethod === 'cash' ? 'Tunai' : 
                                receiptData.paymentMethod === 'qris' ? 'QRIS' : 'Transfer';
    await printLine('Metode:', paymentMethodLabel);
    await printLine('Bayar:', `Rp ${receiptData.paymentAmount.toLocaleString('id-ID')}`);
    
    if (receiptData.changeAmount > 0) {
      await printLine('Kembali:', `Rp ${receiptData.changeAmount.toLocaleString('id-ID')}`);
    }
    
    // Loyalty Points
    if (receiptData.earnedPoints && receiptData.earnedPoints > 0) {
      await sendToWebBluetooth('\n' + '-'.repeat(32) + '\n');
      await sendToWebBluetooth(escPosCommands.alignCenter + escPosCommands.bold);
      await sendToWebBluetooth('LOYALTY POINTS\n');
      await sendToWebBluetooth(escPosCommands.boldOff + escPosCommands.alignLeft);
      await printLine('Poin didapat:', `+${receiptData.earnedPoints}`);
      if (receiptData.customerPoints !== undefined) {
        await printLine('Total poin:', `${receiptData.customerPoints}`);
      }
    }
    
    // Footer
    await sendToWebBluetooth('\n' + '-'.repeat(32) + '\n');
    await sendToWebBluetooth(escPosCommands.alignCenter);
    await sendToWebBluetooth('Terima kasih atas kunjungan Anda!\n');
    await sendToWebBluetooth('Selamat menikmati!\n');
    
    // Feed and cut
    await sendToWebBluetooth('\n\n\n');
    await sendToWebBluetooth(escPosCommands.cut);
    
  } catch (error) {
    console.error('Error printing receipt via Web Bluetooth:', error);
    throw error;
  }
}

// ============== END WEB BLUETOOTH PRINT ==============

/**
 * Request Bluetooth permissions on Android
 */
async function requestBluetoothPermissions(): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
    return true; // Not Android, assume granted (or use Web Bluetooth)
  }

  try {
    // Use our custom permissions plugin
    const result = await BluetoothPermissions.requestPermissions();
    console.log('Bluetooth permissions result:', result);
    
    // Check if critical permissions are granted
    if (result.bluetoothScan === 'granted' && result.bluetoothConnect === 'granted') {
      return true;
    }
    
    // For older Android, check legacy permissions
    if (result.bluetooth === 'granted' && result.location === 'granted') {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error requesting Bluetooth permissions:', error);
    // If plugin not available, assume permissions will be handled by system
    return true;
  }
}

export const bluetoothPrinterService = {
  /**
   * Check if Bluetooth printing is available (Native or Web)
   */
  isAvailable: (): boolean => {
    // Native platform with plugin
    if (Capacitor.isNativePlatform() && getThermalPrinter() !== null) {
      return true;
    }
    // Web Bluetooth in browser
    if (isWebBluetoothSupported()) {
      return true;
    }
    return false;
  },

  /**
   * Get platform type for UI display
   */
  getPlatformType: (): 'native' | 'web' | 'unsupported' => {
    if (Capacitor.isNativePlatform() && getThermalPrinter() !== null) {
      return 'native';
    }
    if (isWebBluetoothSupported()) {
      return 'web';
    }
    return 'unsupported';
  },

  /**
   * Request Bluetooth permissions (Android 12+)
   */
  requestPermissions: async (): Promise<boolean> => {
    return await requestBluetoothPermissions();
  },

  /**
   * List available Bluetooth printers
   */
  listPrinters: async (): Promise<BluetoothPrinter[]> => {
    // Try native plugin first
    const printer = getThermalPrinter();
    if (printer) {
      try {
        const result = await printer.listPrinters();
        return result.printers || [];
      } catch (error) {
        console.error('Error listing printers (native):', error);
        throw error;
      }
    }

    // Fallback to Web Bluetooth
    if (isWebBluetoothSupported()) {
      try {
        return await webBluetoothListPrinters();
      } catch (error) {
        console.error('Error listing printers (web):', error);
        throw error;
      }
    }

    throw new Error('Bluetooth printer not available on this platform');
  },

  /**
   * Connect to a Bluetooth printer
   */
  connect: async (address: string): Promise<void> => {
    // Try native plugin first
    const printer = getThermalPrinter();
    if (printer) {
      try {
        await printer.connect({ address });
        localStorage.setItem('connected_printer_address', address);
        localStorage.setItem('printer_platform', 'native');
        return;
      } catch (error) {
        console.error('Error connecting to printer (native):', error);
        throw error;
      }
    }

    // Fallback to Web Bluetooth
    if (isWebBluetoothSupported()) {
      try {
        await webBluetoothConnect(address);
        localStorage.setItem('connected_printer_address', address);
        localStorage.setItem('printer_platform', 'web');
        return;
      } catch (error) {
        console.error('Error connecting to printer (web):', error);
        throw error;
      }
    }

    throw new Error('Bluetooth printer not available on this platform');
  },

  /**
   * Disconnect from current printer
   */
  disconnect: async (): Promise<void> => {
    const platform = localStorage.getItem('printer_platform');
    
    // Try native plugin
    const printer = getThermalPrinter();
    if (printer && platform === 'native') {
      try {
        await printer.disconnect();
        localStorage.removeItem('connected_printer_address');
        localStorage.removeItem('printer_platform');
        return;
      } catch (error) {
        console.error('Error disconnecting printer (native):', error);
        throw error;
      }
    }

    // Fallback to Web Bluetooth
    if (isWebBluetoothSupported() && platform === 'web') {
      try {
        await webBluetoothDisconnect();
        localStorage.removeItem('connected_printer_address');
        localStorage.removeItem('printer_platform');
        return;
      } catch (error) {
        console.error('Error disconnecting printer (web):', error);
        throw error;
      }
    }

    throw new Error('No printer connected');
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
    const platform = localStorage.getItem('printer_platform');
    const printer = getThermalPrinter();
    
    // Try native plugin first
    if (printer && platform === 'native') {
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
        return;
      } catch (error) {
        console.error('Error printing receipt (native):', error);
        throw error;
      }
    }

    // Fallback to Web Bluetooth
    if (isWebBluetoothSupported() && platform === 'web') {
      try {
        await webBluetoothPrintReceipt(receiptData);
        return;
      } catch (error) {
        console.error('Error printing receipt (web):', error);
        throw error;
      }
    }

    throw new Error('Bluetooth printer not available on this platform');
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
