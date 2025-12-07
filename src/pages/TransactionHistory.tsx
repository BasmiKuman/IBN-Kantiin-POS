import { useState } from 'react';
import { useTransactions, Transaction } from '@/hooks/supabase/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PrintDialog } from '@/components/PrintDialog';
import { Loader2, Search, Printer, Receipt, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { ReceiptData } from '@/lib/receiptFormatter';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function TransactionHistory() {
  const { data: transactions, isLoading } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [batchPrintMode, setBatchPrintMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());

  // Filter transactions
  const filteredTransactions = transactions?.filter((transaction: any) => {
    const matchesSearch =
      transaction.transaction_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customers?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.employees?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = !dateFilter || 
      format(new Date(transaction.created_at), 'yyyy-MM-dd') === dateFilter;

    return matchesSearch && matchesDate;
  });

  const toggleTransaction = (id: string) => {
    const newExpanded = new Set(expandedTransactions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTransactions(newExpanded);
  };

  const toggleSelectTransaction = (id: string) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTransactions(newSelected);
  };

  const convertToReceiptData = (transaction: any): ReceiptData => {
    return {
      orderNumber: transaction.transaction_number,
      items: transaction.transaction_items?.map((item: any) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.unit_price,
        variant: item.variant_name || undefined,
      })) || [],
      subtotal: transaction.subtotal,
      tax: transaction.tax || 0,
      total: transaction.total,
      paymentMethod: transaction.payment_method,
      paymentAmount: transaction.payment_amount,
      changeAmount: transaction.change_amount,
      cashierName: transaction.employees?.name,
      customerName: transaction.customers?.name,
      date: new Date(transaction.created_at),
    };
  };

  const handlePrintSingle = (transaction: any) => {
    const receiptData = convertToReceiptData(transaction);
    setSelectedReceipt(receiptData);
    setShowPrintDialog(true);
  };

  const handleBatchPrint = () => {
    if (selectedTransactions.size === 0) return;
    
    // For batch print, we'll open dialog and print all selected
    setBatchPrintMode(true);
    setShowPrintDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Tunai',
      debit: 'Debit',
      credit: 'Kredit',
      qris: 'QRIS',
      transfer: 'Transfer',
    };
    return labels[method] || method;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: { variant: 'default', label: 'Selesai' },
      pending: { variant: 'secondary', label: 'Pending' },
      cancelled: { variant: 'destructive', label: 'Dibatalkan' },
    };
    const config = variants[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">History Transaksi</h1>
          <p className="text-muted-foreground">Lihat dan cetak ulang struk transaksi</p>
        </div>
        {batchPrintMode && (
          <div className="flex gap-2">
            {selectedTransactions.size > 0 ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTransactions(new Set())}
                  size="sm"
                >
                  Hapus Semua
                </Button>
                <Button variant="outline" onClick={() => {
                  setBatchPrintMode(false);
                  setSelectedTransactions(new Set());
                }}>
                  Batal
                </Button>
                <Button onClick={handleBatchPrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print {selectedTransactions.size} Transaksi
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (filteredTransactions) {
                      setSelectedTransactions(new Set(filteredTransactions.map((t: any) => t.id)));
                    }
                  }}
                  size="sm"
                >
                  Pilih Semua ({filteredTransactions?.length || 0})
                </Button>
                <Button variant="outline" onClick={() => {
                  setBatchPrintMode(false);
                  setSelectedTransactions(new Set());
                }}>
                  Batal
                </Button>
              </>
            )}
          </div>
        )}
        {!batchPrintMode && (
          <Button variant="outline" onClick={() => setBatchPrintMode(true)}>
            <Receipt className="mr-2 h-4 w-4" />
            Mode Print Batch
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Cari Transaksi</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="No. transaksi, pelanggan, kasir..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Filter Tanggal</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Tidak ada transaksi ditemukan
            </CardContent>
          </Card>
        ) : (
          filteredTransactions?.map((transaction: any) => (
            <Card key={transaction.id} className={batchPrintMode && selectedTransactions.has(transaction.id) ? 'border-primary' : ''}>
              <Collapsible
                open={expandedTransactions.has(transaction.id)}
                onOpenChange={() => toggleTransaction(transaction.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {batchPrintMode && (
                        <input
                          type="checkbox"
                          checked={selectedTransactions.has(transaction.id)}
                          onChange={() => toggleSelectTransaction(transaction.id)}
                          className="mt-1 h-4 w-4"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-lg">
                            {transaction.transaction_number}
                          </CardTitle>
                          {getStatusBadge(transaction.status || 'completed')}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1 mt-2">
                          <p>
                            {format(new Date(transaction.created_at), "dd MMMM yyyy, HH:mm", {
                              locale: localeId,
                            })}
                          </p>
                          {transaction.customers?.name && (
                            <p>Pelanggan: {transaction.customers.name}</p>
                          )}
                          {transaction.employees?.name && (
                            <p>Kasir: {transaction.employees.name}</p>
                          )}
                          <p>
                            Pembayaran: <span className="font-medium">{getPaymentMethodLabel(transaction.payment_method)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(transaction.total)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {!batchPrintMode && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrintSingle(transaction);
                            }}
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            Print
                          </Button>
                        )}
                        <CollapsibleTrigger asChild>
                          <Button size="sm" variant="ghost">
                            {expandedTransactions.has(transaction.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Detail Pesanan</h4>
                      <div className="space-y-2">
                        {transaction.transaction_items?.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center py-2 border-b last:border-0"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{item.product_name}</p>
                              {item.variant_name && (
                                <p className="text-xs text-muted-foreground">
                                  Varian: {item.variant_name}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} x {formatCurrency(item.unit_price)}
                              </p>
                            </div>
                            <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 space-y-2 pt-3 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>{formatCurrency(transaction.subtotal)}</span>
                        </div>
                        {transaction.discount > 0 && (
                          <div className="flex justify-between text-sm text-destructive">
                            <span>Diskon</span>
                            <span>-{formatCurrency(transaction.discount)}</span>
                          </div>
                        )}
                        {transaction.tax > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Pajak</span>
                            <span>{formatCurrency(transaction.tax)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                          <span>Total</span>
                          <span>{formatCurrency(transaction.total)}</span>
                        </div>
                        {transaction.payment_amount > transaction.total && (
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Bayar</span>
                            <span>{formatCurrency(transaction.payment_amount)}</span>
                          </div>
                        )}
                        {transaction.change_amount > 0 && (
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Kembalian</span>
                            <span>{formatCurrency(transaction.change_amount)}</span>
                          </div>
                        )}
                      </div>

                      {transaction.notes && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                          <p className="text-sm">
                            <span className="font-semibold">Catatan: </span>
                            {transaction.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>

      {/* Print Dialog */}
      <PrintDialog
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
        receiptData={selectedReceipt}
        batchMode={batchPrintMode}
        batchTransactions={batchPrintMode ? 
          filteredTransactions?.filter((t: any) => selectedTransactions.has(t.id))
            .map((t: any) => convertToReceiptData(t)) 
          : undefined
        }
      />
    </div>
  );
}
