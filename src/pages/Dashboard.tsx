import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Total Penjualan Hari Ini",
      value: "Rp 12.450.000",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Transaksi",
      value: "156",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      title: "Produk Terjual",
      value: "423",
      change: "+15.3%",
      trend: "up",
      icon: Package,
    },
    {
      title: "Pelanggan Baru",
      value: "28",
      change: "-3.1%",
      trend: "down",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Ringkasan bisnis Anda hari ini</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs">
                {stat.trend === "up" ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
                )}
                <span className={stat.trend === "up" ? "text-success" : "text-destructive"}>
                  {stat.change}
                </span>
                <span className="ml-1 text-muted-foreground">dari kemarin</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Penjualan Mingguan</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart akan ditampilkan di sini (Recharts)
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Nasi Goreng Spesial", sold: 45, revenue: "Rp 675.000" },
                { name: "Es Teh Manis", sold: 89, revenue: "Rp 445.000" },
                { name: "Ayam Bakar", sold: 34, revenue: "Rp 850.000" },
                { name: "Kopi Susu", sold: 67, revenue: "Rp 335.000" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.sold} terjual</p>
                  </div>
                  <div className="text-sm font-semibold">{item.revenue}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stok Menipis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Beras Premium", stock: 5, unit: "kg" },
                { name: "Gula Pasir", stock: 3, unit: "kg" },
                { name: "Kopi Bubuk", stock: 2, unit: "pack" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                    {item.stock} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terkini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "Transaksi baru", user: "Kasir 1", time: "2 menit lalu" },
                { action: "Produk ditambahkan", user: "Admin", time: "15 menit lalu" },
                { action: "Laporan dicetak", user: "Manager", time: "1 jam lalu" },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">
                      oleh {item.user} • {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
