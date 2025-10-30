import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, TrendingUp, DollarSign, ShoppingCart, Package } from "lucide-react";

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan & Analitik</h2>
          <p className="text-muted-foreground">Analisis performa bisnis Anda</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="week">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="week">Minggu Ini</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 85.4 Jt</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-success" />
              <span className="text-success">+18.2%</span>
              <span className="ml-1 text-muted-foreground">vs bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,842</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-success" />
              <span className="text-success">+12.5%</span>
              <span className="ml-1 text-muted-foreground">vs bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produk Terjual</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,432</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-success" />
              <span className="text-success">+24.8%</span>
              <span className="ml-1 text-muted-foreground">vs bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Transaksi</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 22.2K</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-success" />
              <span className="text-success">+5.2%</span>
              <span className="ml-1 text-muted-foreground">vs bulan lalu</span>
            </div>
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
                    { category: "Makanan", amount: "Rp 45.2 Jt", percentage: 53 },
                    { category: "Minuman", amount: "Rp 28.8 Jt", percentage: 34 },
                    { category: "Snack", amount: "Rp 11.4 Jt", percentage: 13 },
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
                    { method: "Tunai", amount: "Rp 42.5 Jt", percentage: 50 },
                    { method: "Kartu Debit/Kredit", amount: "Rp 29.8 Jt", percentage: 35 },
                    { method: "E-Wallet", amount: "Rp 13.1 Jt", percentage: 15 },
                  ].map((item) => (
                    <div key={item.method}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{item.method}</span>
                        <span className="text-muted-foreground">{item.amount}</span>
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
                {[
                  { name: "Nasi Goreng Spesial", sold: 342, revenue: "Rp 5.1 Jt" },
                  { name: "Es Teh Manis", sold: 689, revenue: "Rp 3.4 Jt" },
                  { name: "Ayam Bakar", sold: 256, revenue: "Rp 6.4 Jt" },
                  { name: "Kopi Susu", sold: 512, revenue: "Rp 4.1 Jt" },
                  { name: "Mie Goreng", sold: 298, revenue: "Rp 4.5 Jt" },
                ].map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sold} terjual</p>
                      </div>
                    </div>
                    <p className="font-semibold">{product.revenue}</p>
                  </div>
                ))}
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
                <div className="text-2xl font-bold">Rp 51.2 Jt</div>
                <p className="text-xs text-muted-foreground">60% margin</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Operating Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp 22.3 Jt</div>
                <p className="text-xs text-muted-foreground">26% dari revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">Rp 28.9 Jt</div>
                <p className="text-xs text-muted-foreground">34% margin</p>
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
