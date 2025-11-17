import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Bluetooth, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useBluetoothPrinter } from '@/hooks/useBluetoothPrinter';
import { generateKitchenReceipt, generateCashierReceipt, generateTestReceipt, type ReceiptData } from '@/lib/receiptFormatter';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptData?: ReceiptData;
}

export function PrintDialog({ open, onOpenChange, receiptData }: PrintDialogProps) {
  const { isConnected, isConnecting, printerName, connect, disconnect, printReceipt } = useBluetoothPrinter();
  const [isPrintingKitchen, setIsPrintingKitchen] = useState(false);
  const [isPrintingCashier, setIsPrintingCashier] = useState(false);

  const handleConnect = async () => {
    await connect();
  };

  const handleTestPrint = async () => {
    const testReceipt = generateTestReceipt();
    await printReceipt(testReceipt);
  };

  const handlePrintKitchen = async () => {
    if (!receiptData) return;
    setIsPrintingKitchen(true);
    const receipt = generateKitchenReceipt(receiptData);
    await printReceipt(receipt);
    setIsPrintingKitchen(false);
  };

  const handlePrintCashier = async () => {
    if (!receiptData) return;
    setIsPrintingCashier(true);
    const receipt = generateCashierReceipt(receiptData);
    await printReceipt(receipt);
    setIsPrintingCashier(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Cetak Struk
          </DialogTitle>
          <DialogDescription>
            Hubungkan printer Bluetooth dan cetak struk untuk dapur atau kasir
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Bluetooth className="h-5 w-5" />
              <div>
                <p className="font-medium">Status Printer</p>
                {printerName && (
                  <p className="text-sm text-muted-foreground">{printerName}</p>
                )}
              </div>
            </div>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Terhubung
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Tidak Terhubung
                </>
              )}
            </Badge>
          </div>

          {/* Browser Compatibility Warning */}
          {typeof navigator !== 'undefined' && !navigator.bluetooth && (
            <Alert>
              <AlertDescription>
                ⚠️ Browser Anda tidak mendukung Web Bluetooth. Gunakan Chrome atau Edge di Android/Windows.
              </AlertDescription>
            </Alert>
          )}

          {/* Connect/Disconnect Button */}
          <div className="flex gap-2">
            {!isConnected ? (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex-1"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menghubungkan...
                  </>
                ) : (
                  <>
                    <Bluetooth className="h-4 w-4 mr-2" />
                    Hubungkan Printer
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button onClick={disconnect} variant="outline" className="flex-1">
                  Putuskan
                </Button>
                <Button onClick={handleTestPrint} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Test Print
                </Button>
              </>
            )}
          </div>

          {/* Print Buttons */}
          {isConnected && receiptData && (
            <>
              <div className="border-t pt-4 space-y-3">
                <p className="font-medium text-sm">Cetak Struk:</p>
                
                <Button
                  onClick={handlePrintKitchen}
                  disabled={isPrintingKitchen || !receiptData}
                  variant="outline"
                  className="w-full"
                >
                  {isPrintingKitchen ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mencetak...
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4 mr-2" />
                      Cetak Struk Dapur
                    </>
                  )}
                </Button>

                <Button
                  onClick={handlePrintCashier}
                  disabled={isPrintingCashier || !receiptData}
                  className="w-full"
                >
                  {isPrintingCashier ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mencetak...
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4 mr-2" />
                      Cetak Struk Kasir
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>💡 Tips:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Struk Dapur: Format sederhana untuk kitchen</li>
                  <li>Struk Kasir: Format lengkap dengan harga</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
