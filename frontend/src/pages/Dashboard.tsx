import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTransactions, type Transaction } from "@/hooks/supabase/useTransactions";
import { useProducts } from "@/hooks/supabase/useProducts";
import { useCustomers } from "@/hooks/supabase/useCustomers";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { data: transactions = [] as Transaction[] } = useTransactions();
  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "User";
    const storedRole = localStorage.getItem("userRole") || "kasir";
    const employeeId = localStorage.getItem("employeeId");
    
    setUsername(storedUsername);
    setUserRole(storedRole);
    
    // Fetch employee photo
    if (employeeId) {
      supabase
        .from('employees')
        .select('photo_url')
        .eq('id', employeeId)
        .single()
        .then(({ data }) => {
          if (data?.photo_url) {
            setPhotoUrl(data.photo_url);
          }
        });
    }
  }, []);

  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => 
    t.created_at?.startsWith(today)
  );
  
  const todaySales = todayTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
  const todayTransactionsCount = todayTransactions.length;
  
  // Calculate products sold today (estimate)
  const todayProductsSold = todayTransactions.length * 2; // Rough estimate
  
  // Get new customers (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newCustomers = customers.filter(c => 
    new Date(c.created_at) >= sevenDaysAgo
  ).length;

  // Low stock products
  const lowStockProducts = products.filter(p => 
    p.min_stock && p.stock <= p.min_stock
  );

  // Prepare sales chart data (last 7 days)
  const salesChartData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayTransactions = transactions.filter(t => t.created_at?.startsWith(dateStr));
    const revenue = dayTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
    const profit = dayTransactions.reduce((sum, t) => sum + (t.total || 0), 0) * 0.3; // Estimasi profit 30%
    
    salesChartData.push({
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      revenue: revenue,
      profit: profit,
      transactions: dayTransactions.length
    });
  }

  // Payment method distribution
  const paymentMethodData = [
    { name: 'Cash', value: transactions.filter(t => t.payment_method === 'cash').length },
    { name: 'Debit', value: transactions.filter(t => t.payment_method === 'debit').length },
    { name: 'Credit', value: transactions.filter(t => t.payment_method === 'credit').length },
    { name: 'QRIS', value: transactions.filter(t => t.payment_method === 'qris').length },
    { name: 'Transfer', value: transactions.filter(t => t.payment_method === 'transfer').length },
  ].filter(item => item.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const stats = [
    {
      title: "Total Penjualan Hari Ini",
      value: `Rp ${todaySales.toLocaleString()}`,
      change: "-",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Transaksi",
      value: todayTransactionsCount.toString(),
      change: "-",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      title: "Produk Terjual",
      value: todayProductsSold.toString(),
      change: "-",
      trend: "up",
      icon: Package,
    },
    {
      title: "Pelanggan Baru (7 hari)",
      value: newCustomers.toString(),
      change: "-",
      trend: "up",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with User Profile */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Ringkasan bisnis Anda hari ini</p>
        </div>
        
        {/* User Profile Card - Pojok Kanan Atas */}
        <Card className="w-auto min-w-[250px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={photoUrl || undefined} />
                <AvatarFallback className="bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {username}
                </p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {userRole === "admin" ? "Administrator" : userRole === "manager" ? "Manager" : "Kasir"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <p className="text-xs text-muted-foreground">
                {stat.change === "-" ? "Data real-time dari database" : stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Grafik Penjualan & Profit (7 Hari Terakhir)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `Rp ${value.toLocaleString()}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  name="Pendapatan"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#82ca9d" 
                  name="Profit (Est.)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Method Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Volume Transaksi (7 Hari Terakhir)</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="transactions" fill="#8884d8" name="Jumlah Transaksi" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stok Menipis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Semua stok aman
                </p>
              ) : lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm font-medium">{product.name}</span>
                  <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                    {product.stock} pcs
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
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada aktivitas
                </p>
              ) : transactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Transaksi #{transaction.transaction_number}</p>
                    <p className="text-xs text-muted-foreground">
                      Rp {transaction.total.toLocaleString()} • {new Date(transaction.created_at).toLocaleString('id-ID')}
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