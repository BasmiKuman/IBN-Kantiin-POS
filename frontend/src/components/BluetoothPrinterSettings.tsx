import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useBluetoothPrinter } from '@/hooks/useBluetoothPrinter';
import { generateTestReceipt } from '@/lib/receiptFormatter';
import { 
  Bluetooth, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Printer,
  Trash2,
  Info,
  Zap,
  Settings2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function BluetoothPrinterSettings() {
  const bluetooth = useBluetoothPrinter();
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [isTesting, setIsTesting] = useState(false);

  // Load auto-reconnect setting
  useEffect(() => {
    const saved = localStorage.getItem('bluetooth_auto_reconnect');
    if (saved !== null) {
      setAutoReconnect(saved === 'true');
    }
  }, []);

  // Save auto-reconnect setting
  const handleAutoReconnectToggle = (checked: boolean) => {
    setAutoReconnect(checked);
    localStorage.setItem('bluetooth_auto_reconnect', String(checked));
    toast({
      title: checked ? 'Auto-Reconnect Diaktifkan' : 'Auto-Reconnect Dinonaktifkan',
      description: checked 
        ? 'Printer akan otomatis tersambung saat dibutuhkan'
        : 'Anda perlu menyambungkan printer manual setiap kali',
    });
  };

  const handleConnect = async () => {
    await bluetooth.connect();
  };

  const handleDisconnect = async () => {
    await bluetooth.disconnect();
  };

  const handleTestPrint = async () => {
    setIsTesting(true);
    try {
      const testReceipt = generateTestReceipt();
      const success = await bluetooth.printReceipt(testReceipt);
      if (success) {
        toast({
          title: '✅ Test Print Berhasil!',
          description: 'Printer berfungsi dengan baik',
        });
      }
    } catch (error) {
      console.error('Test print failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleForgetPrinter = () => {
    localStorage.removeItem('bluetooth_printer_name');
    localStorage.removeItem('bluetooth_printer_id');
    if (bluetooth.isConnected) {
      bluetooth.disconnect();
    }
    toast({
      title: 'Printer Dilupakan',
      description: 'Data printer telah dihapus. Hubungkan lagi untuk menyimpan printer baru.',
    });
    // Force re-render
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      {/* Connection Status Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bluetooth className="h-5 w-5" />
                Koneksi Printer
              </CardTitle>
              <CardDescription>Status koneksi Bluetooth printer Anda</CardDescription>
            </div>
            <Badge 
              variant={bluetooth.isConnected ? 'default' : 'secondary'}
              className={bluetooth.isConnected ? 'bg-green-600 hover:bg-green-700' : ''}
            >
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
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Printer Info */}
          {bluetooth.printerName && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Printer Tersimpan</p>
                  <p className="text-lg font-semibold">{bluetooth.printerName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleForgetPrinter}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Connection Buttons */}
          <div className="flex gap-2">
            {!bluetooth.isConnected ? (
              <Button
                onClick={handleConnect}
                disabled={bluetooth.isConnecting}
                className="flex-1"
                size="lg"
              >
                {bluetooth.isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menghubungkan...
                  </>
                ) : (
                  <>
                    <Bluetooth className="h-4 w-4 mr-2" />
                    {bluetooth.printerName ? 'Hubungkan Ulang' : 'Hubungkan Printer'}
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Putuskan Koneksi
                </Button>
                <Button
                  onClick={handleTestPrint}
                  disabled={isTesting}
                  size="lg"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4 mr-2" />
                      Test Print
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Info Alert when not connected */}
          {!bluetooth.isConnected && !bluetooth.printerName && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">Cara Setup Printer:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Nyalakan printer thermal Bluetooth Anda</li>
                  <li>Pastikan printer dalam mode pairing (LED berkedip)</li>
                  <li>Klik tombol "Hubungkan Printer" di atas</li>
                  <li>Pilih printer dari daftar yang muncul</li>
                  <li>Printer akan tersimpan otomatis untuk penggunaan selanjutnya</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Auto-Reconnect Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Pengaturan Lanjutan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">Auto-Reconnect</Label>
                <Badge variant="outline" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Recommended
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Otomatis menyambung ke printer saat Anda mencetak, tanpa perlu klik "Hubungkan" lagi
              </p>
            </div>
            <Switch
              checked={autoReconnect}
              onCheckedChange={handleAutoReconnectToggle}
              className="ml-4"
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Info className="h-4 w-4" />
              Cara Kerja System Bluetooth:
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="font-bold text-primary">1.</span>
                <p><strong>Setup Sekali:</strong> Hubungkan printer di Settings (halaman ini) atau saat pertama kali print</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-primary">2.</span>
                <p><strong>Simpan Otomatis:</strong> Nama printer tersimpan dan akan auto-reconnect</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-primary">3.</span>
                <p><strong>Print Langsung:</strong> Tombol "Print Dapur" / "Print Kasir" langsung berfungsi tanpa setup lagi</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-primary">4.</span>
                <p><strong>Smart Reconnect:</strong> Jika koneksi putus, system otomatis reconnect di background</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting Card */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-900">🔧 Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-yellow-900">
          <div>
            <p className="font-semibold mb-1">Printer tidak terdeteksi:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Pastikan printer dalam mode pairing (LED berkedip)</li>
              <li>Pair printer via Settings → Bluetooth sistem terlebih dahulu</li>
              <li>Pastikan printer tidak terhubung ke device lain</li>
            </ul>
          </div>
          <Separator className="bg-yellow-200" />
          <div>
            <p className="font-semibold mb-1">Koneksi sering putus:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Pastikan jarak printer max 10 meter</li>
              <li>Charge battery printer jika menggunakan portable printer</li>
              <li>Restart printer dan hubungkan ulang</li>
            </ul>
          </div>
          <Separator className="bg-yellow-200" />
          <div>
            <p className="font-semibold mb-1">Print tidak keluar:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Cek apakah kertas thermal masih ada</li>
              <li>Restart printer</li>
              <li>Klik "Test Print" untuk verifikasi koneksi</li>
              <li>Gunakan printer yang support ESC/POS standard</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
