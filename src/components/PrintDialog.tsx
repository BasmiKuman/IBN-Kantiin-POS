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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Printer, Bluetooth, CheckCircle, XCircle, Loader2, Search, Calendar } from 'lucide-react';
import { useBluetoothPrinter } from '@/hooks/useBluetoothPrinter';
import { useNativeBluetoothPrinter } from '@/hooks/useNativeBluetoothPrinter';
import { generateKitchenReceipt, generateCashierReceipt, generateTestReceipt, type ReceiptData } from '@/lib/receiptFormatter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptData?: ReceiptData;
  batchMode?: boolean;
  batchTransactions?: ReceiptData[];
}

export function PrintDialog({ open, onOpenChange, receiptData, batchMode, batchTransactions }: PrintDialogProps) {
  // Use native Bluetooth for Capacitor app, Web Bluetooth for browser
  const webBluetooth = useBluetoothPrinter();
  const nativeBluetooth = useNativeBluetoothPrinter();
  
  // Smart detection: use native if available, fallback to web
  const isNativeApp = nativeBluetooth.isNativeSupported;
  const bluetooth = isNativeApp ? nativeBluetooth : webBluetooth;
  
  const [isPrintingKitchen, setIsPrintingKitchen] = useState(false);
  const [isPrintingCashier, setIsPrintingCashier] = useState(false);
  const [isPrintingBatch, setIsPrintingBatch] = useState(false);
  const [showDeviceList, setShowDeviceList] = useState(false);
  
  // Date filter for batch summary
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const handleConnect = async () => {
    if (isNativeApp) {
      // For native app, show device list for scanning
      setShowDeviceList(true);
      await bluetooth.startScan();
    } else {
      // For web, use browser's device picker
      await bluetooth.connect('');
    }
  };

  const handleDeviceSelect = async (address: string) => {
    await bluetooth.connect(address);
    setShowDeviceList(false);
  };

  const handleStopScan = async () => {
    if (isNativeApp && bluetooth.isScanning) {
      await bluetooth.stopScan();
    }
    setShowDeviceList(false);
  };

  const handleTestPrint = async () => {
    const testReceipt = generateTestReceipt();
    if (isNativeApp) {
      // Use native print for test
      await bluetooth.printReceipt({
        storeName: testReceipt.storeName || 'Test Store',
        items: testReceipt.items.map(item => ({
          name: item.name,
          qty: item.quantity,
          price: item.price,
          subtotal: item.total,
        })),
        subtotal: testReceipt.subtotal,
        tax: testReceipt.tax,
        total: testReceipt.total,
        paymentMethod: 'Test',
      });
    } else {
      await bluetooth.printReceipt(testReceipt);
    }
  };

  const handlePrintKitchen = async () => {
    if (!receiptData) return;
    setIsPrintingKitchen(true);
    try {
      if (isNativeApp) {
        await bluetooth.printKitchenReceipt({
          items: receiptData.items.map(item => ({
            name: item.name,
            qty: item.quantity,
            notes: item.notes,
          })),
          orderType: receiptData.orderType,
          tableNumber: receiptData.tableNumber,
        });
      } else {
        const receipt = generateKitchenReceipt(receiptData);
        await bluetooth.printReceipt(receipt);
      }
    } finally {
      setIsPrintingKitchen(false);
    }
  };

  const handlePrintCashier = async () => {
    if (!receiptData) return;
    setIsPrintingCashier(true);
    try {
      if (isNativeApp) {
        await bluetooth.printReceipt({
          storeName: receiptData.storeName || 'Kantin',
          items: receiptData.items.map(item => ({
            name: item.name,
            qty: item.quantity,
            price: item.price,
            subtotal: item.total,
          })),
          subtotal: receiptData.subtotal,
          tax: receiptData.tax,
          total: receiptData.total,
          paymentMethod: receiptData.paymentMethod,
          change: receiptData.change,
          cashierName: receiptData.cashierName,
          orderType: receiptData.orderType,
        });
      } else {
        const receipt = generateCashierReceipt(receiptData);
        await bluetooth.printReceipt(receipt);
      }
    } finally {
      setIsPrintingCashier(false);
    }
  };

  const handleBatchPrintKitchen = async () => {
    if (!batchTransactions || batchTransactions.length === 0) return;
    setIsPrintingBatch(true);
    
    try {
      for (const transaction of batchTransactions) {
        if (isNativeApp) {
          await bluetooth.printKitchenReceipt({
            items: transaction.items.map(item => ({
              name: item.name,
              qty: item.quantity,
              notes: item.notes,
            })),
            orderType: transaction.orderType,
            tableNumber: transaction.tableNumber,
          });
        } else {
          const receipt = generateKitchenReceipt(transaction);
          await bluetooth.printReceipt(receipt);
        }
        // Small delay between prints
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } finally {
      setIsPrintingBatch(false);
    }
  };

  const handleBatchPrintCashier = async () => {
    if (!batchTransactions || batchTransactions.length === 0) return;
    setIsPrintingBatch(true);
    
    try {
      for (const transaction of batchTransactions) {
        if (isNativeApp) {
          await bluetooth.printReceipt({
            storeName: transaction.storeName || 'Kantin',
            items: transaction.items.map(item => ({
              name: item.name,
              qty: item.quantity,
              price: item.price,
              subtotal: item.total,
            })),
            subtotal: transaction.subtotal,
            tax: transaction.tax,
            total: transaction.total,
            paymentMethod: transaction.paymentMethod,
            change: transaction.change,
            cashierName: transaction.cashierName,
            orderType: transaction.orderType,
          });
        } else {
          const receipt = generateCashierReceipt(transaction);
          await bluetooth.printReceipt(receipt);
        }
        // Small delay between prints
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } finally {
      setIsPrintingBatch(false);
    }
  };

  const handlePrintSalesSummary = async () => {
    if (!batchTransactions || batchTransactions.length === 0) return;
    setIsPrintingBatch(true);
    
    try {
      // Filter transactions by date range
      const filteredTransactions = batchTransactions.filter(transaction => {
        if (!transaction.date) return true;
        const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
        return transactionDate >= startDate && transactionDate <= endDate;
      });

      if (filteredTransactions.length === 0) {
        alert('Tidak ada transaksi dalam rentang tanggal yang dipilih');
        return;
      }

      // Calculate totals
      const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.subtotal, 0);
      const totalTax = filteredTransactions.reduce((sum, t) => sum + t.tax, 0);
      const grandTotal = filteredTransactions.reduce((sum, t) => sum + t.total, 0);

      // Prepare summary data
      const summaryData = {
        startDate: new Date(startDate).toLocaleDateString('id-ID'),
        endDate: new Date(endDate).toLocaleDateString('id-ID'),
        transactions: filteredTransactions.map(t => ({
          transactionNumber: t.orderNumber || '',
          items: t.items.map(item => ({
            name: item.name,
            qty: item.quantity,
            price: item.price,
            subtotal: item.total,
          })),
          subtotal: t.subtotal,
          tax: t.tax,
          total: t.total,
          paymentMethod: t.paymentMethod,
        })),
        totalTransactions: filteredTransactions.length,
        totalRevenue,
        totalTax,
        grandTotal,
      };

      if (isNativeApp) {
        await bluetooth.printSalesSummary(summaryData);
      } else {
        // For web, generate simple summary (fallback)
        alert('Sales summary print hanya tersedia di aplikasi mobile');
      }
      
    } finally {
      setIsPrintingBatch(false);
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
                {bluetooth.isConnected && bluetooth.connectedDevice && (
                  <p className="text-sm text-muted-foreground">{bluetooth.connectedDevice.name}</p>
                )}
              </div>
            </div>
            <Badge variant={bluetooth.isConnected ? 'default' : 'secondary'}>
              {bluetooth.isConnected ? (
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

          {/* Connection Instructions */}
          {!bluetooth.isConnected && (
            <Alert>
              <AlertDescription className="space-y-2">
                <p className="font-semibold">📋 Panduan Koneksi:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Nyalakan printer thermal Bluetooth</li>
                  <li>Pastikan printer dalam mode pairing (LED berkedip)</li>
                  <li>Klik tombol "{isNativeApp ? 'Scan Printer' : 'Hubungkan Printer'}" di bawah</li>
                  <li>Pilih nama printer dari daftar yang muncul</li>
                  <li>Tunggu hingga status berubah jadi "Terhubung"</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 {isNativeApp ? 'Aplikasi akan scan printer Bluetooth terdekat secara otomatis.' : 'Jika printer tidak muncul, coba pair dulu via Settings → Bluetooth di perangkat Anda.'}
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Device List for Native App */}
          {isNativeApp && showDeviceList && (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  {bluetooth.isScanning ? 'Mencari Printer...' : 'Printer Ditemukan'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStopScan}
                >
                  Tutup
                </Button>
              </div>
              
              <ScrollArea className="h-48">
                {bluetooth.availableDevices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    {bluetooth.isScanning ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p className="text-sm">Scanning...</p>
                      </>
                    ) : (
                      <p className="text-sm">Tidak ada printer ditemukan</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bluetooth.availableDevices.map((device) => (
                      <Button
                        key={device.address}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleDeviceSelect(device.address)}
                        disabled={bluetooth.isConnecting}
                      >
                        <Bluetooth className="h-4 w-4 mr-2" />
                        <div className="text-left">
                          <p className="font-medium">{device.name}</p>
                          <p className="text-xs text-muted-foreground">{device.address}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Connect/Disconnect Button */}
          <div className="flex gap-2">
            {!bluetooth.isConnected ? (
              <Button
                onClick={handleConnect}
                disabled={bluetooth.isConnecting}
                className="flex-1"
              >
                {bluetooth.isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menghubungkan...
                  </>
                ) : (
                  <>
                    {isNativeApp ? (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Scan Printer
                      </>
                    ) : (
                      <>
                        <Bluetooth className="h-4 w-4 mr-2" />
                        Hubungkan Printer
                      </>
                    )}
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button onClick={() => bluetooth.disconnect()} variant="outline" className="flex-1">
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
          {bluetooth.isConnected && !batchMode && receiptData && (
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
          {bluetooth.isConnected && batchMode && batchTransactions && batchTransactions.length > 0 && (
            <>
              <div className="border-t pt-4 space-y-4">
                <p className="font-medium">Laporan Penjualan (Batch Mode)</p>
                
                {/* Date Filter */}
                <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Filter Tanggal
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="startDate" className="text-xs">Dari</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="endDate" className="text-xs">Sampai</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>

                {/* Summary Print Button - Primary Action */}
                <Button
                  onClick={handlePrintSalesSummary}
                  disabled={isPrintingBatch}
                  className="w-full"
                  size="lg"
                >
                  {isPrintingBatch ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mencetak Laporan...
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4 mr-2" />
                      Print Laporan Penjualan
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
                  <p className="font-semibold flex items-center gap-1 mb-2">
                    💡 Laporan Ringkas:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Semua transaksi digabung dalam 1 struk</li>
                    <li>Hemat kertas - tidak print satu per satu</li>
                    <li>Ringkasan produk, metode bayar, dan total penjualan</li>
                    <li>Filter berdasarkan rentang tanggal</li>
                  </ul>
                </div>

                {/* Legacy Individual Print Options - Collapsed */}
                <details className="border rounded-lg p-3">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    Print Individual (Legacy) - {batchTransactions.length} struk
                  </summary>
                  <div className="mt-3 space-y-2">
                    <Button
                      onClick={handleBatchPrintKitchen}
                      disabled={isPrintingBatch}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print Struk Dapur Satu-Satu
                    </Button>

                    <Button
                      onClick={handleBatchPrintCashier}
                      disabled={isPrintingBatch}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print Struk Kasir Satu-Satu
                    </Button>

                    <p className="text-xs text-muted-foreground mt-2">
                      ⚠️ Akan mencetak {batchTransactions.length} struk terpisah (boros kertas)
                    </p>
                  </div>
                </details>
              </div>
            </>
          )}

          {/* Troubleshooting Section */}
          {!bluetooth.isConnected && (
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
