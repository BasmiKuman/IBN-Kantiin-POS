import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Printer, Loader2, Settings, AlertCircle, ChefHat, Receipt } from 'lucide-react';
import { useBluetoothPrinter } from '@/hooks/useBluetoothPrinter';
import { generateKitchenReceipt, generateCashierReceipt, type ReceiptData } from '@/lib/receiptFormatter';
import { generateThermalReceipt } from '@/lib/formatters/thermalReceiptConverter';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface SimplePrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptData: ReceiptData;
}

export function SimplePrintDialog({ open, onOpenChange, receiptData }: SimplePrintDialogProps) {
  const bluetooth = useBluetoothPrinter();
  const { toast } = useToast();
  
  const [isPrintingKitchen, setIsPrintingKitchen] = useState(false);
  const [isPrintingCashier, setIsPrintingCashier] = useState(false);

  const handlePrintKitchen = async () => {
    setIsPrintingKitchen(true);
    try {
      const receipt = generateKitchenReceipt(receiptData);
      const success = await bluetooth.printReceipt(receipt);
      
      if (success) {
        toast({
          title: '✅ Struk Dapur Dicetak!',
          description: 'Pesanan telah dikirim ke dapur',
        });
      }
    } catch (error) {
      console.error('Print kitchen failed:', error);
      toast({
        title: 'Gagal Cetak Struk Dapur',
        description: 'Error: ' + (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsPrintingKitchen(false);
    }
  };

  const handlePrintCashier = async () => {
    setIsPrintingCashier(true);
    try {
      // Use Thermal Receipt for better formatting
      const thermalReceiptData = {
        transactionNumber: receiptData.orderNumber,
        date: new Date(receiptData.date),
        items: receiptData.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
          variant: item.variant,
        })),
        subtotal: receiptData.subtotal,
        tax: receiptData.tax || 0,
        total: receiptData.total,
        paymentMethod: receiptData.paymentMethod,
        paymentAmount: receiptData.total,
        changeAmount: 0,
        customerName: receiptData.customerName,
        paperWidth: '58mm' as const,
        storeName: 'BK POS',
        cashierName: receiptData.cashierName || localStorage.getItem('username') || 'Kasir',
      };
      const receipt = generateThermalReceipt(thermalReceiptData);
      const success = await bluetooth.printReceipt(receipt);
      
      if (success) {
        toast({
          title: '✅ Struk Kasir Dicetak!',
          description: 'Struk berhasil dicetak untuk customer',
        });
      }
    } catch (error) {
      console.error('Print cashier failed:', error);
      toast({
        title: 'Gagal Cetak Struk Kasir',
        description: 'Error: ' + (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsPrintingCashier(false);
    }
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
            Pilih jenis struk yang ingin dicetak
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Show printer status if not connected */}
          {!bluetooth.isConnected && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">Printer Belum Terhubung</p>
                <p className="text-sm mb-3">
                  Silakan hubungkan printer Bluetooth terlebih dahulu di halaman Settings.
                </p>
                <Link to="/settings">
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Buka Settings
                  </Button>
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {/* Printer info if connected */}
          {bluetooth.isConnected && bluetooth.printerName && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription>
                <p className="text-sm text-green-800">
                  ✅ Terhubung ke: <strong>{bluetooth.printerName}</strong>
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Print Buttons */}
          {bluetooth.isConnected && (
            <div className="space-y-3">
              <Button
                onClick={handlePrintKitchen}
                disabled={isPrintingKitchen}
                variant="outline"
                size="lg"
                className="w-full h-auto flex-col py-4"
              >
                {isPrintingKitchen ? (
                  <>
                    <Loader2 className="h-6 w-6 mb-2 animate-spin" />
                    <span>Mencetak...</span>
                  </>
                ) : (
                  <>
                    <ChefHat className="h-6 w-6 mb-2" />
                    <span className="font-semibold">Cetak Struk Dapur</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Format sederhana untuk kitchen
                    </span>
                  </>
                )}
              </Button>

              <Button
                onClick={handlePrintCashier}
                disabled={isPrintingCashier}
                size="lg"
                className="w-full h-auto flex-col py-4"
              >
                {isPrintingCashier ? (
                  <>
                    <Loader2 className="h-6 w-6 mb-2 animate-spin" />
                    <span>Mencetak...</span>
                  </>
                ) : (
                  <>
                    <Receipt className="h-6 w-6 mb-2" />
                    <span className="font-semibold">Cetak Struk Kasir</span>
                    <span className="text-xs text-primary-foreground/80 mt-1">
                      Format lengkap untuk customer
                    </span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Tips */}
          {bluetooth.isConnected && (
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <p className="font-semibold mb-1">💡 Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Struk Dapur:</strong> Hanya item & jumlah (untuk kitchen)</li>
                <li><strong>Struk Kasir:</strong> Lengkap dengan harga (untuk customer)</li>
                <li>Anda bisa cetak kedua jenis struk untuk satu transaksi</li>
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
