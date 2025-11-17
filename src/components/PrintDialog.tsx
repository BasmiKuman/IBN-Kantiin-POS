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
  batchMode?: boolean;
  batchTransactions?: ReceiptData[];
}

export function PrintDialog({ open, onOpenChange, receiptData, batchMode, batchTransactions }: PrintDialogProps) {
  const { isConnected, isConnecting, printerName, connect, disconnect, printReceipt } = useBluetoothPrinter();
  const [isPrintingKitchen, setIsPrintingKitchen] = useState(false);
  const [isPrintingCashier, setIsPrintingCashier] = useState(false);
  const [isPrintingBatch, setIsPrintingBatch] = useState(false);

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

  const handleBatchPrintKitchen = async () => {
    if (!batchTransactions || batchTransactions.length === 0) return;
    setIsPrintingBatch(true);
    
    for (const transaction of batchTransactions) {
      const receipt = generateKitchenReceipt(transaction);
      await printReceipt(receipt);
      // Small delay between prints
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsPrintingBatch(false);
  };

  const handleBatchPrintCashier = async () => {
    if (!batchTransactions || batchTransactions.length === 0) return;
    setIsPrintingBatch(true);
    
    for (const transaction of batchTransactions) {
      const receipt = generateCashierReceipt(transaction);
      await printReceipt(receipt);
      // Small delay between prints
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsPrintingBatch(false);
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

          {/* Connection Instructions */}
          {!isConnected && (
            <Alert>
              <AlertDescription className="space-y-2">
                <p className="font-semibold">📋 Panduan Koneksi:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Nyalakan printer thermal Bluetooth</li>
                  <li>Pastikan printer dalam mode pairing (LED berkedip)</li>
                  <li>Klik tombol "Hubungkan Printer" di bawah</li>
                  <li>Pilih nama printer dari daftar yang muncul</li>
                  <li>Tunggu hingga status berubah jadi "Terhubung"</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Jika printer tidak muncul, coba pair dulu via Settings → Bluetooth di perangkat Anda.
                </p>
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
          {isConnected && !batchMode && receiptData && (
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

          {/* Batch Print Buttons */}
          {isConnected && batchMode && batchTransactions && batchTransactions.length > 0 && (
            <>
              <div className="border-t pt-4 space-y-3">
                <p className="font-medium text-sm">
                  Print {batchTransactions.length} Transaksi:
                </p>
                
                <Button
                  onClick={handleBatchPrintKitchen}
                  disabled={isPrintingBatch}
                  variant="outline"
                  className="w-full"
                >
                  {isPrintingBatch ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mencetak batch...
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4 mr-2" />
                      Batch Print Struk Dapur
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleBatchPrintCashier}
                  disabled={isPrintingBatch}
                  className="w-full"
                >
                  {isPrintingBatch ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mencetak batch...
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4 mr-2" />
                      Batch Print Struk Kasir
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>⚠️ Catatan Batch Print:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Printer akan mencetak {batchTransactions.length} struk berturut-turut</li>
                  <li>Pastikan kertas cukup untuk semua struk</li>
                  <li>Jangan tutup dialog selama proses print</li>
                </ul>
              </div>
            </>
          )}

          {/* Troubleshooting Section */}
          {!isConnected && (
            <Alert variant="default" className="mt-4">
              <AlertDescription className="space-y-2">
                <p className="font-semibold">🔧 Troubleshooting:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Jika error "Unsupported device": Printer mungkin belum dipair. Pair dulu via Settings Bluetooth.</li>
                  <li>Jika printer tidak terdeteksi: Pastikan printer dalam jarak 5 meter dan tidak terhubung ke perangkat lain.</li>
                  <li>Jika koneksi terputus: Matikan lalu nyalakan printer, kemudian coba hubungkan lagi.</li>
                  <li>Untuk debugging: Tekan F12 → Console untuk lihat detail koneksi.</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  📖 Panduan lengkap tersedia di dokumentasi BLUETOOTH_PRINT_GUIDE.md
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
