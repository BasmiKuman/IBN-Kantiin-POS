import { useState, useCallback } from 'react';
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
  FONT_SIZE_NORMAL: GS + '!' + '\x00',
  FONT_SIZE_DOUBLE: GS + '!' + '\x11',
  FONT_SIZE_LARGE: GS + '!' + '\x22',
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
  const { toast } = useToast();

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Check if Web Bluetooth API is available
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth API tidak didukung di browser ini. Gunakan Chrome/Edge di Android/Windows.');
      }

      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Generic printer service
          '0000ff00-0000-1000-8000-00805f9b34fb', // Alternative service UUID
        ],
      });

      if (!device.gatt) {
        throw new Error('GATT tidak tersedia pada device ini');
      }

      // Connect to GATT server
      const server = await device.gatt.connect();
      
      // Try to get service and characteristic
      let characteristic: BluetoothRemoteGATTCharacteristic | null = null;
      
      try {
        const service = await (server as any).getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
        characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
      } catch (e) {
        // Try alternative service UUID
        try {
          const service = await (server as any).getPrimaryService('0000ff00-0000-1000-8000-00805f9b34fb');
          characteristic = await service.getCharacteristic('0000ff01-0000-1000-8000-00805f9b34fb');
        } catch (e2) {
          throw new Error('Tidak dapat menemukan service printer. Pastikan printer mendukung ESC/POS via Bluetooth.');
        }
      }

      if (!characteristic) {
        throw new Error('Tidak dapat menemukan characteristic printer');
      }

      setPrinter({
        device,
        characteristic,
        isConnected: true,
      });

      toast({
        title: 'Terhubung ke Printer',
        description: `Berhasil terhubung ke ${device.name || 'Bluetooth Printer'}`,
      });

      return true;
    } catch (error: any) {
      console.error('Bluetooth connection error:', error);
      toast({
        title: 'Gagal Terhubung',
        description: error.message || 'Tidak dapat terhubung ke printer',
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
    if (!printer.isConnected || !printer.characteristic) {
      toast({
        title: 'Printer Tidak Terhubung',
        description: 'Silakan hubungkan printer terlebih dahulu',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      
      // Split data into chunks if needed (some printers have max packet size)
      const chunkSize = 512;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await printer.characteristic.writeValue(chunk);
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

  return {
    isConnected: printer.isConnected,
    isConnecting,
    printerName: printer.device?.name || null,
    connect,
    disconnect,
    print,
    printReceipt,
  };
}
