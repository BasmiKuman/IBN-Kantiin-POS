import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Loader2, Printer, FileText, ChevronDown, ChevronUp, Gift } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { useProducts } from "@/hooks/supabase/useProducts";
import { useCategories } from "@/hooks/supabase/useCategories";
import { useCreateTransaction, generateTransactionNumber } from "@/hooks/supabase/useTransactions";
import { useSearchCustomer, useUpdateCustomerPoints } from "@/hooks/supabase/useCustomers";
import { toast } from "@/hooks/use-toast";
import { Receipt } from "@/components/Receipt";
import { KitchenReceipt } from "@/components/KitchenReceipt";
import { useReactToPrint } from "react-to-print";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface PaymentSettings {
  cashEnabled: boolean;
  cardEnabled: boolean;
  ewalletEnabled: boolean;
  transferEnabled: boolean;
  taxRate: number;
  serviceCharge: number;
  showTaxSeparately: boolean;
  qrisImageUrl?: string;
}

interface LoyaltySettings {
  enabled: boolean;
  pointsPerRupiah: number;
  rupiahPerPoint: number;
  minimumPointsRedeem: number;
  minimumPurchaseEarn: number;
}

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [kitchenReceiptDialogOpen, setKitchenReceiptDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'qris' | 'transfer'>('cash');
  const [paymentAmount, setPaymentAmount] = useState("");
  const [openBillPaymentDialogOpen, setOpenBillPaymentDialogOpen] = useState(false);
  const [selectedOpenBillForPayment, setSelectedOpenBillForPayment] = useState<string | null>(null);
  const [paymentMethodDialogOpen, setPaymentMethodDialogOpen] = useState(false);
  const [qrisDialogOpen, setQrisDialogOpen] = useState(false);
  const [qrisTransactionTotal, setQrisTransactionTotal] = useState(0);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    cashEnabled: true,
    cardEnabled: false,
    ewalletEnabled: true,
    transferEnabled: true,
    taxRate: 10,
    serviceCharge: 0,
    showTaxSeparately: true,
  });
  const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings>({
    enabled: false,
    pointsPerRupiah: 1000,
    rupiahPerPoint: 1000,
    minimumPointsRedeem: 10,
    minimumPurchaseEarn: 10000,
  });
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  
  const [lastTransaction, setLastTransaction] = useState<{
    transactionNumber: string;
    date: Date;
    items: CartItem[];
    subtotal: number;
    tax: number;
    taxRate: number;
    serviceCharge: number;
    total: number;
    paymentMethod: 'cash' | 'qris' | 'transfer';
    paymentAmount: number;
    changeAmount: number;
    customerName?: string;
    customerPoints?: number;
    earnedPoints: number;
  } | null>(null);

  const [lastOpenBill, setLastOpenBill] = useState<{
    orderNumber: string;
    date: Date;
    items: CartItem[];
    customerName?: string;
    notes?: string;
  } | null>(null);

  // State untuk menyimpan semua open bills
  const [openBills, setOpenBills] = useState<Array<{
    orderNumber: string;
    date: Date;
    items: CartItem[];
    customerName?: string;
    notes?: string;
    subtotal: number;
    tax: number;
    serviceCharge: number;
    total: number;
  }>>([]);

  // State untuk track open bill yang sedang diedit
  const [editingOpenBillNumber, setEditingOpenBillNumber] = useState<string | null>(null);

  const receiptRef = useRef<HTMLDivElement>(null);
  const kitchenReceiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  });

  const handlePrintKitchen = useReactToPrint({
    contentRef: kitchenReceiptRef,
  });

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: customer } = useSearchCustomer(customerPhone);
  const createTransaction = useCreateTransaction();
  const updateCustomerPoints = useUpdateCustomerPoints();

  // Load open bills from localStorage on mount
  useEffect(() => {
    const loadOpenBills = () => {
      const saved = localStorage.getItem("open_bills");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Convert date strings back to Date objects
          const billsWithDates = parsed.map((bill: any) => ({
            ...bill,
            date: new Date(bill.date),
          }));
          setOpenBills(billsWithDates);
        } catch (error) {
          console.error("Error loading open bills:", error);
        }
      }
    };
    loadOpenBills();
  }, []);

  // Save open bills to localStorage whenever it changes
  useEffect(() => {
    if (openBills.length > 0) {
      localStorage.setItem("open_bills", JSON.stringify(openBills));
    } else {
      localStorage.removeItem("open_bills");
    }
  }, [openBills]);

  // Load payment settings from localStorage
  useEffect(() => {
    const loadPaymentSettings = () => {
      const saved = localStorage.getItem("settings_payment");
      if (saved) {
        setPaymentSettings(JSON.parse(saved));
      }
    };
    loadPaymentSettings();
  }, []);

  // Load loyalty settings from localStorage
  useEffect(() => {
    const loadLoyaltySettings = () => {
      const saved = localStorage.getItem("settings_loyalty");
      if (saved) {
        setLoyaltySettings(JSON.parse(saved));
      }
    };
    loadLoyaltySettings();
  }, []);

  const addToCart = (product: typeof products[0]) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { 
        id: product.id,
        name: product.name, 
        price: Number(product.price), 
        quantity: 1, 
        category: product.categories?.name || 'Lainnya' 
      }]);
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = paymentSettings.showTaxSeparately ? (subtotal * paymentSettings.taxRate / 100) : 0;
  const serviceCharge = subtotal * paymentSettings.serviceCharge / 100;
  
  // Calculate points discount
  const pointsDiscount = usePoints && customer ? Math.min(
    pointsToRedeem * loyaltySettings.rupiahPerPoint,
    subtotal + tax + serviceCharge
  ) : 0;
  
  const total = subtotal + tax + serviceCharge - pointsDiscount;

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePayment = async (method: 'cash' | 'qris' | 'transfer') => {
    setSelectedPaymentMethod(method);
    
    if (method === 'cash') {
      setPaymentDialogOpen(true);
    } else if (method === 'qris') {
      setQrisTransactionTotal(total);
      setQrisDialogOpen(true);
    } else {
      await processTransaction(method, total);
    }
  };

  const processTransaction = async (method: 'cash' | 'qris' | 'transfer', paidAmount?: number) => {
    try {
      const transactionNumber = generateTransactionNumber();
      const paymentAmountNum = paidAmount || total;
      const changeAmount = method === 'cash' ? Math.max(0, paymentAmountNum - total) : 0;

      // Calculate earned points only if loyalty enabled and meets minimum purchase
      const earnedPoints = loyaltySettings.enabled && subtotal >= loyaltySettings.minimumPurchaseEarn 
        ? Math.floor(subtotal / loyaltySettings.pointsPerRupiah)
        : 0;

      // Calculate redeemed points
      const redeemedPoints = usePoints && customer ? pointsToRedeem : 0;

      await createTransaction.mutateAsync({
        transaction: {
          transaction_number: transactionNumber,
          customer_id: customer?.id || null,
          cashier_id: null, // TODO: Get from auth
          subtotal,
          discount: pointsDiscount,
          tax,
          total,
          payment_method: method,
          payment_amount: paymentAmountNum,
          change_amount: changeAmount,
          status: 'completed',
          notes: null,
        },
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        })),
      });

      // Update customer points if customer selected
      let updatedCustomerPoints = customer?.points || 0;
      if (customer) {
        // New points = current points - redeemed + earned
        const newPoints = (customer.points || 0) - redeemedPoints + earnedPoints;
        const newTotalPurchases = (customer.total_purchases || 0) + total;
        updatedCustomerPoints = newPoints;

        await updateCustomerPoints.mutateAsync({
          id: customer.id,
          points: newPoints,
          totalPurchases: newTotalPurchases,
        });
      }

      // Save transaction data for receipt
      setLastTransaction({
        transactionNumber,
        date: new Date(),
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category,
        })),
        subtotal,
        tax,
        taxRate: paymentSettings.taxRate,
        serviceCharge: subtotal * paymentSettings.serviceCharge / 100,
        total,
        paymentMethod: method,
        paymentAmount: paymentAmountNum,
        changeAmount,
        customerName: customer?.name,
        customerPoints: updatedCustomerPoints,
        earnedPoints,
      });

      // Reset cart and close payment dialog
      setCart([]);
      setPaymentDialogOpen(false);
      setPaymentAmount("");
      setCustomerPhone("");
      setCustomerName("");
      setUsePoints(false);
      setPointsToRedeem(0);

      // Show receipt dialog
      setReceiptDialogOpen(true);

      toast({
        title: "Transaksi Berhasil!",
        description: `No. Transaksi: ${transactionNumber}${customer ? ` | Poin: +${earnedPoints}` : ''}`,
      });

    } catch (error) {
      console.error('Transaction error:', error);
      toast({
        title: "Error",
        description: "Gagal memproses transaksi",
        variant: "destructive",
      });
    }
  };

  const handleOpenBill = () => {
    if (cart.length === 0) {
      toast({
        title: "Keranjang Kosong",
        description: "Tambahkan produk terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    const orderNumber = generateTransactionNumber();
    const billSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const billTax = paymentSettings.showTaxSeparately ? (billSubtotal * paymentSettings.taxRate / 100) : 0;
    const billServiceCharge = billSubtotal * paymentSettings.serviceCharge / 100;
    const billTotal = billSubtotal + billTax + billServiceCharge;
    
    const newOpenBill = {
      orderNumber,
      date: new Date(),
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
      })),
      customerName: customerName || undefined,
      notes: orderNotes || undefined,
      subtotal: billSubtotal,
      tax: billTax,
      serviceCharge: billServiceCharge,
      total: billTotal,
    };

    // Simpan ke array openBills
    setOpenBills(prev => [...prev, newOpenBill]);

    setLastOpenBill({
      orderNumber,
      date: new Date(),
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
      })),
      customerName: customerName || undefined,
      notes: orderNotes || undefined,
    });

    // Show kitchen receipt dialog
    setKitchenReceiptDialogOpen(true);

    toast({
      title: "Open Bill Dibuat!",
      description: `No. Order: ${orderNumber}`,
    });
  };

  const handleCloseOpenBill = () => {
    // Reset form after printing
    setCart([]);
    setCustomerName("");
    setOrderNotes("");
    setKitchenReceiptDialogOpen(false);
  };

  const handlePayOpenBill = async (orderNumber: string, method: 'cash' | 'qris' | 'transfer') => {
    const bill = openBills.find(b => b.orderNumber === orderNumber);
    if (!bill) return;

    try {
      const paymentAmountNum = bill.total;
      const changeAmount = 0;
      const earnedPoints = Math.floor(bill.total / 1000);

      await createTransaction.mutateAsync({
        transaction: {
          transaction_number: bill.orderNumber,
          customer_id: customer?.id || null,
          cashier_id: null,
          subtotal: bill.subtotal,
          discount: 0,
          tax: bill.tax,
          total: bill.total,
          payment_method: method,
          payment_amount: paymentAmountNum,
          change_amount: changeAmount,
          status: 'completed',
          notes: bill.notes || null,
        },
        items: bill.items.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        })),
      });

      // Update customer points if customer selected
      let updatedCustomerPoints = customer?.points || 0;
      if (customer) {
        const newPoints = (customer.points || 0) + earnedPoints;
        const newTotalPurchases = (customer.total_purchases || 0) + bill.total;
        updatedCustomerPoints = newPoints;

        await updateCustomerPoints.mutateAsync({
          id: customer.id,
          points: newPoints,
          totalPurchases: newTotalPurchases,
        });
      }

      // Set last transaction for receipt
      setLastTransaction({
        transactionNumber: bill.orderNumber,
        date: bill.date,
        items: bill.items,
        subtotal: bill.subtotal,
        tax: bill.tax,
        taxRate: paymentSettings.taxRate,
        serviceCharge: bill.serviceCharge,
        total: bill.total,
        paymentMethod: method,
        paymentAmount: paymentAmountNum,
        changeAmount,
        customerName: bill.customerName,
        customerPoints: updatedCustomerPoints,
        earnedPoints,
      });

      // Remove from open bills
      setOpenBills(prev => prev.filter(b => b.orderNumber !== orderNumber));

      // Show receipt dialog
      setReceiptDialogOpen(true);

      toast({
        title: "Pembayaran Berhasil!",
        description: `Open Bill ${orderNumber} telah dibayar`,
      });

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Error",
        description: "Gagal memproses pembayaran",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOpenBill = (orderNumber: string) => {
    setOpenBills(prev => prev.filter(b => b.orderNumber !== orderNumber));
    toast({
      title: "Open Bill Dihapus",
      description: `Order ${orderNumber} telah dihapus`,
    });
  };

  const handleLoadOpenBillToCart = (orderNumber: string) => {
    const bill = openBills.find(b => b.orderNumber === orderNumber);
    if (!bill) return;

    setCart(bill.items);
    setCustomerName(bill.customerName || "");
    setOrderNotes(bill.notes || "");
    setEditingOpenBillNumber(orderNumber); // Track yang sedang diedit
    
    toast({
      title: "Open Bill Dimuat",
      description: `Order ${orderNumber} dimuat ke keranjang untuk diedit`,
    });
  };

  const handleSaveOpenBillChanges = () => {
    if (!editingOpenBillNumber) return;
    
    if (cart.length === 0) {
      toast({
        title: "Keranjang Kosong",
        description: "Tidak ada item untuk disimpan",
        variant: "destructive",
      });
      return;
    }

    const billSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const billTax = paymentSettings.showTaxSeparately ? (billSubtotal * paymentSettings.taxRate / 100) : 0;
    const billServiceCharge = billSubtotal * paymentSettings.serviceCharge / 100;
    const billTotal = billSubtotal + billTax + billServiceCharge;

    // Update open bill yang ada
    setOpenBills(prev => prev.map(bill => 
      bill.orderNumber === editingOpenBillNumber
        ? {
            ...bill,
            items: cart.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              category: item.category,
            })),
            customerName: customerName || undefined,
            notes: orderNotes || undefined,
            subtotal: billSubtotal,
            tax: billTax,
            serviceCharge: billServiceCharge,
            total: billTotal,
          }
        : bill
    ));

    // Reset state
    setCart([]);
    setCustomerName("");
    setOrderNotes("");
    setEditingOpenBillNumber(null);

    toast({
      title: "Open Bill Diupdate!",
      description: `Order ${editingOpenBillNumber} telah disimpan`,
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Produk</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="makanan">Makanan</TabsTrigger>
                <TabsTrigger value="minuman">Minuman</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-0">
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="cursor-pointer transition-all hover:shadow-md"
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square mb-2 flex items-center justify-center rounded-lg bg-muted">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium">{product.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm font-semibold text-primary">
                            Rp {product.price.toLocaleString()}
                          </p>
                          <Badge variant="secondary">{product.categories?.name || 'Lainnya'}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="makanan">
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {filteredProducts
                    .filter((p) => p.categories?.name === "Makanan")
                    .map((product) => (
                      <Card
                        key={product.id}
                        className="cursor-pointer transition-all hover:shadow-md"
                        onClick={() => addToCart(product)}
                      >
                        <CardContent className="p-4">
                          <div className="aspect-square mb-2 flex items-center justify-center rounded-lg bg-muted">
                            <Package className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm font-semibold text-primary mt-2">
                            Rp {product.price.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="minuman">
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {filteredProducts
                    .filter((p) => p.categories?.name === "Minuman")
                    .map((product) => (
                      <Card
                        key={product.id}
                        className="cursor-pointer transition-all hover:shadow-md"
                        onClick={() => addToCart(product)}
                      >
                        <CardContent className="p-4">
                          <div className="aspect-square mb-2 flex items-center justify-center rounded-lg bg-muted">
                            <Package className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm font-semibold text-primary mt-2">
                            Rp {product.price.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Keranjang & Open Bills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="cart" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cart">
                  Keranjang
                  {cart.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{cart.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="openbills">
                  Open Bills
                  {openBills.length > 0 && (
                    <Badge variant="destructive" className="ml-2">{openBills.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Tab Keranjang */}
              <TabsContent value="cart" className="space-y-4 mt-4">
                <div className="max-h-[300px] space-y-2 overflow-auto">
                  {cart.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      Keranjang kosong
                    </p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 rounded-lg border p-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Rp {item.price.toLocaleString()} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-7 w-7"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone" className="text-xs">Nomor Telepon Pelanggan (Opsional)</Label>
                    <Input
                      id="customerPhone"
                      placeholder="08123456789"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="h-8 text-sm"
                    />
                    {customer && (
                      <div className="p-2 bg-primary/10 rounded-md text-xs space-y-1">
                        <p className="font-semibold text-primary">✓ {customer.name}</p>
                        {loyaltySettings.enabled && (
                          <p className="flex items-center gap-1">
                            <Gift className="h-3 w-3" />
                            <span className="font-medium">{customer.points || 0} poin tersedia</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-xs">Nama Customer (Opsional)</Label>
                    <Input
                      id="customerName"
                      placeholder="Nama untuk order"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderNotes" className="text-xs">Catatan Order (Opsional)</Label>
                    <Input
                      id="orderNotes"
                      placeholder="Catatan khusus"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString()}</span>
                  </div>
                  {paymentSettings.showTaxSeparately && paymentSettings.taxRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Pajak ({paymentSettings.taxRate}%)</span>
                      <span>Rp {tax.toLocaleString()}</span>
                    </div>
                  )}
                  {paymentSettings.serviceCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Service Charge ({paymentSettings.serviceCharge}%)</span>
                      <span>Rp {serviceCharge.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {/* Loyalty Points Section */}
                  {loyaltySettings.enabled && customer && (customer.points || 0) >= loyaltySettings.minimumPointsRedeem && (
                    <>
                      <div className="border-t pt-2 pb-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="usePoints" 
                            checked={usePoints}
                            onCheckedChange={(checked) => {
                              setUsePoints(checked as boolean);
                              if (checked) {
                                // Auto-set maximum redeemable points
                                const maxRedeemable = Math.min(
                                  customer.points || 0,
                                  Math.floor((subtotal + tax + serviceCharge) / loyaltySettings.rupiahPerPoint)
                                );
                                setPointsToRedeem(maxRedeemable);
                              } else {
                                setPointsToRedeem(0);
                              }
                            }}
                          />
                          <Label htmlFor="usePoints" className="text-sm font-medium cursor-pointer">
                            Gunakan Poin Loyalty
                          </Label>
                        </div>
                        
                        {usePoints && (
                          <div className="space-y-2 pl-6">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={pointsToRedeem}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  const maxRedeemable = Math.min(
                                    customer.points || 0,
                                    Math.floor((subtotal + tax + serviceCharge) / loyaltySettings.rupiahPerPoint)
                                  );
                                  setPointsToRedeem(Math.min(val, maxRedeemable));
                                }}
                                className="h-8 text-sm w-24"
                                min={0}
                                max={Math.min(
                                  customer.points || 0,
                                  Math.floor((subtotal + tax + serviceCharge) / loyaltySettings.rupiahPerPoint)
                                )}
                              />
                              <span className="text-xs text-muted-foreground">
                                poin (max: {Math.min(
                                  customer.points || 0,
                                  Math.floor((subtotal + tax + serviceCharge) / loyaltySettings.rupiahPerPoint)
                                )})
                              </span>
                            </div>
                            <p className="text-xs text-primary font-medium">
                              Diskon: Rp {pointsDiscount.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Sisa poin: {((customer.points || 0) - pointsToRedeem).toLocaleString()} poin
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>Diskon Poin</span>
                      <span>- Rp {pointsDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">Rp {total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {editingOpenBillNumber ? (
                    // Tombol Save saat edit open bill
                    <>
                      <Button
                        className="w-full"
                        variant="default"
                        size="lg"
                        disabled={cart.length === 0}
                        onClick={handleSaveOpenBillChanges}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Simpan Perubahan Open Bill
                      </Button>
                      <Button
                        className="w-full"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCart([]);
                          setCustomerName("");
                          setOrderNotes("");
                          setEditingOpenBillNumber(null);
                        }}
                      >
                        Batal
                      </Button>
                    </>
                  ) : (
                    // Tombol Open Bill normal
                    <>
                      <Button
                        className="w-full"
                        variant="outline"
                        size="lg"
                        disabled={cart.length === 0}
                        onClick={handleOpenBill}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Open Bill (Cetak Dapur)
                      </Button>
                      
                      <div className="text-xs text-center text-muted-foreground font-medium">
                        atau bayar sekarang
                      </div>
                    </>
                  )}

                  {!editingOpenBillNumber && (
                    <Button 
                      className="w-full" 
                      size="lg" 
                      disabled={cart.length === 0}
                      onClick={() => setPaymentMethodDialogOpen(true)}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pilih Metode Pembayaran
                    </Button>
                  )}
                </div>
              </TabsContent>

              {/* Tab Open Bills */}
              <TabsContent value="openbills" className="space-y-2 mt-4">
                <div className="max-h-[500px] space-y-2 overflow-auto">
                  {openBills.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      Belum ada Open Bill
                    </p>
                  ) : (
                    openBills.map((bill, index) => (
                      <Collapsible key={bill.orderNumber} className="border rounded-lg">
                        <CollapsibleTrigger className="w-full p-3 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="text-left flex-1">
                              <p className="font-medium text-sm">{bill.customerName || `Order #${index + 1}`}</p>
                              <p className="text-xs text-muted-foreground">{bill.orderNumber}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(bill.date).toLocaleString('id-ID')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-primary">
                                Rp {bill.total.toLocaleString()}
                              </p>
                              <Badge variant="outline" className="mt-1">
                                {bill.items.length} item
                              </Badge>
                            </div>
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-3 pb-3 space-y-2">
                          <div className="border-t pt-2 space-y-1">
                            {bill.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span>{item.name} x{item.quantity}</span>
                                <span>Rp {(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          {bill.notes && (
                            <div className="text-xs bg-yellow-50 p-2 rounded border border-yellow-200">
                              <strong>Catatan:</strong> {bill.notes}
                            </div>
                          )}
                          <div className="grid grid-cols-3 gap-1 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLoadOpenBillToCart(bill.orderNumber)}
                              className="text-xs h-8"
                            >
                              Load
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedOpenBillForPayment(bill.orderNumber);
                                setOpenBillPaymentDialogOpen(true);
                              }}
                              className="text-xs h-8"
                            >
                              Bayar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteOpenBill(bill.orderNumber)}
                              className="text-xs h-8"
                            >
                              Hapus
                            </Button>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog for Cash */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pembayaran Tunai</DialogTitle>
            <DialogDescription>
              Masukkan jumlah uang yang diterima dari pelanggan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Total Pembayaran</Label>
              <Input
                value={`Rp ${(selectedOpenBillForPayment 
                  ? openBills.find(b => b.orderNumber === selectedOpenBillForPayment)?.total || 0
                  : total
                ).toLocaleString()}`}
                disabled
                className="text-lg font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Jumlah Uang Diterima</Label>
              <Input
                id="payment-amount"
                type="number"
                placeholder="Masukkan jumlah uang"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="text-lg"
              />
            </div>
            {paymentAmount && parseFloat(paymentAmount) >= (selectedOpenBillForPayment 
              ? openBills.find(b => b.orderNumber === selectedOpenBillForPayment)?.total || 0
              : total
            ) && (
              <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-900">Kembalian:</span>
                  <span className="text-lg font-bold text-green-600">
                    Rp {(parseFloat(paymentAmount) - (selectedOpenBillForPayment 
                      ? openBills.find(b => b.orderNumber === selectedOpenBillForPayment)?.total || 0
                      : total
                    )).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPaymentDialogOpen(false);
                setPaymentAmount("");
                setSelectedOpenBillForPayment(null);
              }}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={() => {
                const amount = parseFloat(paymentAmount);
                const requiredAmount = selectedOpenBillForPayment 
                  ? openBills.find(b => b.orderNumber === selectedOpenBillForPayment)?.total || 0
                  : total;
                
                if (amount >= requiredAmount) {
                  if (selectedOpenBillForPayment) {
                    // Proses pembayaran open bill
                    handlePayOpenBill(selectedOpenBillForPayment, 'cash');
                    setPaymentDialogOpen(false);
                    setPaymentAmount("");
                    setSelectedOpenBillForPayment(null);
                  } else {
                    // Proses pembayaran normal
                    processTransaction('cash', amount);
                  }
                } else {
                  toast({
                    title: "Jumlah Tidak Cukup",
                    description: "Jumlah uang harus lebih besar atau sama dengan total",
                    variant: "destructive",
                  });
                }
              }}
              disabled={!paymentAmount || parseFloat(paymentAmount) < (selectedOpenBillForPayment 
                ? openBills.find(b => b.orderNumber === selectedOpenBillForPayment)?.total || 0
                : total
              )}
              className="flex-1"
            >
              Proses Pembayaran
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QRIS Payment Dialog */}
      <Dialog open={qrisDialogOpen} onOpenChange={setQrisDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pembayaran QRIS</DialogTitle>
            <DialogDescription>
              Scan kode QR untuk melakukan pembayaran
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Total Pembayaran</Label>
              <div className="rounded-lg border p-3 bg-muted">
                <p className="text-2xl font-bold text-primary text-center">
                  Rp {qrisTransactionTotal.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kode QR</Label>
              <div className="flex justify-center items-center rounded-lg border-2 border-dashed p-6 bg-muted/50">
                {paymentSettings.qrisImageUrl ? (
                  <img 
                    src={paymentSettings.qrisImageUrl} 
                    alt="QRIS Code"
                    className="max-w-full max-h-[300px] object-contain"
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <Smartphone className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Kode QR belum diatur
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Silakan upload kode QRIS di Pengaturan
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
              <p className="text-xs text-blue-900">
                Pastikan pelanggan telah melakukan pembayaran sebelum mengkonfirmasi
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setQrisDialogOpen(false);
                setQrisTransactionTotal(0);
              }}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={() => {
                if (selectedOpenBillForPayment) {
                  // Proses pembayaran open bill dengan QRIS
                  handlePayOpenBill(selectedOpenBillForPayment, 'qris');
                  setQrisDialogOpen(false);
                  setSelectedOpenBillForPayment(null);
                } else {
                  // Proses pembayaran normal dengan QRIS
                  processTransaction('qris', qrisTransactionTotal);
                }
                setQrisTransactionTotal(0);
              }}
              className="flex-1"
            >
              Konfirmasi Pembayaran
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Struk Pembayaran</DialogTitle>
            <DialogDescription>
              Transaksi berhasil! Anda dapat mencetak struk atau menutup dialog ini.
            </DialogDescription>
          </DialogHeader>
          
          {lastTransaction && (
            <div className="space-y-4">
              <div className="max-h-[500px] overflow-auto border rounded-lg">
                <Receipt
                  ref={receiptRef}
                  transactionNumber={lastTransaction.transactionNumber}
                  date={lastTransaction.date}
                  items={lastTransaction.items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.price * item.quantity,
                  }))}
                  subtotal={lastTransaction.subtotal}
                  tax={lastTransaction.tax}
                  taxRate={lastTransaction.taxRate}
                  serviceCharge={lastTransaction.serviceCharge}
                  total={lastTransaction.total}
                  paymentMethod={lastTransaction.paymentMethod}
                  paymentAmount={lastTransaction.paymentAmount}
                  changeAmount={lastTransaction.changeAmount}
                  customerName={lastTransaction.customerName}
                  customerPoints={lastTransaction.customerPoints}
                  earnedPoints={lastTransaction.earnedPoints}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReceiptDialogOpen(false);
                    setCustomerPhone("");
                  }}
                  className="flex-1"
                >
                  Tutup
                </Button>
                <Button
                  onClick={handlePrint}
                  className="flex-1"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Cetak Struk
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Normal Payment Method Selection Dialog */}
      <Dialog open={paymentMethodDialogOpen} onOpenChange={setPaymentMethodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
            <DialogDescription>
              Pilih metode pembayaran untuk transaksi ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Informasi Pembayaran</Label>
              <div className="rounded-lg border p-3 bg-muted">
                <p className="text-sm">Customer: {customerName || '-'}</p>
                <p className="text-lg font-bold text-primary mt-2">
                  Total: Rp {total.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Metode Pembayaran</Label>
              <div className="grid grid-cols-1 gap-2">
                {paymentSettings.cashEnabled && (
                  <Button
                    variant="outline"
                    className="h-auto py-4 justify-start"
                    onClick={() => {
                      setPaymentMethodDialogOpen(false);
                      setSelectedPaymentMethod('cash');
                      setPaymentAmount("");
                      setPaymentDialogOpen(true);
                    }}
                  >
                    <Banknote className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Tunai / Cash</div>
                      <div className="text-xs text-muted-foreground">Pembayaran dengan uang tunai</div>
                    </div>
                  </Button>
                )}

                {paymentSettings.ewalletEnabled && (
                  <Button
                    variant="outline"
                    className="h-auto py-4 justify-start"
                    onClick={() => {
                      setPaymentMethodDialogOpen(false);
                      handlePayment('qris');
                    }}
                  >
                    <Smartphone className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">QRIS / E-Wallet</div>
                      <div className="text-xs text-muted-foreground">Pembayaran digital</div>
                    </div>
                  </Button>
                )}

                {paymentSettings.transferEnabled && (
                  <Button
                    variant="outline"
                    className="h-auto py-4 justify-start"
                    onClick={() => {
                      setPaymentMethodDialogOpen(false);
                      handlePayment('transfer');
                    }}
                  >
                    <CreditCard className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Transfer Bank</div>
                      <div className="text-xs text-muted-foreground">Transfer ke rekening</div>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPaymentMethodDialogOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Open Bill Payment Method Selection Dialog */}
      <Dialog open={openBillPaymentDialogOpen} onOpenChange={setOpenBillPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
            <DialogDescription>
              Pilih metode pembayaran untuk open bill ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedOpenBillForPayment && (() => {
              const bill = openBills.find(b => b.orderNumber === selectedOpenBillForPayment);
              if (!bill) return null;
              
              return (
                <>
                  <div className="space-y-2">
                    <Label>Informasi Order</Label>
                    <div className="rounded-lg border p-3 bg-muted">
                      <p className="text-sm font-medium">Order: {bill.orderNumber}</p>
                      <p className="text-sm">Customer: {bill.customerName || '-'}</p>
                      <p className="text-lg font-bold text-primary mt-2">
                        Total: Rp {bill.total.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Metode Pembayaran</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {paymentSettings.cashEnabled && (
                        <Button
                          variant="outline"
                          className="h-auto py-4 justify-start"
                          onClick={() => {
                            setOpenBillPaymentDialogOpen(false);
                            setSelectedPaymentMethod('cash');
                            setPaymentAmount("");
                            setPaymentDialogOpen(true);
                          }}
                        >
                          <Banknote className="mr-3 h-5 w-5" />
                          <div className="text-left">
                            <div className="font-semibold">Tunai / Cash</div>
                            <div className="text-xs text-muted-foreground">Pembayaran dengan uang tunai</div>
                          </div>
                        </Button>
                      )}

                      {paymentSettings.ewalletEnabled && (
                        <Button
                          variant="outline"
                          className="h-auto py-4 justify-start"
                          onClick={() => {
                            const bill = openBills.find(b => b.orderNumber === selectedOpenBillForPayment);
                            if (bill) {
                              setQrisTransactionTotal(bill.total);
                              setQrisDialogOpen(true);
                              setOpenBillPaymentDialogOpen(false);
                            }
                          }}
                        >
                          <Smartphone className="mr-3 h-5 w-5" />
                          <div className="text-left">
                            <div className="font-semibold">QRIS / E-Wallet</div>
                            <div className="text-xs text-muted-foreground">Pembayaran digital</div>
                          </div>
                        </Button>
                      )}

                      {paymentSettings.transferEnabled && (
                        <Button
                          variant="outline"
                          className="h-auto py-4 justify-start"
                          onClick={() => {
                            handlePayOpenBill(selectedOpenBillForPayment, 'transfer');
                            setOpenBillPaymentDialogOpen(false);
                            setSelectedOpenBillForPayment(null);
                          }}
                        >
                          <CreditCard className="mr-3 h-5 w-5" />
                          <div className="text-left">
                            <div className="font-semibold">Transfer Bank</div>
                            <div className="text-xs text-muted-foreground">Transfer ke rekening</div>
                          </div>
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpenBillPaymentDialogOpen(false);
                setSelectedOpenBillForPayment(null);
              }}
              className="flex-1"
            >
              Batal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Kitchen Receipt Dialog */}
      <Dialog open={kitchenReceiptDialogOpen} onOpenChange={setKitchenReceiptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Struk Dapur - Open Bill</DialogTitle>
            <DialogDescription>
              Order telah disimpan. Cetak struk untuk dapur atau tutup dialog ini.
            </DialogDescription>
          </DialogHeader>
          
          {lastOpenBill && (
            <div className="space-y-4">
              <div className="max-h-[500px] overflow-auto border rounded-lg">
                <KitchenReceipt
                  ref={kitchenReceiptRef}
                  orderNumber={lastOpenBill.orderNumber}
                  date={lastOpenBill.date}
                  items={lastOpenBill.items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                  }))}
                  customerName={lastOpenBill.customerName}
                  notes={lastOpenBill.notes}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-800">
                  ⚠️ Catatan: Order ini belum dibayar
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Simpan nomor order <strong>{lastOpenBill.orderNumber}</strong> untuk pembayaran nanti
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCloseOpenBill}
                  className="flex-1"
                >
                  Tutup
                </Button>
                <Button
                  onClick={handlePrintKitchen}
                  className="flex-1"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Cetak Struk Dapur
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Package({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
