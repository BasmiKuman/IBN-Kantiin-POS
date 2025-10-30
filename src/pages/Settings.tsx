import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
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
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
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
                <Input defaultValue="Warung Makan Sedap" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Zona Waktu</Label>
                  <Input defaultValue="Asia/Jakarta" />
                </div>
                <div className="space-y-2">
                  <Label>Mata Uang</Label>
                  <Input defaultValue="IDR - Rupiah" disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bahasa</Label>
                <Input defaultValue="Bahasa Indonesia" />
              </div>
              <Button>Simpan Perubahan</Button>
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
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Suara Notifikasi</Label>
                  <p className="text-sm text-muted-foreground">Bunyi saat transaksi selesai</p>
                </div>
                <Switch defaultChecked />
              </div>
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
                  defaultValue="Jl. Raya Sudirman No. 123"
                  placeholder="Alamat toko"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kota</Label>
                  <Input defaultValue="Jakarta" />
                </div>
                <div className="space-y-2">
                  <Label>Kode Pos</Label>
                  <Input defaultValue="12345" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telepon</Label>
                  <Input defaultValue="021-12345678" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="info@warungmakan.com" />
                </div>
              </div>
              <Button>Simpan Perubahan</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jam Operasional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
              <Button className="mt-4">Simpan Jam Operasional</Button>
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
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Kartu Debit/Kredit</Label>
                  <p className="text-sm text-muted-foreground">EDC machine</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>E-Wallet (GoPay, OVO, Dana)</Label>
                  <p className="text-sm text-muted-foreground">QRIS payment</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Transfer Bank</Label>
                  <p className="text-sm text-muted-foreground">Virtual account</p>
                </div>
                <Switch />
              </div>
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
                  <Input type="number" defaultValue="10" />
                </div>
                <div className="space-y-2">
                  <Label>Service Charge (%)</Label>
                  <Input type="number" defaultValue="5" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tampilkan Pajak Terpisah</Label>
                  <p className="text-sm text-muted-foreground">Di struk dan invoice</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button>Simpan Pengaturan</Button>
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
                <Input defaultValue="Warung Makan Sedap" />
              </div>
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input defaultValue="Makanan Enak, Harga Terjangkau" />
              </div>
              <div className="space-y-2">
                <Label>Footer Message</Label>
                <Input defaultValue="Terima kasih atas kunjungan Anda!" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tampilkan Logo</Label>
                  <p className="text-sm text-muted-foreground">Di bagian atas struk</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tampilkan Detail Kasir</Label>
                  <p className="text-sm text-muted-foreground">Nama dan ID kasir</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button>Simpan Template</Button>
            </CardContent>
          </Card>
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
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Stok Menipis</Label>
                  <p className="text-sm text-muted-foreground">Alert saat stok di bawah minimum</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Transaksi Besar</Label>
                  <p className="text-sm text-muted-foreground">Notifikasi transaksi {">"} Rp 1 Jt</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifikasi WhatsApp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nomor WhatsApp Admin</Label>
                <Input placeholder="08123456789" defaultValue="08123456789" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aktifkan Notifikasi WA</Label>
                  <p className="text-sm text-muted-foreground">Kirim alert via WhatsApp</p>
                </div>
                <Switch />
              </div>
              <Button>Simpan Pengaturan</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
