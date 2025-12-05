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
import { Printer, Bluetooth, CheckCircle, XCircle, Loader2, Calendar, ChefHat, Receipt as ReceiptIcon, Settings, Sparkles, FileText } from 'lucide-react';
import { useBluetoothPrinter } from '@/hooks/useBluetoothPrinter';
import { generateKitchenReceipt, generateCashierReceipt, generateTestReceipt, type ReceiptData } from '@/lib/receiptFormatter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface PrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptData?: ReceiptData;
  batchMode?: boolean;
  batchTransactions?: ReceiptData[];
  productSalesText?: string;
}

export function PrintDialog({ open, onOpenChange, receiptData, batchMode, batchTransactions, productSalesText }: PrintDialogProps) {
  // Always use Web Bluetooth (native features not implemented)
  const bluetooth = useBluetoothPrinter();
  const { toast } = useToast();
  
  const [isPrintingKitchen, setIsPrintingKitchen] = useState(false);
  const [isPrintingCashier, setIsPrintingCashier] = useState(false);
  const [isPrintingBatch, setIsPrintingBatch] = useState(false);
  const [showDeviceList, setShowDeviceList] = useState(false);
  
  // Date filter for batch summary
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const handleConnect = async () => {
    // Always use web Bluetooth (browser picker)
    await bluetooth.connect();
  };

  const handleDeviceSelect = async (address: string) => {
    await bluetooth.connect();
    setShowDeviceList(false);
  };

  const handleStopScan = async () => {
    // Removed native scan features - not implemented
    setShowDeviceList(false);
  };

  const handleTestPrint = async () => {
    try {
      const testReceipt = generateTestReceipt();
      // Use web Bluetooth print (text receipt)
      await bluetooth.printReceipt(testReceipt);
    } catch (error) {
      console.error('Test print failed:', error);
      alert('Gagal test print: ' + (error as Error).message);
    }
  };

  const handlePrintKitchen = async () => {
    if (!receiptData) return;
    setIsPrintingKitchen(true);
    try {
      // Always use web Bluetooth (text receipt)
      const receipt = generateKitchenReceipt(receiptData);
      await bluetooth.printReceipt(receipt);
      
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
      // Always use web Bluetooth (text receipt)
      const receipt = generateCashierReceipt(receiptData);
      await bluetooth.printReceipt(receipt);
      
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
        // Always use web Bluetooth (text receipt)
        const receipt = generateKitchenReceipt(transaction);
        await bluetooth.printReceipt(receipt);
        
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
        // Always use web Bluetooth (text receipt)
        const receipt = generateCashierReceipt(transaction);
        await bluetooth.printReceipt(receipt);
        
        // Small delay between prints
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } finally {
      setIsPrintingBatch(false);
    }
  };

  const handlePrintProductSales = async () => {
    if (!productSalesText) return;
    setIsPrintingBatch(true);
    
    try {
      // Always use web Bluetooth printReceipt (accepts text string)
      await bluetooth.printReceipt(productSalesText);
      
      toast({
        title: "Berhasil mencetak",
        description: "Laporan penjualan produk berhasil dicetak",
      });
    } catch (error) {
      toast({
        title: "Gagal mencetak",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat mencetak",
        variant: "destructive",
      });
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
        toast({
          title: "Tidak ada transaksi",
          description: "Tidak ada transaksi dalam rentang tanggal yang dipilih",
          variant: "destructive",
        });
        return;
      }

      // Calculate totals
      const totalRevenue = filteredTransactions.reduce((sum, t) => sum + (t.subtotal || 0), 0);
      const totalTax = filteredTransactions.reduce((sum, t) => sum + (t.tax || 0), 0);
      const grandTotal = totalRevenue + totalTax;

      const startDateFormatted = new Date(startDate).toLocaleDateString('id-ID');
      const endDateFormatted = new Date(endDate).toLocaleDateString('id-ID');

      // For web/browser: use browser's print dialog
      const printWindow = window.open('', '', 'width=800,height=600');
      if (!printWindow) {
        toast({
          title: "Gagal membuka dialog print",
          description: "Izinkan popup untuk mencetak laporan",
          variant: "destructive",
        });
        return;
      }

      // Generate HTML for print
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Penjualan - ${startDateFormatted} s/d ${endDateFormatted}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              @page { margin: 1cm; }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1, h2, h3 { margin: 10px 0; }
            h1 { font-size: 20px; text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
            h2 { font-size: 16px; margin-top: 20px; }
            h3 { font-size: 14px; margin-top: 15px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { padding: 5px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f0f0f0; font-weight: bold; }
            .text-right { text-align: right; }
            .separator { border-top: 2px solid #000; margin: 15px 0; }
            .summary { background: #f9f9f9; padding: 10px; margin: 15px 0; }
            .total-row { font-weight: bold; font-size: 14px; background: #e8e8e8; }
          </style>
        </head>
        <body>
          <h1>== BK POS ==</h1>
          <h2>LAPORAN PENJUALAN</h2>
          <p><strong>Periode:</strong> ${startDateFormatted} s/d ${endDateFormatted}</p>
          <p><strong>Total Transaksi:</strong> ${filteredTransactions.length}</p>
          <div class="separator"></div>
          
          ${filteredTransactions.map((t, idx) => {
            const transactionTotal = (t.subtotal || 0) + (t.tax || 0);
            return `
            <h3>Transaksi #${idx + 1} - ${t.orderNumber || ''}</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Harga</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${t.items.map(item => {
                  const itemSubtotal = (item.quantity || 0) * (item.price || 0);
                  return `
                  <tr>
                    <td>${item.name}${item.variant ? ` (${item.variant})` : ''}</td>
                    <td class="text-right">${item.quantity || 0}</td>
                    <td class="text-right">Rp${(item.price || 0).toLocaleString('id-ID')}</td>
                    <td class="text-right">Rp${itemSubtotal.toLocaleString('id-ID')}</td>
                  </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            <p><strong>Pembayaran:</strong> ${t.paymentMethod || 'Tunai'} | <strong>Total:</strong> Rp${transactionTotal.toLocaleString('id-ID')}</p>
            `;
          }).join('<div class="separator"></div>')}
          
          <div class="separator"></div>
          <div class="summary">
            <h2>RINGKASAN TOTAL</h2>
            <table>
              <tr>
                <td><strong>Subtotal Penjualan:</strong></td>
                <td class="text-right"><strong>Rp${totalRevenue.toLocaleString('id-ID')}</strong></td>
              </tr>
              ${totalTax > 0 ? `
              <tr>
                <td><strong>Total Pajak:</strong></td>
                <td class="text-right"><strong>Rp${totalTax.toLocaleString('id-ID')}</strong></td>
              </tr>
              ` : ''}
              <tr class="total-row">
                <td><strong>GRAND TOTAL:</strong></td>
                <td class="text-right"><strong>Rp${grandTotal.toLocaleString('id-ID')}</strong></td>
              </tr>
            </table>
          </div>
          
          <div class="separator"></div>
          <p style="text-align: center; margin-top: 30px;">
            <em>Terima kasih telah menggunakan BK POS</em><br>
            <small>Dicetak: ${new Date().toLocaleString('id-ID')}</small>
          </p>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      
      toast({
        title: "Dialog print dibuka",
        description: `Siap mencetak ${filteredTransactions.length} transaksi`,
      });
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

          {/* Setup Printer Alert - Colorful */}
          {!bluetooth.isConnected && !bluetooth.printerName && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500 dark:bg-blue-600">
                  <Bluetooth className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 space-y-3">
                  <p className="font-bold text-blue-900 dark:text-blue-300 text-lg">
                    🎯 Setup Printer (Pertama Kali)
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-400">
                    <li>Nyalakan printer thermal Bluetooth</li>
                    <li>Pastikan printer dalam mode pairing (LED berkedip)</li>
                    <li>Klik tombol "Hubungkan Printer" di bawah</li>
                    <li>Pilih nama printer dari daftar</li>
                    <li>✨ Done! Printer tersimpan permanent</li>
                  </ol>
                  <div className="flex items-start gap-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                    <span className="text-lg">💡</span>
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      <strong>Pro Tip:</strong> Setup di Settings lebih mudah! <Link to="/settings" className="underline font-semibold">Klik di sini</Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Reconnect Alert */}
          {!bluetooth.isConnected && bluetooth.printerName && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-red-950/30 border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-500 dark:bg-orange-600">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-orange-900 dark:text-orange-300 mb-2">
                    📱 Printer Tersimpan: {bluetooth.printerName}
                  </p>
                  <p className="text-sm text-orange-800 dark:text-orange-400 mb-3">
                    Klik "Hubungkan Printer" untuk reconnect otomatis
                  </p>
                  <div className="flex items-center gap-2 text-xs text-orange-700 dark:text-orange-500">
                    <Sparkles className="h-3 w-3" />
                    <span>Auto-reconnect diaktifkan</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Device List - Removed: Native features not implemented */}
          {/* Web Bluetooth uses browser picker automatically */}

          {/* Connect/Disconnect Button - Colorful */}
          <div className="flex gap-3">
            {!bluetooth.isConnected ? (
              <button
                onClick={handleConnect}
                disabled={bluetooth.isConnecting}
                className="flex-1 group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 dark:from-cyan-600 dark:via-blue-600 dark:to-indigo-700 shadow-lg hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center justify-center gap-2 text-white font-semibold">
                  {bluetooth.isConnecting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Menghubungkan...
                    </>
                  ) : (
                    <>
                      <Bluetooth className="h-5 w-5" />
                      Hubungkan Printer
                    </>
                  )}
                </div>
              </button>
            ) : (
              <>
                <Button 
                  onClick={() => bluetooth.disconnect()} 
                  variant="outline" 
                  className="flex-1 border-2 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Putuskan
                </Button>
                <button
                  onClick={handleTestPrint}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <Printer className="h-4 w-4 mr-2 inline" />
                  Test Print
                </button>
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

          {/* Batch Print Buttons - Available in browser without Bluetooth */}
          {batchMode && batchTransactions && batchTransactions.length > 0 && (
            <>
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Laporan Penjualan (Batch Mode)</p>
                  <Badge variant="secondary" className="text-xs">
                    <Printer className="h-3 w-3 mr-1" />
                    Browser Print
                  </Badge>
                </div>
                
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

                {/* Summary Print Button - Works without Bluetooth in browser */}
                <Button
                  onClick={handlePrintSalesSummary}
                  disabled={isPrintingBatch}
                  className="w-full"
                  size="lg"
                >
                  {isPrintingBatch ? (
                    <>
                      Membuka Print Dialog...
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4 mr-2" />
                      Print Laporan (Browser)
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
                  <p className="font-semibold flex items-center gap-1 mb-2">
                    💡 Laporan Ringkas:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Semua transaksi digabung dalam 1 laporan</li>
                    <li>Hemat kertas - tidak print satu per satu</li>
                    <li>Ringkasan produk, metode bayar, dan total penjualan</li>
                    <li>Filter berdasarkan rentang tanggal</li>
                    <li><strong>📱 Mobile:</strong> Print ke thermal printer</li>
                    <li><strong>💻 Browser:</strong> Print dialog (semua printer)</li>
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

          {/* Product Sales Report Print - Simple like POS */}
          {productSalesText && (
            <>
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Cetak Laporan Produk
                  </p>
                  <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                </div>
                
                {bluetooth.isConnected ? (
                  <>
                    {/* Print Button - Green Theme for Reports */}
                    <button
                      onClick={handlePrintProductSales}
                      disabled={isPrintingBatch}
                      className="w-full group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 dark:from-emerald-500 dark:via-green-600 dark:to-teal-700 shadow-lg hover:shadow-xl"
                    >
                      {/* Background decoration */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="relative flex items-center gap-4">
                        <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                          {isPrintingBatch ? (
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                          ) : (
                            <FileText className="h-8 w-8 text-white" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-xl font-bold text-white">
                            {isPrintingBatch ? 'Mencetak...' : 'Cetak Laporan Penjualan'}
                          </p>
                          <p className="text-sm text-white/90 mt-1">
                            Thermal receipt dengan ringkasan produk
                          </p>
                        </div>
                        <Printer className="h-6 w-6 text-white/50" />
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <Alert>
                      <Bluetooth className="h-4 w-4" />
                      <AlertDescription>
                        Hubungkan printer Bluetooth terlebih dahulu untuk mencetak laporan
                      </AlertDescription>
                    </Alert>
                  </>
                )}
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
