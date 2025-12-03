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
import { Printer, Bluetooth, CheckCircle, XCircle, Loader2, Search, Calendar, ChefHat, Receipt as ReceiptIcon, Settings, Sparkles } from 'lucide-react';
import { useBluetoothPrinter } from '@/hooks/useBluetoothPrinter';
import { useNativeBluetoothPrinter } from '@/hooks/useNativeBluetoothPrinter';
import { generateKitchenReceipt, generateCashierReceipt, generateTestReceipt, type ReceiptData } from '@/lib/receiptFormatter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

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
  const { toast } = useToast();
  
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
    try {
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
    } catch (error) {
      console.error('Test print failed:', error);
      alert('Gagal test print: ' + (error as Error).message);
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
      toast({
        title: 'Berhasil!',
        description: 'Struk dapur berhasil dicetak',
      });
    } catch (error) {
      console.error('Print kitchen failed:', error);
      toast({
        title: 'Gagal Cetak',
        description: 'Error: ' + (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsPrintingKitchen(false);
    }
  };

  const handlePrintCashier = async () => {
    if (!receiptData) return;
    setIsPrintingCashier(true);
    try {
      console.log('Starting cashier print...', { isNativeApp, receiptData });
      
      if (isNativeApp) {
        const printData = {
          storeName: receiptData.storeName || 'Kantin',
          items: receiptData.items.map(item => ({
            name: item.name || 'Item',
            qty: item.quantity || 0,
            price: item.price || 0,
            subtotal: item.total || 0,
          })),
          subtotal: receiptData.subtotal || 0,
          tax: receiptData.tax || 0,
          total: receiptData.total || 0,
          paymentMethod: receiptData.paymentMethod || 'Tunai',
          change: receiptData.change || 0,
          cashierName: receiptData.cashierName || 'Kasir',
          orderType: receiptData.orderType,
        };
        
        console.log('Calling native printReceipt with:', printData);
        await bluetooth.printReceipt(printData);
        console.log('Native print completed successfully');
      } else {
        const receipt = generateCashierReceipt(receiptData);
        console.log('Calling web printReceipt');
        await bluetooth.printReceipt(receipt);
        console.log('Web print completed successfully');
      }
      
      toast({
        title: 'Berhasil!',
        description: 'Struk kasir berhasil dicetak',
      });
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
              name: item.name || 'Item',
              qty: item.quantity || 0,
              price: item.price || 0,
              subtotal: item.total || 0,
            })),
            subtotal: transaction.subtotal || 0,
            tax: transaction.tax || 0,
            total: transaction.total || 0,
            paymentMethod: transaction.paymentMethod || 'Tunai',
            change: transaction.change || 0,
            cashierName: transaction.cashierName || 'Kasir',
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

      // Calculate totals (pastikan angka, bukan NaN)
      const totalRevenue = filteredTransactions.reduce((sum, t) => sum + (t.subtotal || 0), 0);
      const totalTax = filteredTransactions.reduce((sum, t) => sum + (t.tax || 0), 0);
      const grandTotal = filteredTransactions.reduce((sum, t) => sum + (t.total || 0), 0);

      // Prepare summary data, pastikan semua field angka
      const summaryData = {
        startDate: new Date(startDate).toLocaleDateString('id-ID'),
        endDate: new Date(endDate).toLocaleDateString('id-ID'),
        transactions: filteredTransactions.map(t => ({
          transactionNumber: t.orderNumber || '',
          items: t.items.map(item => ({
            name: item.name,
            qty: item.quantity || 0,
            price: item.price || 0,
            subtotal: item.total || 0,
          })),
          subtotal: t.subtotal || 0,
          tax: t.tax || 0,
          total: t.total || 0,
          paymentMethod: t.paymentMethod || 'Tunai',
          customerName: t.customerName || '',
        })),
        totalTransactions: filteredTransactions.length,
        totalRevenue: totalRevenue || 0,
        totalTax: totalTax || 0,
        grandTotal: grandTotal || 0,
        customerName: filteredTransactions[0]?.customerName || '',
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
      <DialogContent className="sm:max-w-lg">
        {/* Header with Gradient */}
        <DialogHeader className="space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 dark:from-violet-600 dark:via-purple-600 dark:to-pink-600">
                <Printer className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-violet-600 to-pink-600 dark:from-violet-400 dark:to-pink-400 bg-clip-text text-transparent font-bold">
                Cetak Struk
              </span>
            </DialogTitle>
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
          </div>
          <DialogDescription className="text-base">
            Printer Bluetooth siap mencetak struk untuk dapur atau kasir
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Connection Status Card - Colorful */}
          <div className={`relative overflow-hidden rounded-2xl p-5 ${
            bluetooth.isConnected 
              ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 border-2 border-green-200 dark:border-green-800' 
              : 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900/30 dark:via-gray-900/30 dark:to-zinc-900/30 border-2 border-gray-200 dark:border-gray-700'
          }`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${
                  bluetooth.isConnected 
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600' 
                    : 'bg-gradient-to-br from-gray-300 to-slate-400 dark:from-gray-600 dark:to-slate-700'
                }`}>
                  <Bluetooth className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg">Status Printer</p>
                  {bluetooth.isConnected && bluetooth.printerName && (
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">📱 {bluetooth.printerName}</p>
                  )}
                </div>
              </div>
              <Badge 
                variant={bluetooth.isConnected ? 'default' : 'secondary'}
                className={bluetooth.isConnected 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-4 py-2 text-sm' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-4 py-2 text-sm'
                }
              >
                {bluetooth.isConnected ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Terhubung
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Tidak Terhubung
                  </>
                )}
              </Badge>
            </div>
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

          {/* Print Buttons - Super Colorful */}
          {bluetooth.isConnected && !batchMode && receiptData && (
            <>
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Pilih Jenis Struk
                  </p>
                  <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                </div>
                
                {/* Kitchen Receipt Button - Orange/Red Theme */}
                <button
                  onClick={handlePrintKitchen}
                  disabled={isPrintingKitchen || !receiptData}
                  className="w-full group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 dark:from-orange-500 dark:via-red-500 dark:to-pink-600 shadow-lg hover:shadow-xl"
                >
                  {/* Background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                      {isPrintingKitchen ? (
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      ) : (
                        <ChefHat className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xl font-bold text-white">
                        {isPrintingKitchen ? 'Mencetak...' : 'Cetak Struk Dapur'}
                      </p>
                      <p className="text-sm text-white/90 mt-1">
                        Format sederhana untuk kitchen
                      </p>
                    </div>
                    <ChefHat className="h-6 w-6 text-white/50" />
                  </div>
                </button>

                {/* Cashier Receipt Button - Blue/Purple Theme */}
                <button
                  onClick={handlePrintCashier}
                  disabled={isPrintingCashier || !receiptData}
                  className="w-full group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 dark:from-blue-600 dark:via-purple-600 dark:to-indigo-700 shadow-lg hover:shadow-xl"
                >
                  {/* Background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                      {isPrintingCashier ? (
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      ) : (
                        <ReceiptIcon className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xl font-bold text-white">
                        {isPrintingCashier ? 'Mencetak...' : 'Cetak Struk Kasir'}
                      </p>
                      <p className="text-sm text-white/90 mt-1">
                        Format lengkap untuk customer
                      </p>
                    </div>
                    <ReceiptIcon className="h-6 w-6 text-white/50" />
                  </div>
                </button>
              </div>

              {/* Tips Card - Gradient */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800">
                <p className="font-semibold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  💡 Tips Cepat:
                </p>
                <ul className="space-y-1.5 text-sm text-amber-800 dark:text-amber-400">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">🍳</span>
                    <span><strong>Dapur:</strong> Hanya item & qty (untuk chef)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">🧾</span>
                    <span><strong>Kasir:</strong> Lengkap dengan harga (untuk customer)</span>
                  </li>
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
