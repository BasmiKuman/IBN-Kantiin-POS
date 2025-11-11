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
import { Download, TrendingUp, DollarSign, ShoppingCart, Package, FileText, FileSpreadsheet, Calendar } from "lucide-react";
import { useTransactions, useDailySales, type Transaction } from "@/hooks/supabase/useTransactions";
import { useProducts } from "@/hooks/supabase/useProducts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

export default function Reports() {
  const { data: transactions = [] as Transaction[], isLoading: loadingTransactions } = useTransactions();
  const { data: dailySales = [], isLoading: loadingDailySales } = useDailySales();
  const { data: products = [] } = useProducts();
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

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

  // Payment method breakdown
  const paymentMethods = filteredTransactions.reduce((acc, t) => {
    const method = t.payment_method || 'cash';
    acc[method] = (acc[method] || 0) + (t.total || 0);
    return acc;
  }, {} as Record<string, number>);

  const cashTotal = paymentMethods.cash || 0;
  const debitTotal = (paymentMethods.debit || 0) + (paymentMethods.credit || 0);
  const ewalletTotal = (paymentMethods.qris || 0) + (paymentMethods.transfer || 0);

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
      t.payment_method?.toUpperCase() || '-',
      `Rp ${formatCurrency(t.total || 0)}`,
      t.status || '-',
    ]);
    
    autoTable(doc, {
      startY: 75,
      head: [['No. Transaksi', 'Tanggal', 'Metode', 'Total', 'Status']],
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
      ['No. Transaksi', 'Tanggal', 'Waktu', 'Metode Pembayaran', 'Subtotal', 'Pajak', 'Total', 'Status'],
    ];
    
    // Transaction details - gunakan filtered transactions
    const transactionData = filteredTransactions.map(t => {
      const date = new Date(t.created_at || '');
      return [
        t.transaction_number || '-',
        date.toLocaleDateString('id-ID'),
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
            <p className="text-xs text-muted-foreground">Transaksi selesai</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produk Terjual</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Total item</p>
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
              <CardTitle>Top 10 Produk Terlaris</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Belum ada data produk
                  </p>
                ) : (
                  products.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">Stok: {product.stock}</p>
                        </div>
                      </div>
                      <p className="font-semibold">Rp {product.price.toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
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
    </div>
  );
}
