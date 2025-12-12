import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Loader2, Printer, FileText, ChevronDown, ChevronUp, Gift, Tag, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { useProducts } from "@/hooks/supabase/useProducts";
import { useCategories } from "@/hooks/supabase/useCategories";
import { useProductVariants } from "@/hooks/supabase/useProductVariants";
import { useCreateTransaction, generateTransactionNumber } from "@/hooks/supabase/useTransactions";
import { useSearchCustomer, useUpdateCustomerPoints, useCreateCustomer } from "@/hooks/supabase/useCustomers";
import { usePromotions, calculatePromotionDiscount, type Promotion } from "@/hooks/supabase/usePromotions";
import { toast } from "@/hooks/use-toast";
import { Receipt } from "@/components/Receipt";
import { PrintDialog } from "@/components/PrintDialog";
import { VariantSelector } from "@/components/VariantSelector";
import { useReactToPrint } from "react-to-print";
import { useBluetoothPrinter } from "@/hooks/useBluetoothPrinter";
import { generateCashierReceipt } from "@/lib/receiptFormatter";
import { generateThermalReceipt } from "@/lib/formatters/thermalReceiptConverter";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  variantId?: string;
  variantName?: string;
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
  const [newCustomerId, setNewCustomerId] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [openBillConfirmDialogOpen, setOpenBillConfirmDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'qris' | 'transfer'>('cash');
  const [paymentAmount, setPaymentAmount] = useState("");
  const [openBillPaymentDialogOpen, setOpenBillPaymentDialogOpen] = useState(false);
  const [selectedOpenBillForPayment, setSelectedOpenBillForPayment] = useState<string | null>(null);
  const [paymentMethodDialogOpen, setPaymentMethodDialogOpen] = useState(false);
  const [qrisDialogOpen, setQrisDialogOpen] = useState(false);
  const [qrisTransactionTotal, setQrisTransactionTotal] = useState(0);
  
  // Variant selector state
  const [variantSelectorOpen, setVariantSelectorOpen] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<any>(null);
  
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
  
  // Promotion states
  const [promotionCode, setPromotionCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);
  const [promotionDiscount, setPromotionDiscount] = useState(0);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  
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
    subtotal?: number;
    tax?: number;
    total?: number;
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
    promotionDiscount?: number;
    appliedPromotion?: {
      id: string;
      code: string;
      type: 'percentage' | 'fixed';
      value: number;
    };
  }>>([]);

  // State untuk track open bill yang sedang diedit
  const [editingOpenBillNumber, setEditingOpenBillNumber] = useState<string | null>(null);

  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  });

  // Bluetooth printer hook
  const { isConnected, printReceipt } = useBluetoothPrinter();

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: customer } = useSearchCustomer(customerPhone);
  const { data: productVariants = [] } = useProductVariants(selectedProductForVariant?.id || "");
  const { data: promotions = [], isLoading: isLoadingPromotions } = usePromotions();
  const createTransaction = useCreateTransaction();
  const updateCustomerPoints = useUpdateCustomerPoints();
  const createCustomer = useCreateCustomer();

  // Debug promotions data
  useEffect(() => {
    console.log('🎟️ Promotions Data:', {
      count: promotions.length,
      isLoading: isLoadingPromotions,
      data: promotions,
    });
  }, [promotions, isLoadingPromotions]);

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
    // Check if product has variants
    if (product.has_variants) {
      setSelectedProductForVariant(product);
      setVariantSelectorOpen(true);
      return;
    }

    // No variants - add directly to cart
    const existingItem = cart.find((item) => item.id === product.id && !item.variantId);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id && !item.variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
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

  const addVariantToCart = (variant: any) => {
    const product = selectedProductForVariant;
    if (!product) return;

    // Create unique ID for cart item with variant
    const cartItemId = `${product.id}-${variant.id}`;
    const existingItem = cart.find((item) => 
      item.id === product.id && item.variantId === variant.id
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id && item.variantId === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, {
        id: product.id,
        name: `${product.name} (${variant.name})`,
        price: Number(variant.price),
        quantity: 1,
        category: product.categories?.name || 'Lainnya',
        variantId: variant.id,
        variantName: variant.name,
      }]);
    }
  };

  const updateQuantity = (id: string, change: number, variantId?: string) => {
    setCart(
      cart
        .map((item) => {
          // Match by id and variantId (if exists)
          const isMatch = item.id === id && 
            (variantId ? item.variantId === variantId : !item.variantId);
          
          return isMatch
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Promotion handlers
  const applyPromotion = (promo: Promotion) => {
    const result = calculatePromotionDiscount(promo, subtotal, cart);
    
    if (!result.isValid) {
      toast({
        title: "Promosi Tidak Valid",
        description: result.error,
        variant: "destructive",
      });
      return;
    }
    
    setAppliedPromotion(promo);
    setPromotionDiscount(result.discount);
    setShowPromotionDialog(false);
    setPromotionCode("");
    
    toast({
      title: "Promosi Diterapkan!",
      description: `${promo.name} - Hemat Rp${result.discount.toLocaleString('id-ID')}`,
    });
  };
  
  const removePromotion = () => {
    setAppliedPromotion(null);
    setPromotionDiscount(0);
    setPromotionCode("");
    
    toast({
      title: "Promosi Dihapus",
      description: "Promosi telah dihapus dari transaksi",
    });
  };
  
  const applyPromotionByCode = () => {
    const promo = promotions.find(p => p.code.toUpperCase() === promotionCode.toUpperCase());
    
    if (!promo) {
      toast({
        title: "Kode Tidak Valid",
        description: "Kode promosi tidak ditemukan atau sudah tidak berlaku",
        variant: "destructive",
      });
      return;
    }
    
    applyPromotion(promo);
  };

  const removeFromCart = (id: string, variantId?: string) => {
    setCart(cart.filter((item) => {
      // For products with variant: match by id AND variantId
      // For products without variant: match by id only (both should be null/undefined)
      if (variantId) {
        // Removing variant item: both id and variantId must match
        return !(item.id === id && item.variantId === variantId);
      } else {
        // Removing non-variant item: id must match AND variantId should be null/undefined
        return !(item.id === id && !item.variantId);
      }
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = paymentSettings.showTaxSeparately ? (subtotal * paymentSettings.taxRate / 100) : 0;
  const serviceCharge = subtotal * paymentSettings.serviceCharge / 100;
  
  // Calculate promotion discount
  const promotionResult = appliedPromotion 
    ? calculatePromotionDiscount(appliedPromotion, subtotal, cart)
    : { discount: 0, isValid: false };
  
  const validPromotionDiscount = promotionResult.isValid ? promotionResult.discount : 0;
  
  // Calculate points discount
  const pointsDiscount = usePoints && customer ? Math.min(
    pointsToRedeem * loyaltySettings.rupiahPerPoint,
    subtotal + tax + serviceCharge - validPromotionDiscount
  ) : 0;
  
  const total = subtotal + tax + serviceCharge - validPromotionDiscount - pointsDiscount;

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
      console.log('=== PROCESS TRANSACTION DEBUG ===');
      console.log('Cart:', cart);
      console.log('Subtotal:', subtotal);
      console.log('Tax:', tax);
      console.log('Total:', total);
      console.log('Paid Amount:', paidAmount);
      
      const transactionNumber = generateTransactionNumber();
      const paymentAmountNum = paidAmount || total;
      const changeAmount = method === 'cash' ? Math.max(0, paymentAmountNum - total) : 0;

      console.log('Payment Amount Num:', paymentAmountNum);
      console.log('Change Amount:', changeAmount);

      // Determine customer ID (existing customer or newly created)
      const customerId = customer?.id || newCustomerId || null;

      // Calculate earned points only if loyalty enabled and meets minimum purchase
      const earnedPoints = loyaltySettings.enabled && subtotal >= loyaltySettings.minimumPurchaseEarn 
        ? Math.floor(subtotal / loyaltySettings.pointsPerRupiah)
        : 0;

      // Calculate redeemed points
      const redeemedPoints = usePoints && customer ? pointsToRedeem : 0;

      await createTransaction.mutateAsync({
        transaction: {
          transaction_number: transactionNumber,
          customer_id: customerId,
          cashier_id: null, // TODO: Get from auth
          subtotal,
          discount: pointsDiscount,
          tax,
          total,
          payment_method: method,
          payment_amount: paymentAmountNum,
          change_amount: changeAmount,
          promotion_id: appliedPromotion?.id || null,
          promotion_code: appliedPromotion?.code || null,
          promotion_discount: validPromotionDiscount,
          status: 'completed',
          notes: null,
        },
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
          variant_id: item.variantId || null,
          variant_name: item.variantName || null,
        })),
      });

      // Update customer points if customer selected (existing or newly created)
      let updatedCustomerPoints = customer?.points || 0;
      if (customerId) {
        // New points = current points - redeemed + earned
        const currentPoints = customer?.points || 0;
        const newPoints = currentPoints - redeemedPoints + earnedPoints;
        const newTotalPurchases = (customer?.total_purchases || 0) + total;
        updatedCustomerPoints = newPoints;

        await updateCustomerPoints.mutateAsync({
          id: customerId,
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
      setNewCustomerId(null);
      setUsePoints(false);
      setPointsToRedeem(0);
      setAppliedPromotion(null);
      setPromotionDiscount(0);
      setPromotionCode("");

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
    const preTotalBeforePromo = billSubtotal + billTax + billServiceCharge;
    const billTotal = preTotalBeforePromo - (promotionDiscount || 0);
    
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
      promotionDiscount: promotionDiscount || undefined,
      appliedPromotion: appliedPromotion || undefined,
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
      subtotal: billSubtotal,
      tax: billTax,
      total: billTotal,
      promotionDiscount: promotionDiscount || undefined,
      appliedPromotion: appliedPromotion || undefined,
    });

    // Show confirmation dialog for open bill
    setOpenBillConfirmDialogOpen(true);

    toast({
      title: "Open Bill Dibuat!",
      description: `No. Order: ${orderNumber}`,
    });
  };

  const handleCloseOpenBillConfirm = () => {
    // Close confirmation and reset form
    setOpenBillConfirmDialogOpen(false);
    setCart([]);
    setCustomerName("");
    setOrderNotes("");
    setAppliedPromotion(null);
    setPromotionDiscount(0);
  };

  const handlePrintOpenBill = () => {
    // Open print dialog
    setOpenBillConfirmDialogOpen(false);
    setPrintDialogOpen(true);
  };

  const handleBluetoothPrint = async () => {
    if (!lastTransaction) return;

    // If already connected, print directly
    if (isConnected) {
      try {
        // Use Thermal Receipt for better formatting
        const thermalReceiptData = {
          transactionNumber: lastTransaction.transactionNumber,
          date: new Date(lastTransaction.date),
          items: lastTransaction.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
            variant: item.variantName,
          })),
          subtotal: lastTransaction.subtotal,
          tax: lastTransaction.tax || 0,
          total: lastTransaction.total,
          paymentMethod: lastTransaction.paymentMethod,
          paymentAmount: lastTransaction.paymentAmount || lastTransaction.total,
          changeAmount: lastTransaction.changeAmount || 0,
          customerName: lastTransaction.customerName,
          earnedPoints: lastTransaction.earnedPoints,
          totalPoints: lastTransaction.totalPoints,
          paperWidth: '58mm' as const, // Optimized for Xiaomi Redmi Pad SE
          storeName: 'BK POS',
          cashierName: localStorage.getItem('username') || 'Kasir',
        };
        const receipt = generateThermalReceipt(thermalReceiptData);
        await printReceipt(receipt);
        
        toast({
          title: "Struk Dicetak!",
          description: "Struk kasir berhasil dicetak via Bluetooth",
        });
        
        setReceiptDialogOpen(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal mencetak struk",
          variant: "destructive",
        });
      }
    } else {
      // Not connected, open dialog for connection
      setReceiptDialogOpen(false);
      setPrintDialogOpen(true);
    }
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
    
    // Restore promotion jika ada
    if (bill.appliedPromotion && bill.promotionDiscount) {
      setAppliedPromotion(bill.appliedPromotion);
      setPromotionDiscount(bill.promotionDiscount);
    } else {
      setAppliedPromotion(null);
      setPromotionDiscount(0);
    }
    
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
    const preTotalBeforePromo = billSubtotal + billTax + billServiceCharge;
    const billTotal = preTotalBeforePromo - (promotionDiscount || 0);

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
            promotionDiscount: promotionDiscount || undefined,
            appliedPromotion: appliedPromotion || undefined,
          }
        : bill
    ));

    // Reset state
    setCart([]);
    setCustomerName("");
    setOrderNotes("");
    setEditingOpenBillNumber(null);
    setAppliedPromotion(null);
    setPromotionDiscount(0);

    toast({
      title: "Open Bill Diupdate!",
      description: `Order ${editingOpenBillNumber} telah disimpan`,
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full min-h-screen">
      <div className="flex-1 space-y-4 min-w-0">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Produk</CardTitle>
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
          <CardContent className="pb-3">
            <Tabs defaultValue="all">
              <TabsList className="mb-3 grid grid-cols-3 md:grid-cols-4">
                <TabsTrigger value="all" className="text-xs">Semua</TabsTrigger>
                {categories.slice(0, 3).map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id} className="text-xs truncate">
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="all" className="space-y-0">
                <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="cursor-pointer transition-all hover:shadow-md"
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-3">
                        <div className="aspect-square mb-2 flex items-center justify-center rounded-lg bg-muted">
                          <Package className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-xs line-clamp-2">{product.name}</h3>
                        <div className="flex items-center justify-between mt-1.5 gap-1">
                          <p className="text-xs font-semibold text-primary">
                            Rp {product.price.toLocaleString()}
                          </p>
                          <Badge variant="secondary" className="text-[10px] h-4 px-1 whitespace-nowrap">{product.categories?.name || 'Lainnya'}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              {categories.map((cat) => (
                <TabsContent key={cat.id} value={cat.id} className="space-y-0">
                  <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
                    {filteredProducts
                      .filter((p) => p.category_id === cat.id)
                      .map((product) => (
                        <Card
                          key={product.id}
                          className="cursor-pointer transition-all hover:shadow-md"
                          onClick={() => addToCart(product)}
                        >
                          <CardContent className="p-3">
                            <div className="aspect-square mb-2 flex items-center justify-center rounded-lg bg-muted">
                              <Package className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="font-medium text-xs line-clamp-2">{product.name}</h3>
                            <p className="text-xs font-semibold text-primary mt-1.5">
                              Rp {product.price.toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="w-full md:w-[300px] xl:w-[340px] flex-shrink-0">
        <Card className="md:sticky md:top-4 flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-base">Keranjang & Open Bills</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <Tabs defaultValue="cart" className="w-full flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                <TabsTrigger value="cart" className="text-sm">
                  Keranjang
                  {cart.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 text-xs h-5 px-1.5">{cart.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="openbills" className="text-sm">
                  Open Bills
                  {openBills.length > 0 && (
                    <Badge variant="destructive" className="ml-1.5 text-xs h-5 px-1.5">{openBills.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Tab Keranjang */}
              <TabsContent value="cart" className="flex-1 flex flex-col mt-3 min-h-0">
                <div className="flex-1 space-y-3">
                  {/* Cart items list */}
                  <div className="space-y-2">
                    {cart.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        Keranjang kosong
                      </p>
                    ) : (
                      cart.map((item) => (
                      <div key={`${item.id}-${item.variantId || 'no-variant'}`} className="flex items-center gap-2 rounded-lg border p-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Rp {item.price.toLocaleString()} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, -1, item.variantId)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, 1, item.variantId)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-7 w-7 ml-0.5"
                            onClick={() => removeFromCart(item.id, item.variantId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                  </div>

                  {/* Customer info section */}
                  <div className="space-y-2 border-t pt-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="customerPhone" className="text-sm">Nomor Telepon Pelanggan (Opsional)</Label>
                    <Input
                      id="customerPhone"
                      placeholder="08123456789"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        setNewCustomerId(null); // Reset when phone changes
                      }}
                      className="h-9 text-sm"
                    />
                    {customer && (
                      <div className="p-2 bg-primary/10 rounded-md text-xs space-y-0.5">
                        <p className="font-semibold text-primary">✓ {customer.name}</p>
                        {loyaltySettings.enabled && (
                          <p className="flex items-center gap-1">
                            <Gift className="h-3 w-3" />
                            <span className="font-medium">{customer.points || 0} poin</span>
                          </p>
                        )}
                      </div>
                    )}
                    {!customer && customerPhone && customerPhone.length >= 10 && (
                      <div className="p-2 bg-orange-50 border border-orange-200 rounded-md text-xs space-y-1.5">
                        <p className="text-orange-700">
                          ⚠️ Nomor belum terdaftar
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-7 text-xs"
                          onClick={async () => {
                            if (!customerName) {
                              toast({
                                title: "Nama Diperlukan",
                                description: "Mohon isi Nama Customer terlebih dahulu",
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            createCustomer.mutate({
                              name: customerName,
                              phone: customerPhone,
                              email: null,
                              address: null,
                              notes: null,
                              points: 0,
                              tier: 'bronze',
                              total_purchases: 0,
                              last_purchase_date: null,
                            }, {
                              onSuccess: (data) => {
                                setNewCustomerId(data.id);
                                toast({
                                  title: "Berhasil!",
                                  description: `Customer ${customerName} berhasil didaftarkan`,
                                });
                              },
                              onError: () => {
                                toast({
                                  title: "Error",
                                  description: "Gagal mendaftarkan customer",
                                  variant: "destructive",
                                });
                              }
                            });
                          }}
                          disabled={createCustomer.isPending}
                        >
                          {createCustomer.isPending ? "Mendaftar..." : "Daftar Baru"}
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="customerName" className="text-sm">Nama Customer (Opsional)</Label>
                    <Input
                      id="customerName"
                      placeholder="Nama untuk order"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="orderNotes" className="text-sm">Catatan Order (Opsional)</Label>
                    <Input
                      id="orderNotes"
                      placeholder="Catatan khusus"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2 border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-medium">Rp {subtotal.toLocaleString()}</span>
                  </div>
                  {paymentSettings.showTaxSeparately && paymentSettings.taxRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Pajak ({paymentSettings.taxRate}%)</span>
                      <span className="font-medium">Rp {tax.toLocaleString()}</span>
                    </div>
                  )}
                  {paymentSettings.serviceCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Service ({paymentSettings.serviceCharge}%)</span>
                      <span className="font-medium">Rp {serviceCharge.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {/* Loyalty Points Section */}
                  {loyaltySettings.enabled && customer && (customer.points || 0) >= loyaltySettings.minimumPointsRedeem && (
                    <>
                      <div className="border-t pt-2 pb-1.5 space-y-2">
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
                            Gunakan Poin
                          </Label>
                        </div>
                        
                        {usePoints && (
                          <div className="space-y-1.5 pl-6">
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
                                className="h-8 text-xs w-20"
                                min={0}
                                max={Math.min(
                                  customer.points || 0,
                                  Math.floor((subtotal + tax + serviceCharge) / loyaltySettings.rupiahPerPoint)
                                )}
                              />
                              <span className="text-xs text-muted-foreground">
                                max: {Math.min(
                                  customer.points || 0,
                                  Math.floor((subtotal + tax + serviceCharge) / loyaltySettings.rupiahPerPoint)
                                )}
                              </span>
                            </div>
                            <p className="text-xs text-primary font-medium">
                              Diskon: Rp {pointsDiscount.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Sisa: {((customer.points || 0) - pointsToRedeem).toLocaleString()} poin
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>Diskon Poin</span>
                      <span className="font-medium">- Rp {pointsDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {/* Promotion Section */}
                  <div className="border-t pt-2 space-y-2">
                    {appliedPromotion ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="text-sm font-medium text-green-900">{appliedPromotion.name}</div>
                              <div className="text-xs text-green-600">Kode: {appliedPromotion.code}</div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removePromotion}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex justify-between text-sm text-green-600 font-medium">
                          <span>Diskon Promosi</span>
                          <span>- Rp {validPromotionDiscount.toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPromotionDialog(true)}
                        className="w-full h-9 gap-2"
                        disabled={cart.length === 0}
                      >
                        <Tag className="h-4 w-4" />
                        Gunakan Promosi
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold pt-1.5 border-t">
                    <span>Total</span>
                    <span className="text-primary">Rp {total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2 flex-shrink-0 mt-auto pt-3 border-t">
                  {editingOpenBillNumber ? (
                    // Tombol Save saat edit open bill
                    <>
                      <Button
                        className="w-full h-10 text-sm"
                        variant="default"
                        disabled={cart.length === 0}
                        onClick={handleSaveOpenBillChanges}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Simpan Perubahan
                      </Button>
                      <Button
                        className="w-full h-8 text-sm"
                        variant="outline"
                        onClick={() => {
                          setCart([]);
                          setCustomerName("");
                          setOrderNotes("");
                          setEditingOpenBillNumber(null);
                          setAppliedPromotion(null);
                          setPromotionDiscount(0);
                        }}
                      >
                        Batal
                      </Button>
                    </>
                  ) : (
                    // Tombol Open Bill normal
                    <>
                      <Button
                        className="w-full h-10 text-sm"
                        variant="outline"
                        disabled={cart.length === 0}
                        onClick={handleOpenBill}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Open Bill
                      </Button>
                      
                      <div className="text-xs text-center text-muted-foreground font-medium py-0.5">
                        atau bayar sekarang
                      </div>
                    </>
                  )}

                  {!editingOpenBillNumber && (
                    <Button 
                      className="w-full h-11 text-sm font-semibold" 
                      disabled={cart.length === 0}
                      onClick={() => setPaymentMethodDialogOpen(true)}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pilih Pembayaran
                    </Button>
                  )}
                </div>
                </div>
              </TabsContent>

              {/* Tab Open Bills */}
              <TabsContent value="openbills" className="flex-1 flex flex-col mt-3 min-h-0">
                <div className="flex-1 space-y-2">
                  {openBills.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      Belum ada Open Bill
                    </p>
                  ) : (
                    openBills.map((bill, index) => (
                      <Collapsible key={bill.orderNumber} className="border rounded-lg">
                        <CollapsibleTrigger className="w-full p-2.5 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-left flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{bill.customerName || `Order #${index + 1}`}</p>
                              <p className="text-xs text-muted-foreground truncate">{bill.orderNumber}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(bill.date).toLocaleString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-sm text-primary">
                                Rp {bill.total.toLocaleString()}
                              </p>
                              <Badge variant="outline" className="mt-0.5 text-xs h-5">
                                {bill.items.length} item
                              </Badge>
                            </div>
                            <ChevronDown className="h-4 w-4 flex-shrink-0" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-2.5 pb-2.5 space-y-2">
                          <div className="border-t pt-2 space-y-1">
                            {bill.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="truncate mr-2">{item.name} x{item.quantity}</span>
                                <span className="flex-shrink-0 font-medium">Rp {(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          {bill.notes && (
                            <div className="text-xs bg-yellow-50 p-2 rounded border border-yellow-200">
                              <strong>Catatan:</strong> {bill.notes}
                            </div>
                          )}
                          <div className="grid grid-cols-3 gap-1.5 pt-2">
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
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none">Rp</span>
                <Input
                  id="payment-amount"
                  type="text"
                  inputMode="numeric"
                  placeholder="Masukkan jumlah uang"
                  value={paymentAmount ? Number(paymentAmount.replace(/\D/g, "")).toLocaleString("id-ID") : ""}
                  onChange={e => {
                    // Only allow numbers, remove non-digit
                    const raw = e.target.value.replace(/\D/g, "");
                    setPaymentAmount(raw);
                  }}
                  className="text-lg pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {[10000, 20000, 50000, 100000].map((denom) => {
                  const isActive = paymentAmount && Number(paymentAmount) === denom;
                  return (
                    <Button
                      key={denom}
                      type="button"
                      variant={isActive ? "default" : "secondary"}
                      className={`px-3 py-1 text-xs font-semibold border ${isActive ? "border-primary ring-2 ring-primary/60" : "border-muted"}`}
                      onClick={() => setPaymentAmount(String(denom))}
                    >
                      Rp {denom.toLocaleString()}
                    </Button>
                  );
                })}
                {(() => {
                  const uangPas = String(selectedOpenBillForPayment
                    ? openBills.find(b => b.orderNumber === selectedOpenBillForPayment)?.total || 0
                    : total
                  );
                  const isActive = paymentAmount && Number(paymentAmount) === Number(uangPas);
                  return (
                    <Button
                      type="button"
                      variant={isActive ? "default" : "secondary"}
                      className={`px-3 py-1 text-xs font-semibold border ${isActive ? "border-primary ring-2 ring-primary/60" : "border-muted"}`}
                      onClick={() => setPaymentAmount(uangPas)}
                    >
                      Uang Pas
                    </Button>
                  );
                })()}
              </div>
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
                  variant="outline"
                  onClick={handlePrint}
                  className="flex-1"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print PDF
                </Button>
                <Button
                  onClick={handleBluetoothPrint}
                  className="flex-1"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  {isConnected ? 'Print Bluetooth' : 'Koneksi & Print'}
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

      {/* Open Bill Confirmation Dialog */}
      <Dialog open={openBillConfirmDialogOpen && !!lastOpenBill} onOpenChange={setOpenBillConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Open Bill Berhasil Dibuat!</DialogTitle>
            <DialogDescription>
              Order telah disimpan dan siap dikirim ke dapur.
            </DialogDescription>
          </DialogHeader>

          {lastOpenBill && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800">
                  ✓ Order #{lastOpenBill.orderNumber}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {lastOpenBill.items.length} item - {lastOpenBill.customerName || 'Tanpa nama'}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-800">
                  💡 Tips: Cetak struk dapur untuk kitchen
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Agar tidak salah orderan, cetak struk untuk dikirim ke dapur
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCloseOpenBillConfirm}
                  className="flex-1"
                >
                  Tutup & Order Baru
                </Button>
                <Button
                  onClick={handlePrintOpenBill}
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

      {/* Variant Selector Dialog */}
      <VariantSelector
        open={variantSelectorOpen}
        onClose={() => {
          setVariantSelectorOpen(false);
          setSelectedProductForVariant(null);
        }}
        productName={selectedProductForVariant?.name || ""}
        variants={productVariants}
        onSelect={addVariantToCart}
      />

      {/* Print Dialog for Bluetooth Printer */}
      <PrintDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        receiptData={lastTransaction ? {
          orderNumber: lastTransaction.transactionNumber,
          items: lastTransaction.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            variant: item.variantName || undefined,
          })),
          subtotal: lastTransaction.subtotal,
          tax: lastTransaction.tax,
          total: lastTransaction.total,
          paymentMethod: lastTransaction.paymentMethod,
          paymentAmount: lastTransaction.paymentAmount,
          changeAmount: lastTransaction.changeAmount,
          customerName: lastTransaction.customerName,
          date: lastTransaction.date,
        } : lastOpenBill ? {
          orderNumber: lastOpenBill.orderNumber,
          items: lastOpenBill.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            variant: item.variantName || undefined,
          })),
          subtotal: lastOpenBill.subtotal || 0,
          tax: lastOpenBill.tax || 0,
          total: lastOpenBill.total || 0,
          paymentMethod: 'Open Bill',
          customerName: lastOpenBill.customerName,
          date: lastOpenBill.date,
        } : undefined}
      />
      
      {/* Promotion Dialog */}
      <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pilih Promosi</DialogTitle>
            <DialogDescription>
              Masukkan kode promosi atau pilih dari daftar promosi yang tersedia
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Enter Promo Code */}
            <div className="space-y-2">
              <Label htmlFor="promo-code">Kode Promosi</Label>
              <div className="flex gap-2">
                <Input
                  id="promo-code"
                  value={promotionCode}
                  onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode promosi"
                  className="uppercase"
                />
                <Button 
                  onClick={applyPromotionByCode}
                  disabled={!promotionCode}
                >
                  Terapkan
                </Button>
              </div>
            </div>
            
            {/* Available Promotions */}
            {promotions.length > 0 && (
              <div className="space-y-2">
                <Label>Promosi Tersedia</Label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {promotions.map((promo) => {
                    const result = calculatePromotionDiscount(promo, subtotal, cart);
                    const isValid = result.isValid;
                    
                    return (
                      <div
                        key={promo.id}
                        className={`p-3 border rounded-lg ${
                          isValid ? 'border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer' : 'border-gray-200 bg-gray-50 opacity-60'
                        }`}
                        onClick={() => isValid && applyPromotion(promo)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={isValid ? "default" : "secondary"} className="text-xs">
                                {promo.code}
                              </Badge>
                              {promo.type === 'percentage' && (
                                <span className="text-xs font-medium text-green-600">
                                  {promo.value}% OFF
                                </span>
                              )}
                              {promo.type === 'fixed' && (
                                <span className="text-xs font-medium text-green-600">
                                  Rp{promo.value.toLocaleString('id-ID')} OFF
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-medium">{promo.name}</div>
                            {promo.description && (
                              <div className="text-xs text-muted-foreground">{promo.description}</div>
                            )}
                            {promo.min_purchase > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Min. pembelian: Rp{promo.min_purchase.toLocaleString('id-ID')}
                              </div>
                            )}
                            {isValid && result.discount > 0 && (
                              <div className="text-xs font-medium text-green-600">
                                Hemat: Rp{result.discount.toLocaleString('id-ID')}
                              </div>
                            )}
                            {!isValid && result.error && (
                              <div className="text-xs text-red-600">{result.error}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {promotions.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Tidak ada promosi yang tersedia saat ini
              </div>
            )}
          </div>
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
