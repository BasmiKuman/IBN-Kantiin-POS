import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { bluetoothPrinterService, BluetoothPrinter } from "@/lib/bluetoothPrinter";
import { Bluetooth, Printer, RefreshCw } from "lucide-react";

interface GeneralSettings {
  businessName: string;
  currency: string;
  timezone: string;
  language: string;
  darkMode?: boolean;
  soundEnabled?: boolean;
}

interface StoreSettings {
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  phone: string;
  email: string;
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

interface ReceiptSettings {
  header: string;
  tagline: string;
  footer: string;
  showLogo: boolean;
  showCashierDetails: boolean;
}

interface NotificationSettings {
  dailyReport: boolean;
  lowStock: boolean;
  largeTransaction: boolean;
  whatsappNumber: string;
  whatsappEnabled: boolean;
}

interface LoyaltySettings {
  enabled: boolean;
  pointsPerRupiah: number;
  rupiahPerPoint: number;
  minimumPointsRedeem: number;
  minimumPurchaseEarn: number;
}

interface PrinterSettings {
  autoPrint: boolean;
  bluetoothEnabled: boolean;
  connectedPrinter: string | null;
}

export default function Settings() {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    businessName: "BasmiKuman POS",
    currency: "IDR",
    timezone: "Asia/Jakarta",
    language: "id",
  });

    const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: "Toko Pusat",
    address: "Jl. Contoh No. 123",
    city: "Jakarta",
    phone: "(021) 12345678",
    email: "info@basmikuman.com",
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    cashEnabled: true,
    cardEnabled: false,
    ewalletEnabled: true,
    transferEnabled: true,
    taxRate: 10,
    serviceCharge: 0,
    showTaxSeparately: true,
    qrisImageUrl: undefined,
  });

  const [qrisImagePreview, setQrisImagePreview] = useState<string | null>(null);

  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>({
    header: "BASMIKUMAN POS",
    tagline: "Makanan Enak, Harga Terjangkau",
    footer: "Terima kasih atas kunjungan Anda!",
    showLogo: true,
    showCashierDetails: true,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    dailyReport: true,
    lowStock: true,
    largeTransaction: true,
    whatsappNumber: "08123456789",
    whatsappEnabled: false,
  });

  const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings>({
    enabled: false,
    pointsPerRupiah: 1000, // 1 point per 1000 rupiah
    rupiahPerPoint: 1000, // 1 point = 1000 rupiah when redeemed
    minimumPointsRedeem: 10,
    minimumPurchaseEarn: 10000, // minimum purchase to earn points
  });

  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>({
    autoPrint: false,
    bluetoothEnabled: false,
    connectedPrinter: null,
  });

  const [availablePrinters, setAvailablePrinters] = useState<BluetoothPrinter[]>([]);
  const [scanningPrinters, setScanningPrinters] = useState(false);
  const [testingPrint, setTestingPrint] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      const savedGeneral = localStorage.getItem("settings_general");
      const savedStore = localStorage.getItem("settings_store");
      const savedPayment = localStorage.getItem("settings_payment");
      const savedReceipt = localStorage.getItem("settings_receipt");
      const savedNotification = localStorage.getItem("settings_notification");
      const savedLoyalty = localStorage.getItem("settings_loyalty");
      const savedPrinter = localStorage.getItem("settings_printer");

      if (savedGeneral) setGeneralSettings(JSON.parse(savedGeneral));
      if (savedStore) setStoreSettings(JSON.parse(savedStore));
      if (savedPayment) {
        const parsed = JSON.parse(savedPayment);
        setPaymentSettings(parsed);
        if (parsed.qrisImageUrl) {
          setQrisImagePreview(parsed.qrisImageUrl);
        }
      }
      if (savedReceipt) setReceiptSettings(JSON.parse(savedReceipt));
      if (savedNotification) setNotificationSettings(JSON.parse(savedNotification));
      if (savedLoyalty) setLoyaltySettings(JSON.parse(savedLoyalty));
      if (savedPrinter) setPrinterSettings(JSON.parse(savedPrinter));
    };

    loadSettings();
  }, []);

  // Handle QRIS image upload
  const handleQrisImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "File Tidak Valid",
          description: "Hanya file gambar yang diperbolehkan",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Terlalu Besar",
          description: "Ukuran file maksimal 2MB",
          variant: "destructive",
        });
        return;
      }

      // Convert to base64 and save
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setQrisImagePreview(base64String);
        setPaymentSettings({
          ...paymentSettings,
          qrisImageUrl: base64String,
        });
        toast({
          title: "Gambar QRIS Dipilih",
          description: "Jangan lupa klik 'Simpan Metode Pembayaran' untuk menyimpan perubahan",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Save general settings
  const handleSaveGeneral = () => {
    localStorage.setItem("settings_general", JSON.stringify(generalSettings));
    toast({
      title: "Pengaturan Disimpan",
      description: "Pengaturan umum berhasil disimpan",
    });
  };

  // Save store settings
  const handleSaveStore = () => {
    localStorage.setItem("settings_store", JSON.stringify(storeSettings));
    toast({
      title: "Pengaturan Disimpan",
      description: "Informasi toko berhasil disimpan",
    });
  };

  // Save payment settings
  const handleSavePayment = () => {
    localStorage.setItem("settings_payment", JSON.stringify(paymentSettings));
    toast({
      title: "Pengaturan Disimpan",
      description: "Pengaturan pembayaran berhasil disimpan",
    });
  };

  // Save receipt settings
  const handleSaveReceipt = () => {
    localStorage.setItem("settings_receipt", JSON.stringify(receiptSettings));
    toast({
      title: "Pengaturan Disimpan",
      description: "Template struk berhasil disimpan",
    });
  };

  // Save notification settings
  const handleSaveNotification = () => {
    localStorage.setItem("settings_notification", JSON.stringify(notificationSettings));
    toast({
      title: "Pengaturan Disimpan",
      description: "Pengaturan notifikasi berhasil disimpan",
    });
  };

  // Save loyalty settings
  const handleSaveLoyalty = () => {
    localStorage.setItem("settings_loyalty", JSON.stringify(loyaltySettings));
    toast({
      title: "Pengaturan Disimpan",
      description: "Pengaturan program loyalty berhasil disimpan",
    });
  };

  // Printer functions
  const handleScanPrinters = async () => {
    if (!bluetoothPrinterService.isAvailable()) {
      toast({
        title: "Tidak Tersedia",
        description: "Bluetooth printer hanya tersedia di aplikasi Android/iOS",
        variant: "destructive",
      });
      return;
    }

    setScanningPrinters(true);
    try {
      // Request Bluetooth permissions first
      const hasPermissions = await bluetoothPrinterService.requestPermissions();
      
      if (!hasPermissions) {
        toast({
          title: "Izin Diperlukan",
          description: "Aplikasi memerlukan izin Bluetooth untuk scan printer. Silakan aktifkan di Settings.",
          variant: "destructive",
        });
        setScanningPrinters(false);
        return;
      }

      const printers = await bluetoothPrinterService.listPrinters();
      setAvailablePrinters(printers);
      toast({
        title: "Scan Selesai",
        description: `Ditemukan ${printers.length} printer`,
      });
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Error",
        description: "Gagal mencari printer. Pastikan Bluetooth aktif dan izin diberikan.",
        variant: "destructive",
      });
    } finally {
      setScanningPrinters(false);
    }
  };

  const handleConnectPrinter = async (address: string, name: string) => {
    setIsConnecting(true);
    try {
      await bluetoothPrinterService.connect(address);
      setPrinterSettings({
        ...printerSettings,
        connectedPrinter: name,
      });
      // Save immediately after connecting
      const updatedSettings = {
        ...printerSettings,
        connectedPrinter: name,
      };
      localStorage.setItem("settings_printer", JSON.stringify(updatedSettings));
      
      toast({
        title: "Berhasil Terhubung",
        description: `Terhubung ke ${name}`,
      });
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Gagal Terhubung",
        description: "Tidak dapat terhubung ke printer. Pastikan printer dalam mode pairing.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectPrinter = async () => {
    try {
      await bluetoothPrinterService.disconnect();
      setPrinterSettings({
        ...printerSettings,
        connectedPrinter: null,
      });
      // Save immediately after disconnecting
      const updatedSettings = {
        ...printerSettings,
        connectedPrinter: null,
      };
      localStorage.setItem("settings_printer", JSON.stringify(updatedSettings));
      
      toast({
        title: "Terputus",
        description: "Printer telah diputus",
      });
    } catch (error) {
      console.error('Disconnection error:', error);
      toast({
        title: "Error",
        description: "Gagal memutus koneksi printer",
        variant: "destructive",
      });
    }
  };

  const handleTestPrint = async () => {
    if (!printerSettings.connectedPrinter) {
      toast({
        title: "Tidak Terhubung",
        description: "Hubungkan printer terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setTestingPrint(true);
    try {
      await bluetoothPrinterService.printReceipt({
        transactionNumber: "TEST-" + Date.now(),
        date: new Date(),
        items: [
          { name: "Nasi Goreng", quantity: 2, price: 25000, subtotal: 50000 },
          { name: "Es Teh Manis", quantity: 2, price: 5000, subtotal: 10000 },
        ],
        subtotal: 60000,
        tax: 6000,
        taxRate: 10,
        serviceCharge: 0,
        total: 66000,
        paymentMethod: "cash",
        paymentAmount: 70000,
        changeAmount: 4000,
        customerName: "Test Customer",
        customerPoints: 100,
        earnedPoints: 60,
      });
      
      toast({
        title: "Test Print Berhasil!",
        description: "Struk test berhasil dicetak",
      });
    } catch (error) {
      console.error('Test print error:', error);
      toast({
        title: "Test Print Gagal",
        description: "Tidak dapat mencetak. Periksa koneksi printer.",
        variant: "destructive",
      });
    } finally {
      setTestingPrint(false);
    }
  };

  const handleSavePrinter = () => {
    localStorage.setItem("settings_printer", JSON.stringify(printerSettings));
    toast({
      title: "Pengaturan Disimpan",
      description: "Pengaturan printer berhasil disimpan",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
        <p className="text-muted-foreground">Kelola pengaturan sistem POS Anda</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Umum</TabsTrigger>
          <TabsTrigger value="store">Toko</TabsTrigger>
          <TabsTrigger value="payment">Pembayaran</TabsTrigger>
          <TabsTrigger value="receipt">Struk</TabsTrigger>
          <TabsTrigger value="printer">Printer</TabsTrigger>
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
          <TabsTrigger value="loyalty">Program Loyalty</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Sistem</CardTitle>
              <CardDescription>Pengaturan dasar sistem POS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Bisnis</Label>
                <Input 
                  value={generalSettings.businessName}
                  onChange={(e) => setGeneralSettings({...generalSettings, businessName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Zona Waktu</Label>
                  <Input 
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mata Uang</Label>
                  <Input defaultValue="IDR - Rupiah" disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bahasa</Label>
                <Input 
                  value={generalSettings.language}
                  onChange={(e) => setGeneralSettings({...generalSettings, language: e.target.value})}
                />
              </div>
              <Button onClick={handleSaveGeneral}>Simpan Perubahan</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferensi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mode Gelap</Label>
                  <p className="text-sm text-muted-foreground">Aktifkan tema gelap</p>
                </div>
                <Switch 
                  checked={generalSettings.darkMode}
                  onCheckedChange={(checked) => setGeneralSettings({...generalSettings, darkMode: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Suara Notifikasi</Label>
                  <p className="text-sm text-muted-foreground">Bunyi saat transaksi selesai</p>
                </div>
                <Switch 
                  checked={generalSettings.soundEnabled}
                  onCheckedChange={(checked) => setGeneralSettings({...generalSettings, soundEnabled: checked})}
                />
              </div>
              <Button onClick={handleSaveGeneral} className="mt-4">Simpan Preferensi</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Toko</CardTitle>
              <CardDescription>Detail lokasi dan kontak toko</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Alamat Lengkap</Label>
                <Input
                  value={storeSettings.address}
                  onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
                  placeholder="Alamat toko"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kota</Label>
                  <Input 
                    value={storeSettings.city}
                    onChange={(e) => setStoreSettings({...storeSettings, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kode Pos</Label>
                  <Input 
                    value={storeSettings.postalCode}
                    onChange={(e) => setStoreSettings({...storeSettings, postalCode: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telepon</Label>
                  <Input 
                    value={storeSettings.phone}
                    onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    value={storeSettings.email}
                    onChange={(e) => setStoreSettings({...storeSettings, email: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleSaveStore}>Simpan Perubahan</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jam Operasional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Fitur jam operasional akan segera hadir</p>
              {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-24">
                    <Label>{day}</Label>
                  </div>
                  <Input className="w-32" defaultValue="08:00" type="time" />
                  <span>-</span>
                  <Input className="w-32" defaultValue="22:00" type="time" />
                  <Switch defaultChecked />
                </div>
              ))}
              <Button className="mt-4" variant="outline" disabled>Simpan Jam Operasional (Coming Soon)</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Metode Pembayaran</CardTitle>
              <CardDescription>Aktifkan metode pembayaran yang tersedia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tunai</Label>
                  <p className="text-sm text-muted-foreground">Pembayaran cash</p>
                </div>
                <Switch 
                  checked={paymentSettings.cashEnabled}
                  onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, cashEnabled: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>QRIS / E-Wallet</Label>
                  <p className="text-sm text-muted-foreground">GoPay, OVO, Dana, ShopeePay</p>
                </div>
                <Switch 
                  checked={paymentSettings.ewalletEnabled}
                  onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, ewalletEnabled: checked})}
                />
              </div>
              
              {/* QRIS Image Upload */}
              {paymentSettings.ewalletEnabled && (
                <div className="ml-6 space-y-3 p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label>Gambar QRIS</Label>
                    <p className="text-sm text-muted-foreground">
                      Upload gambar QRIS Anda (max 2MB)
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleQrisImageUpload}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  {qrisImagePreview && (
                    <div className="space-y-2">
                      <Label>Preview QRIS:</Label>
                      <div className="border rounded-lg p-4 bg-white flex justify-center">
                        <img 
                          src={qrisImagePreview} 
                          alt="QRIS Preview" 
                          className="max-w-[200px] h-auto"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQrisImagePreview(null);
                          setPaymentSettings({
                            ...paymentSettings,
                            qrisImageUrl: undefined,
                          });
                        }}
                      >
                        Hapus Gambar
                      </Button>
                    </div>
                  )}
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Transfer Bank</Label>
                  <p className="text-sm text-muted-foreground">Virtual account</p>
                </div>
                <Switch 
                  checked={paymentSettings.transferEnabled}
                  onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, transferEnabled: checked})}
                />
              </div>
              <Button onClick={handleSavePayment} className="mt-4">Simpan Metode Pembayaran</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pajak & Biaya</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pajak (%)</Label>
                  <Input 
                    type="number" 
                    value={paymentSettings.taxRate}
                    onChange={(e) => setPaymentSettings({...paymentSettings, taxRate: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Service Charge (%)</Label>
                  <Input 
                    type="number" 
                    value={paymentSettings.serviceCharge}
                    onChange={(e) => setPaymentSettings({...paymentSettings, serviceCharge: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tampilkan Pajak Terpisah</Label>
                  <p className="text-sm text-muted-foreground">Di struk dan invoice</p>
                </div>
                <Switch 
                  checked={paymentSettings.showTaxSeparately}
                  onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, showTaxSeparately: checked})}
                />
              </div>
              <Button onClick={handleSavePayment}>Simpan Pengaturan</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Struk</CardTitle>
              <CardDescription>Kustomisasi tampilan struk pembayaran</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Header Struk</Label>
                <Input 
                  value={receiptSettings.header}
                  onChange={(e) => setReceiptSettings({...receiptSettings, header: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input 
                  value={receiptSettings.tagline}
                  onChange={(e) => setReceiptSettings({...receiptSettings, tagline: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Footer Message</Label>
                <Input 
                  value={receiptSettings.footer}
                  onChange={(e) => setReceiptSettings({...receiptSettings, footer: e.target.value})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tampilkan Logo</Label>
                  <p className="text-sm text-muted-foreground">Di bagian atas struk</p>
                </div>
                <Switch 
                  checked={receiptSettings.showLogo}
                  onCheckedChange={(checked) => setReceiptSettings({...receiptSettings, showLogo: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tampilkan Detail Kasir</Label>
                  <p className="text-sm text-muted-foreground">Nama dan ID kasir</p>
                </div>
                <Switch 
                  checked={receiptSettings.showCashierDetails}
                  onCheckedChange={(checked) => setReceiptSettings({...receiptSettings, showCashierDetails: checked})}
                />
              </div>
              <Button onClick={handleSaveReceipt}>Simpan Template</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="printer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bluetooth Printer</CardTitle>
              <CardDescription>Cetak struk langsung ke printer Bluetooth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Platform Info */}
              {bluetoothPrinterService.getPlatformType() === 'web' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    🖥️ Mode Web Bluetooth (Desktop)
                  </p>
                  <p className="text-sm text-blue-700">
                    Anda menggunakan browser desktop dengan Web Bluetooth API. 
                    Pastikan printer Bluetooth sudah dalam mode pairing dan terdeteksi oleh sistem.
                  </p>
                </div>
              )}

              {bluetoothPrinterService.getPlatformType() === 'native' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800 font-medium mb-1">
                    📱 Mode Native (Android/iOS)
                  </p>
                  <p className="text-sm text-green-700">
                    Anda menggunakan aplikasi mobile dengan native Bluetooth plugin.
                  </p>
                </div>
              )}

              {!bluetoothPrinterService.isAvailable() && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
                  <p className="text-sm text-orange-800">
                    ⚠️ Bluetooth printer tidak tersedia. 
                    Pastikan Anda menggunakan Chrome/Edge desktop (Web Bluetooth) atau aplikasi Android/iOS.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Aktifkan Bluetooth Printing</Label>
                  <p className="text-sm text-muted-foreground">Cetak struk otomatis ke printer Bluetooth</p>
                </div>
                <Switch 
                  checked={printerSettings.bluetoothEnabled}
                  onCheckedChange={(checked) => setPrinterSettings({...printerSettings, bluetoothEnabled: checked})}
                  disabled={!bluetoothPrinterService.isAvailable()}
                />
              </div>

              {printerSettings.bluetoothEnabled && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cetak Otomatis</Label>
                      <p className="text-sm text-muted-foreground">Cetak struk langsung setelah transaksi selesai</p>
                    </div>
                    <Switch 
                      checked={printerSettings.autoPrint}
                      onCheckedChange={(checked) => setPrinterSettings({...printerSettings, autoPrint: checked})}
                    />
                  </div>

                  <Separator />
                  
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label className="text-base">Status Koneksi</Label>
                        {printerSettings.connectedPrinter ? (
                          <div className="mt-1">
                            <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                              Terhubung: {printerSettings.connectedPrinter}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            Belum terhubung
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {printerSettings.connectedPrinter && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={handleTestPrint}
                              disabled={testingPrint}
                            >
                              {testingPrint ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Testing...
                                </>
                              ) : (
                                <>
                                  <Printer className="mr-2 h-4 w-4" />
                                  Test Print
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDisconnectPrinter}
                            >
                              Putuskan
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Cari Printer Bluetooth</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleScanPrinters}
                          disabled={scanningPrinters || isConnecting}
                        >
                          {scanningPrinters ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Mencari...
                            </>
                          ) : (
                            <>
                              <Bluetooth className="mr-2 h-4 w-4" />
                              Scan Printer
                            </>
                          )}
                        </Button>
                      </div>

                      {availablePrinters.length > 0 && (
                        <div className="space-y-2 mt-3">
                          <Label className="text-sm">Printer Ditemukan ({availablePrinters.length}):</Label>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {availablePrinters.map((printer) => (
                              <div
                                key={printer.address}
                                className="flex items-center justify-between p-3 border rounded-md bg-white hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <Printer className="h-4 w-4 text-primary" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{printer.name}</p>
                                    <p className="text-xs text-muted-foreground">{printer.address}</p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleConnectPrinter(printer.address, printer.name)}
                                  disabled={printerSettings.connectedPrinter === printer.name || isConnecting}
                                >
                                  {isConnecting ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : printerSettings.connectedPrinter === printer.name ? (
                                    '✓ Terhubung'
                                  ) : (
                                    'Hubungkan'
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {scanningPrinters && availablePrinters.length === 0 && (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                          Mencari printer Bluetooth...
                        </div>
                      )}

                      {!scanningPrinters && availablePrinters.length === 0 && (
                        <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                          Belum ada printer yang ditemukan.<br />
                          Klik "Scan Printer" untuk mencari.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <Button onClick={handleSavePrinter} className="mt-4">
                Simpan Pengaturan Printer
              </Button>
            </CardContent>
          </Card>

          {printerSettings.bluetoothEnabled && (
            <Card>
              <CardHeader>
                <CardTitle>Info Printer Bluetooth</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                  <p className="font-semibold text-blue-900 flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    Cara Menggunakan:
                  </p>
                  <ul className="text-sm space-y-1 ml-4 list-disc text-blue-800">
                    <li>Nyalakan printer Bluetooth dan pastikan dalam mode pairing</li>
                    <li>Pastikan Bluetooth di HP Android sudah aktif</li>
                    <li>Klik <strong>"Scan Printer"</strong> untuk mencari printer yang tersedia</li>
                    <li>Pilih printer dari daftar dan klik <strong>"Hubungkan"</strong></li>
                    <li>Gunakan tombol <strong>"Test Print"</strong> untuk test cetak struk contoh</li>
                    <li>Aktifkan <strong>"Cetak Otomatis"</strong> untuk cetak struk langsung setelah transaksi</li>
                    <li>Atau gunakan tombol <strong>"Print Bluetooth"</strong> di dialog struk untuk cetak manual</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg space-y-2">
                  <p className="font-semibold">Printer yang Didukung:</p>
                  <div className="text-sm space-y-1">
                    <p>• Thermal printer 58mm / 80mm</p>
                    <p>• ESC/POS compatible printer</p>
                    <p>• Bluetooth printer untuk struk/nota</p>
                    <p className="text-muted-foreground mt-2">Contoh: Zjiang, Epson TM-series, iMin, Sunmi, dll</p>
                  </div>
                </div>
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="font-semibold text-orange-900 mb-1">⚠️ Catatan Penting:</p>
                  <p className="text-sm text-orange-800">
                    Fitur Bluetooth printer hanya berfungsi di aplikasi Android/iOS yang sudah terinstall. 
                    Tidak akan berfungsi di web browser.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifikasi Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Laporan Harian</Label>
                  <p className="text-sm text-muted-foreground">Kirim ringkasan penjualan harian</p>
                </div>
                <Switch 
                  checked={notificationSettings.dailyReport}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, dailyReport: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Stok Menipis</Label>
                  <p className="text-sm text-muted-foreground">Alert saat stok di bawah minimum</p>
                </div>
                <Switch 
                  checked={notificationSettings.lowStock}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, lowStock: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Transaksi Besar</Label>
                  <p className="text-sm text-muted-foreground">Notifikasi transaksi {">"} Rp 1 Jt</p>
                </div>
                <Switch 
                  checked={notificationSettings.largeTransaction}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, largeTransaction: checked})}
                />
              </div>
              <Button onClick={handleSaveNotification} className="mt-4">Simpan Pengaturan Email</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifikasi WhatsApp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nomor WhatsApp Admin</Label>
                <Input 
                  placeholder="08123456789" 
                  value={notificationSettings.whatsappNumber}
                  onChange={(e) => setNotificationSettings({...notificationSettings, whatsappNumber: e.target.value})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aktifkan Notifikasi WA</Label>
                  <p className="text-sm text-muted-foreground">Kirim alert via WhatsApp</p>
                </div>
                <Switch 
                  checked={notificationSettings.whatsappEnabled}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, whatsappEnabled: checked})}
                />
              </div>
              <Button onClick={handleSaveNotification}>Simpan Pengaturan</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Program Loyalty Points</CardTitle>
              <CardDescription>Kelola sistem poin untuk pelanggan setia Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Aktifkan Program Loyalty</Label>
                  <p className="text-sm text-muted-foreground">Pelanggan dapat mengumpulkan dan menukar poin</p>
                </div>
                <Switch 
                  checked={loyaltySettings.enabled}
                  onCheckedChange={(checked) => setLoyaltySettings({...loyaltySettings, enabled: checked})}
                />
              </div>

              {loyaltySettings.enabled && (
                <>
                  <Separator />
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-2">
                      <Label>Dapatkan Poin</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">1 poin untuk setiap Rp</span>
                        <Input 
                          type="number" 
                          value={loyaltySettings.pointsPerRupiah}
                          onChange={(e) => setLoyaltySettings({...loyaltySettings, pointsPerRupiah: parseInt(e.target.value) || 1000})}
                          className="w-32"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Contoh: Belanja Rp 50,000 = {Math.floor(50000 / loyaltySettings.pointsPerRupiah)} poin
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Nilai Tukar Poin</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">1 poin = Rp</span>
                        <Input 
                          type="number" 
                          value={loyaltySettings.rupiahPerPoint}
                          onChange={(e) => setLoyaltySettings({...loyaltySettings, rupiahPerPoint: parseInt(e.target.value) || 1000})}
                          className="w-32"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Contoh: 10 poin = Rp {(10 * loyaltySettings.rupiahPerPoint).toLocaleString('id-ID')} diskon
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Minimum Poin untuk Ditukar</Label>
                      <Input 
                        type="number" 
                        value={loyaltySettings.minimumPointsRedeem}
                        onChange={(e) => setLoyaltySettings({...loyaltySettings, minimumPointsRedeem: parseInt(e.target.value) || 10})}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Pelanggan harus memiliki minimal {loyaltySettings.minimumPointsRedeem} poin untuk menukar
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Minimum Belanja untuk Dapat Poin</Label>
                      <Input 
                        type="number" 
                        value={loyaltySettings.minimumPurchaseEarn}
                        onChange={(e) => setLoyaltySettings({...loyaltySettings, minimumPurchaseEarn: parseInt(e.target.value) || 10000})}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Transaksi harus minimal Rp {loyaltySettings.minimumPurchaseEarn.toLocaleString('id-ID')} untuk mendapat poin
                      </p>
                    </div>
                  </div>
                </>
              )}

              <Button onClick={handleSaveLoyalty} className="mt-4">
                Simpan Pengaturan Loyalty
              </Button>
            </CardContent>
          </Card>

          {loyaltySettings.enabled && (
            <Card>
              <CardHeader>
                <CardTitle>Info Program Loyalty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-primary/10 rounded-lg space-y-2">
                  <p className="font-semibold text-primary">Cara Kerja Program:</p>
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    <li>Pelanggan mendapat poin otomatis setiap transaksi</li>
                    <li>Poin dapat ditukar menjadi diskon di transaksi berikutnya</li>
                    <li>Pilih "Gunakan Poin" di halaman POS untuk menukar poin</li>
                    <li>Sisa poin akan dikembalikan ke akun pelanggan</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg space-y-2">
                  <p className="font-semibold">Contoh Perhitungan:</p>
                  <div className="text-sm space-y-1">
                    <p>• Belanja Rp 100,000 → dapat {Math.floor(100000 / loyaltySettings.pointsPerRupiah)} poin</p>
                    <p>• Tukar 50 poin → diskon Rp {(50 * loyaltySettings.rupiahPerPoint).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
