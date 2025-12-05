import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface BluetoothPrinter {
  device: BluetoothDevice | null;
  characteristic: BluetoothRemoteGATTCharacteristic | null;
  isConnected: boolean;
}

// ESC/POS Commands
const ESC = '\x1B';
const GS = '\x1D';

export const PrinterCommands = {
  INIT: ESC + '@',
  ALIGN_LEFT: ESC + 'a' + '\x00',
  ALIGN_CENTER: ESC + 'a' + '\x01',
  ALIGN_RIGHT: ESC + 'a' + '\x02',
  BOLD_ON: ESC + 'E' + '\x01',
  BOLD_OFF: ESC + 'E' + '\x00',
  FONT_SIZE_NORMAL: ESC + '!' + '\x00',     // Normal size (tidak pakai GS)
  FONT_SIZE_DOUBLE: ESC + '!' + '\x30',     // 2x height + width (lebih kecil dari sebelumnya)
  FONT_SIZE_LARGE: ESC + '!' + '\x10',      // 2x width only (tidak terlalu besar)
  CUT_PAPER: GS + 'V' + '\x41' + '\x00',
  LINE_FEED: '\n',
  LINE_FEED_3: '\n\n\n',
  SEPARATOR: '--------------------------------\n',
  SEPARATOR_BOLD: '================================\n',
};

export function useBluetoothPrinter() {
  const [printer, setPrinter] = useState<BluetoothPrinter>({
    device: null,
    characteristic: null,
    isConnected: false,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [storedDeviceName, setStoredDeviceName] = useState<string | null>(null);
  const { toast } = useToast();

  // Load last connected printer from localStorage
  useEffect(() => {
    const savedDeviceName = localStorage.getItem('bluetooth_printer_name');
    if (savedDeviceName) {
      setStoredDeviceName(savedDeviceName);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Check if running in native app (Capacitor)
      const isNativeApp = !!(window as any).Capacitor;
      
      // Check if Web Bluetooth API is available
      if (!navigator.bluetooth) {
        if (isNativeApp) {
          throw new Error('Fitur Bluetooth Printer belum tersedia di aplikasi mobile. Gunakan versi web di Chrome untuk sementara, atau tunggu update berikutnya dengan fitur native Bluetooth.');
        } else {
          throw new Error('Web Bluetooth API tidak didukung di browser ini. Gunakan Chrome/Edge versi terbaru.');
        }
      }

      // Request Bluetooth device - accept all devices for maximum compatibility
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Generic printer service
          '0000ff00-0000-1000-8000-00805f9b34fb', // Common thermal printer service
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Nordic UART Service
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Microchip Transparent UART
        ],
      });

      if (!device.gatt) {
        throw new Error('GATT tidak tersedia pada device ini');
      }

      console.log('Connecting to:', device.name);
      
      // Connect to GATT server
      const server = await device.gatt.connect();
      console.log('GATT server connected');
      
      // Get all services to find the right one
      const services = await (server as any).getPrimaryServices();
      console.log('Available services:', services.map((s: any) => s.uuid));
      
      let characteristic: BluetoothRemoteGATTCharacteristic | null = null;
      
      // Try common printer service UUIDs
      const serviceUUIDs = [
        '000018f0-0000-1000-8000-00805f9b34fb',
        '0000ff00-0000-1000-8000-00805f9b34fb',
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Nordic UART
        '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Microchip
      ];

      const characteristicUUIDs = [
        '49535343-8841-43f4-a8d4-ecbe34729bb3', // Microchip TX (write-only) - PRIORITAS!
        '0000ff01-0000-1000-8000-00805f9b34fb',
        '00002af1-0000-1000-8000-00805f9b34fb',
        '0000ff02-0000-1000-8000-00805f9b34fb',
        'e7810a72-73ae-499d-8c15-faa9aef0c3f2', // Nordic TX
        '49535343-1e4d-4bd9-ba61-23c647249616', // Microchip data
      ];

      // Try each service
      for (const serviceUUID of serviceUUIDs) {
        try {
          const service = await (server as any).getPrimaryService(serviceUUID);
          console.log(`Found service: ${serviceUUID}`);
          
          // Try to get write characteristic
          for (const charUUID of characteristicUUIDs) {
            try {
              characteristic = await service.getCharacteristic(charUUID);
              console.log(`Found characteristic: ${charUUID}`);
              break;
            } catch (e) {
              // Try next characteristic
            }
          }
          
          // If not found by UUID, get all characteristics
          if (!characteristic) {
            const characteristics = await service.getCharacteristics();
            console.log('Available characteristics:', characteristics.map((c: any) => c.uuid));
            
            // Find writable characteristic
            for (const char of characteristics) {
              if (char.properties.write || char.properties.writeWithoutResponse) {
                characteristic = char;
                console.log('Using writable characteristic:', char.uuid);
                console.log('Characteristic properties:', {
                  write: char.properties.write,
                  writeWithoutResponse: char.properties.writeWithoutResponse,
                  read: char.properties.read,
                  notify: char.properties.notify,
                });
                break;
              }
            }
          }
          
          if (characteristic) break;
        } catch (e) {
          // Try next service
          console.log(`Service ${serviceUUID} not found, trying next...`);
        }
      }

      if (!characteristic) {
        throw new Error('Printer tidak memiliki characteristic yang dapat digunakan untuk menulis data. Pastikan printer dalam mode Bluetooth dan sudah dipair.');
      }

      // Save device name to localStorage for future auto-reconnect
      const deviceName = device.name || 'Bluetooth Printer';
      localStorage.setItem('bluetooth_printer_name', deviceName);
      setStoredDeviceName(deviceName);

      // Listen for disconnect events
      device.addEventListener('gattserverdisconnected', () => {
        console.log('Printer disconnected');
        setPrinter({
          device: null,
          characteristic: null,
          isConnected: false,
        });
      });

      setPrinter({
        device,
        characteristic,
        isConnected: true,
      });

      toast({
        title: 'Terhubung ke Printer',
        description: `Berhasil terhubung ke ${deviceName}. Koneksi akan tersimpan.`,
      });

      return true;
    } catch (error: any) {
      console.error('Bluetooth connection error:', error);
      
      let errorMessage = error.message || 'Tidak dapat terhubung ke printer';
      
      // Provide helpful error messages
      if (error.message?.includes('User cancelled')) {
        errorMessage = 'Koneksi dibatalkan oleh user';
      } else if (error.message?.includes('Unsupported device')) {
        errorMessage = 'Printer tidak didukung. Pastikan printer thermal Bluetooth dalam mode pairing dan coba lagi.';
      }
      
      toast({
        title: 'Gagal Terhubung',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const disconnect = useCallback(async () => {
    if (printer.device?.gatt?.connected) {
      await printer.device.gatt.disconnect();
    }
    setPrinter({
      device: null,
      characteristic: null,
      isConnected: false,
    });
    toast({
      title: 'Terputus',
      description: 'Printer telah diputus',
    });
  }, [printer.device, toast]);

  const print = useCallback(async (text: string) => {
    // Auto-reconnect if disconnected
    if (!printer.isConnected && printer.device) {
      console.log('Auto-reconnecting to printer...');
      try {
        if (printer.device.gatt && !printer.device.gatt.connected) {
          await printer.device.gatt.connect();
          toast({
            title: 'Printer Terhubung Kembali',
            description: 'Koneksi berhasil dipulihkan',
          });
        }
      } catch (error) {
        console.error('Auto-reconnect failed:', error);
      }
    }

    if (!printer.isConnected || !printer.characteristic) {
      toast({
        title: 'Printer Tidak Terhubung',
        description: storedDeviceName ? `Hubungkan kembali ke ${storedDeviceName}` : 'Silakan hubungkan printer terlebih dahulu',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      
      // Check if characteristic supports write or writeWithoutResponse
      const hasWrite = printer.characteristic.properties.write;
      const hasWriteWithoutResponse = printer.characteristic.properties.writeWithoutResponse;
      
      console.log('Print: Characteristic properties:', {
        write: hasWrite,
        writeWithoutResponse: hasWriteWithoutResponse,
      });
      
      // Prefer writeWithoutResponse for thermal printers (faster, no response needed)
      const useWriteWithoutResponse = hasWriteWithoutResponse;
      
      console.log('Print: Using method:', useWriteWithoutResponse ? 'writeValueWithoutResponse' : 'writeValue');
      
      // Split data into chunks if needed (some printers have max packet size)
      const chunkSize = 512;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        
        if (useWriteWithoutResponse) {
          await printer.characteristic.writeValueWithoutResponse(chunk);
        } else {
          await printer.characteristic.writeValue(chunk);
        }
        
        // Small delay between chunks
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      return true;
    } catch (error: any) {
      console.error('Print error:', error);
      toast({
        title: 'Gagal Mencetak',
        description: error.message || 'Terjadi kesalahan saat mencetak',
        variant: 'destructive',
      });
      return false;
    }
  }, [printer, toast]);

  const printReceipt = useCallback(async (receipt: string) => {
    const success = await print(receipt);
    if (success) {
      toast({
        title: 'Berhasil',
        description: 'Struk berhasil dicetak',
      });
    }
    return success;
  }, [print, toast]);

  // Dummy methods for compatibility with native hook interface
  const printKitchenReceipt = useCallback(async () => {
    throw new Error('Use generateKitchenReceipt + printReceipt instead');
  }, []);

  const printSalesSummary = useCallback(async () => {
    throw new Error('Use generateSalesSummary + printReceipt instead');
  }, []);

  return {
    isConnected: printer.isConnected,
    isConnecting,
    printerName: printer.device?.name || storedDeviceName || null,
    connect,
    disconnect,
    print,
    printReceipt,
    printKitchenReceipt,
    printSalesSummary,
  };
}
