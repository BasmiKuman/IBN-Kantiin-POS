import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, TrendingUp, DollarSign, ShoppingCart, Package, FileText, FileSpreadsheet, Calendar, Clock, Hash, Printer, Tag } from "lucide-react";
import { useTransactions, useDailySales, useProductSales, type Transaction } from "@/hooks/supabase/useTransactions";
import { useProducts } from "@/hooks/supabase/useProducts";
import { PrintDialog } from "@/components/PrintDialog";
import { generateProductSalesReport } from "@/lib/receiptFormatter";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export default function Reports() {
  // Date filter state - MUST BE DECLARED FIRST
  // State filter untuk tab Laporan & Analitik
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // State filter untuk tab Produk
  const [productDateFilter, setProductDateFilter] = useState<string>('all');
  const [productStartDate, setProductStartDate] = useState<string>('');
  const [productEndDate, setProductEndDate] = useState<string>('');
  
  // State for Print Dialog
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printReceiptText, setPrintReceiptText] = useState<string>('');

  const { data: transactions = [] as Transaction[], isLoading: loadingTransactions } = useTransactions();
  const { data: dailySales = [], isLoading: loadingDailySales } = useDailySales();
  const { data: products = [] } = useProducts();
  
  // Product sales with date filter
  // Filter tanggal untuk tab Produk
  // Helper untuk format tanggal yyyy-mm-dd
  // Format tanggal ke YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  // Format ke awal dan akhir hari
  const toStartOfDay = (dateStr: string) => dateStr ? `${dateStr}T00:00:00` : undefined;
  const toEndOfDay = (dateStr: string) => dateStr ? `${dateStr}T23:59:59` : undefined;

  const getProductSalesDateRange = () => {
    const today = new Date();
    let start: string | undefined = undefined;
    let end: string | undefined = undefined;
    if (productDateFilter === 'today') {
      const d = formatDate(today);
      start = toStartOfDay(d);
      end = toEndOfDay(d);
    } else if (productDateFilter === 'yesterday') {
      const yest = new Date();
      yest.setDate(today.getDate() - 1);
      const d = formatDate(yest);
      start = toStartOfDay(d);
      end = toEndOfDay(d);
    } else if (productDateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 6);
      start = toStartOfDay(formatDate(weekAgo));
      end = toEndOfDay(formatDate(today));
    } else if (productDateFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(today.getMonth() - 1);
      start = toStartOfDay(formatDate(monthAgo));
      end = toEndOfDay(formatDate(today));
    } else if (productDateFilter === 'custom' && productStartDate && productEndDate) {
      start = toStartOfDay(productStartDate);
      end = toEndOfDay(productEndDate);
    }
    return { start, end };
  };
  const { start: productStart, end: productEnd } = getProductSalesDateRange();
  const { data: productSales = [], isLoading: loadingProductSales } = useProductSales(productStart, productEnd);
  
  // Debug: Log productSales setiap kali data berubah
  console.log('🔍 ProductSales Hook Data:', {
    filter: productDateFilter,
    start: productStart,
    end: productEnd,
    dataLength: productSales.length,
    data: productSales,
  });

  // Filter transactions by date
  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(t => t.created_at?.startsWith(today));
    } else if (dateFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      filtered = filtered.filter(t => t.created_at?.startsWith(yesterdayStr));
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(t => new Date(t.created_at || '') >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(t => new Date(t.created_at || '') >= monthAgo);
    } else if (dateFilter === 'custom' && startDate && endDate) {
      filtered = filtered.filter(t => {
        const tDate = t.created_at?.split('T')[0] || '';
        return tDate >= startDate && tDate <= endDate;
      });
    }
    
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate metrics dari filtered data
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
  const totalTransactions = filteredTransactions.length;
  const totalItems = filteredTransactions.reduce((sum, t) => {
    // This would need transaction_items join, for now estimate
    return sum + 1;
  }, 0);
  const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  
  // Calculate promotion metrics
  const totalPromotionDiscount = filteredTransactions.reduce((sum, t) => sum + (t.promotion_discount || 0), 0);
  const transactionsWithPromo = filteredTransactions.filter(t => t.promotion_discount > 0).length;

  // Payment method breakdown
  const paymentMethods = filteredTransactions.reduce((acc, t) => {
    const method = t.payment_method || 'cash';
    acc[method] = (acc[method] || 0) + (t.total || 0);
    return acc;
  }, {} as Record<string, number>);

  // Payment method counts
  const paymentMethodCounts = filteredTransactions.reduce((acc, t) => {
    const method = t.payment_method || 'cash';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cashTotal = paymentMethods.cash || 0;
  const debitTotal = (paymentMethods.debit || 0) + (paymentMethods.credit || 0);
  const ewalletTotal = (paymentMethods.qris || 0) + (paymentMethods.transfer || 0);
  
  const cashTransactionCount = paymentMethodCounts.cash || 0;
  const qrisTransactionCount = paymentMethodCounts.qris || 0;

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('id-ID');
    
        // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BASMIKUMAN POS', 14, 22);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Laporan Penjualan', 14, 30);
    doc.setFontSize(9);
    doc.text(`Tanggal: ${date}`, 14, 36);
    if (dateFilter === 'custom' && startDate && endDate) {
      doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 41);
    }
    
    // Summary metrics
    doc.setFontSize(12);
    doc.text('Ringkasan', 14, 50);
  doc.setFontSize(9);
  doc.text(`Total Pendapatan: Rp ${formatCurrency(totalRevenue)}`, 14, 58);
  doc.text(`Total Transaksi: ${totalTransactions}`, 14, 64);
  doc.text(`Rata-rata Transaksi: Rp ${formatCurrency(Math.round(avgTransaction))}`, 14, 70);
    
    // Transactions table
    const tableData = filteredTransactions.slice(0, 50).map(t => [
      t.transaction_number || '-',
      new Date(t.created_at || '').toLocaleDateString('id-ID'),
      (t.transaction_items && t.transaction_items.length > 0)
        ? t.transaction_items.map(item => item.product_name).join(', ')
        : '-',
      t.payment_method?.toUpperCase() || '-',
      `Rp ${formatCurrency(t.total || 0)}`,
      t.status || '-',
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['No. Transaksi', 'Tanggal', 'Produk', 'Metode', 'Total', 'Status']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    
    // Save PDF
    doc.save(`Laporan_Penjualan_${date.replace(/\//g, '-')}.pdf`);
    
    toast({
      title: "PDF Berhasil Diexport",
      description: `Laporan penjualan telah diunduh`,
    });
  };

  // Export to Excel
  const exportToExcel = () => {
    const date = new Date().toLocaleDateString('id-ID');
    
    // Summary data
    const summaryData = [
      ['BASMIKUMAN POS'],
      ['Laporan Penjualan'],
      [`Tanggal: ${date}`],
      ...(dateFilter === 'custom' && startDate && endDate ? [[`Periode: ${startDate} s/d ${endDate}`]] : []),
      [''],
  ['RINGKASAN'],
  ['Total Pendapatan', `Rp ${formatCurrency(totalRevenue)}`],
  ['Total Transaksi', totalTransactions],
  ['Rata-rata Transaksi', `Rp ${formatCurrency(Math.round(avgTransaction))}`],
      ['Produk Terjual', totalItems],
      [''],
      ['METODE PEMBAYARAN'],
  ['Tunai', `Rp ${formatCurrency(cashTotal)}`],
  ['E-Wallet/QRIS', `Rp ${formatCurrency(ewalletTotal)}`],
  ['Transfer', `Rp ${formatCurrency(paymentMethods.transfer || 0)}`],
      [''],
      ['DETAIL TRANSAKSI'],
      ['No. Transaksi', 'Tanggal', 'Produk', 'Waktu', 'Metode Pembayaran', 'Subtotal', 'Pajak', 'Total', 'Status'],
    ];
    
    // Transaction details - gunakan filtered transactions
    const transactionData = filteredTransactions.map(t => {
      const date = new Date(t.created_at || '');
      return [
        t.transaction_number || '-',
        date.toLocaleDateString('id-ID'),
        (t.transaction_items && t.transaction_items.length > 0)
          ? t.transaction_items.map(item => item.product_name).join(', ')
          : '-',
        date.toLocaleTimeString('id-ID'),
        t.payment_method?.toUpperCase() || '-',
        t.subtotal || 0,
        t.tax || 0,
        t.total || 0,
        t.status || '-',
      ];
    });
    
    const fullData = [...summaryData, ...transactionData];
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(fullData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 18 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
    ];
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Penjualan');
    
    // Save Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `Laporan_Penjualan_${date.replace(/\//g, '-')}.xlsx`);
    
    toast({
      title: "Excel Berhasil Diexport",
      description: `Laporan penjualan telah diunduh`,
    });
  };

  if (loadingTransactions || loadingDailySales) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data laporan...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan & Analitik</h2>
          <p className="text-muted-foreground">Analisis performa bisnis Anda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Date Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter Tanggal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Quick Access Filter */}
            <div className="space-y-2">
              <Label>Quick Access</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Data</SelectItem>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="yesterday">Kemarin</SelectItem>
                  <SelectItem value="week">7 Hari Terakhir</SelectItem>
                  <SelectItem value="month">30 Hari Terakhir</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {dateFilter === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label>Dari Tanggal</Label>
                  <Input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-[180px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sampai Tanggal</Label>
                  <Input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-[180px]"
                  />
                </div>
              </>
            )}

            {/* Filter Info */}
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">
                {dateFilter === 'all' && 'Menampilkan semua data'}
                {dateFilter === 'today' && 'Menampilkan data hari ini'}
                {dateFilter === 'yesterday' && 'Menampilkan data kemarin'}
                {dateFilter === 'week' && 'Menampilkan data 7 hari terakhir'}
                {dateFilter === 'month' && 'Menampilkan data 30 hari terakhir'}
                {dateFilter === 'custom' && startDate && endDate && 
                  `Menampilkan data dari ${startDate} s/d ${endDate}`}
              </div>
              <div className="text-sm font-medium mt-1">
                {totalTransactions} transaksi • Rp {formatCurrency(totalRevenue)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Total penjualan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              {transactionsWithPromo > 0 && (
                <span className="text-green-600">🎟️ {transactionsWithPromo} dengan promo</span>
              )}
              {!transactionsWithPromo && "Transaksi selesai"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diskon Promosi</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rp {formatCurrency(totalPromotionDiscount)}</div>
            <p className="text-xs text-muted-foreground">Total potongan promo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Transaksi</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {formatCurrency(Math.round(avgTransaction))}</div>
            <p className="text-xs text-muted-foreground">Per transaksi</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Penjualan</TabsTrigger>
          <TabsTrigger value="products">Produk</TabsTrigger>
          <TabsTrigger value="profit">Profit</TabsTrigger>
          <TabsTrigger value="customers">Pelanggan</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grafik Penjualan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Area chart - Penjualan per hari/minggu/bulan
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Penjualan per Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: "Makanan", amount: "Rp 0", percentage: 0 },
                    { category: "Minuman", amount: "Rp 0", percentage: 0 },
                    { category: "Snack", amount: "Rp 0", percentage: 0 },
                  ].map((item) => (
                    <div key={item.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-muted-foreground">{item.amount}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metode Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { method: "Tunai", amount: cashTotal, percentage: totalRevenue > 0 ? (cashTotal / totalRevenue) * 100 : 0 },
                    { method: "Kartu Debit/Kredit", amount: debitTotal, percentage: totalRevenue > 0 ? (debitTotal / totalRevenue) * 100 : 0 },
                    { method: "E-Wallet/QRIS", amount: ewalletTotal, percentage: totalRevenue > 0 ? (ewalletTotal / totalRevenue) * 100 : 0 },
                  ].map((item) => (
                    <div key={item.method}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{item.method}</span>
                        <span className="text-muted-foreground">Rp {item.amount.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Laporan Penjualan Produk
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filter tanggal & quick access untuk produk */}
              <div className="flex flex-wrap gap-4 items-end mb-6">
                <div className="space-y-2">
                  <Label>Quick Access</Label>
                  <Select value={productDateFilter} onValueChange={setProductDateFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Pilih periode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Data</SelectItem>
                      <SelectItem value="today">Hari Ini</SelectItem>
                      <SelectItem value="yesterday">Kemarin</SelectItem>
                      <SelectItem value="week">7 Hari Terakhir</SelectItem>
                      <SelectItem value="month">30 Hari Terakhir</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {productDateFilter === 'custom' && (
                  <>
                    <div className="space-y-2">
                      <Label>Dari Tanggal</Label>
                      <Input type="date" value={productStartDate} onChange={e => setProductStartDate(e.target.value)} className="w-[180px]" />
                    </div>
                    <div className="space-y-2">
                      <Label>Sampai Tanggal</Label>
                      <Input type="date" value={productEndDate} onChange={e => setProductEndDate(e.target.value)} className="w-[180px]" />
                    </div>
                  </>
                )}
                {/* Print Thermal Button */}
                <div className="ml-auto">
                  <Button
                    onClick={() => {
                      // Debug: Log data sebelum generate
                      console.log('=== DEBUG PRINT THERMAL ===');
                      console.log('Product Date Filter:', productDateFilter);
                      console.log('Product Start:', productStart);
                      console.log('Product End:', productEnd);
                      console.log('Product Sales Data:', productSales);
                      console.log('Total Items:', productSales.reduce((sum, p) => sum + (p.total_quantity || 0), 0));
                      console.log('Total Revenue:', productSales.reduce((sum, p) => sum + (p.total_sales || 0), 0));
                      
                      // Generate receipt text dengan data terkini
                      const receiptText = generateProductSalesReport({
                        period: productDateFilter === 'today' ? 'Hari Ini' :
                                productDateFilter === 'yesterday' ? 'Kemarin' :
                                productDateFilter === 'week' ? '7 Hari Terakhir' :
                                productDateFilter === 'month' ? '30 Hari Terakhir' :
                                productDateFilter === 'custom' && productStartDate && productEndDate 
                                  ? `${productStartDate} s/d ${productEndDate}` : 'Semua',
                        startDate: productStart,
                        endDate: productEnd,
                        products: productSales.map(p => ({
                          product_name: p.product_name || 'Unknown Product',
                          total_quantity: p.total_quantity || 0,
                          total_revenue: p.total_sales || 0,
                        })),
                        totalItems: productSales.reduce((sum, p) => sum + (p.total_quantity || 0), 0),
                        totalRevenue: productSales.reduce((sum, p) => sum + (p.total_sales || 0), 0),
                        totalPromotionDiscount: totalPromotionDiscount,
                        transactionsWithPromo: transactionsWithPromo,
                        totalTransactions: totalTransactions,
                        cashierName: localStorage.getItem('userName') || 'Admin',
                      });
                      
                      console.log('Generated Receipt:', receiptText);
                      console.log('=== END DEBUG ===');
                      
                      setPrintReceiptText(receiptText);
                      setShowPrintDialog(true);
                    }}
                    disabled={loadingProductSales || productSales.length === 0}
                    className="gap-2"
                    variant="outline"
                  >
                    <Printer className="h-4 w-4" />
                    Print Thermal
                  </Button>
                </div>
              </div>
              {loadingProductSales ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Memuat data...</p>
                </div>
              ) : productSales.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Belum ada transaksi penjualan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total Produk Terjual
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {productSales.reduce((sum, p) => sum + p.total_quantity, 0)} item
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Varian Produk
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {productSales.length} produk
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total Penjualan Produk
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-success">
                          Rp {productSales.reduce((sum, p) => sum + p.total_sales, 0).toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Product Sales Table */}
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Produk</TableHead>
                          <TableHead className="text-center">Kategori</TableHead>
                          <TableHead className="text-center">Terjual</TableHead>
                          <TableHead className="text-right">Harga Rata-rata</TableHead>
                          <TableHead className="text-right">Total Penjualan</TableHead>
                          <TableHead className="text-center">Transaksi</TableHead>
                          <TableHead className="text-center">Detail</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productSales.map((product, index) => (
                          <Collapsible key={product.product_id + '-' + (product.variant_id || '')} asChild>
                            <>
                              <TableRow>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{product.product_name}</p>
                                    {product.sku && (
                                      <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline">{product.category}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="secondary">
                                    {product.total_quantity} pcs
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  Rp {Math.round(product.avg_price).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-success">
                                  Rp {product.total_sales.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge>{product.transaction_count}x</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </CollapsibleTrigger>
                                </TableCell>
                              </TableRow>
                              <CollapsibleContent asChild>
                                <TableRow>
                                  <TableCell colSpan={8} className="bg-muted/30">
                                    <div className="p-4 space-y-2">
                                      <p className="font-semibold text-sm mb-3 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Riwayat Transaksi:
                                      </p>
                                      <div className="grid gap-2">
                                        {product.transactions.slice(0, 10).map((txn: any, idx: number) => (
                                          <div key={idx} className="flex items-center justify-between text-sm border-b pb-2">
                                            <div className="flex items-center gap-3">
                                              <Badge variant="outline" className="font-mono">
                                                {txn.transaction_number}
                                              </Badge>
                                              <span className="text-muted-foreground">
                                                {new Date(txn.date).toLocaleString('id-ID', {
                                                  day: '2-digit',
                                                  month: 'short',
                                                  year: 'numeric',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                })}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                              <span className="flex items-center gap-1">
                                                <Hash className="h-3 w-3 text-muted-foreground" />
                                                {txn.quantity} pcs
                                              </span>
                                              <span className="text-muted-foreground">
                                                @ Rp {txn.unit_price.toLocaleString()}
                                              </span>
                                              <span className="font-semibold min-w-[120px] text-right">
                                                = Rp {txn.subtotal.toLocaleString()}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                        {product.transactions.length > 10 && (
                                          <p className="text-xs text-muted-foreground text-center pt-2">
                                            ... dan {product.transactions.length - 10} transaksi lainnya
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              </CollapsibleContent>
                            </>
                          </Collapsible>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analisis Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Line chart - Profit margin dan gross profit
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Gross Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp {formatCurrency(Math.round(totalRevenue * 0.6))}</div>
                <p className="text-xs text-muted-foreground">Estimasi 60% margin</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Operating Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp 0</div>
                <p className="text-xs text-muted-foreground">Belum ada data</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">Rp {formatCurrency(Math.round(totalRevenue * 0.6))}</div>
                <p className="text-xs text-muted-foreground">Estimasi</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analisis Pelanggan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Chart - Pelanggan baru vs returning customers
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Print Dialog for Product Sales Report */}
      <PrintDialog 
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
        productSalesText={printReceiptText}
      />
    </div>
  );
}
