import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Search, Plus, Mail, Phone, Star, Gift, TrendingUp } from "lucide-react";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");

  const customers = [
    {
      id: 1,
      name: "Budi Santoso",
      email: "budi@email.com",
      phone: "08123456789",
      totalSpent: 2450000,
      visits: 24,
      points: 245,
      tier: "Gold",
      lastVisit: "2024-01-15",
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      email: "siti@email.com",
      phone: "08234567890",
      totalSpent: 890000,
      visits: 12,
      points: 89,
      tier: "Silver",
      lastVisit: "2024-01-14",
    },
    {
      id: 3,
      name: "Ahmad Yani",
      email: "ahmad@email.com",
      phone: "08345678901",
      totalSpent: 5230000,
      visits: 48,
      points: 523,
      tier: "Platinum",
      lastVisit: "2024-01-16",
    },
    {
      id: 4,
      name: "Dewi Lestari",
      email: "dewi@email.com",
      phone: "08456789012",
      totalSpent: 450000,
      visits: 6,
      points: 45,
      tier: "Bronze",
      lastVisit: "2024-01-10",
    },
  ];

  const getTierBadge = (tier: string) => {
    const variants: Record<string, string> = {
      Platinum: "bg-purple-500 text-white",
      Gold: "bg-warning text-warning-foreground",
      Silver: "bg-gray-400 text-white",
      Bronze: "bg-orange-600 text-white",
    };
    return <Badge className={variants[tier]}>{tier}</Badge>;
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customer Relationship Management</h2>
          <p className="text-muted-foreground">Kelola data pelanggan dan program loyalitas</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pelanggan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
              <DialogDescription>Masukkan informasi pelanggan</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input placeholder="Nama pelanggan" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label>No. Telepon</Label>
                <Input placeholder="08123456789" />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Lahir</Label>
                <Input type="date" />
              </div>
              <Button className="w-full">Simpan Pelanggan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-success" />
              <span className="text-success">+28</span>
              <span className="ml-1 text-muted-foreground">bulan ini</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelanggan Aktif</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">842</div>
            <p className="text-xs text-muted-foreground">67% dari total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Spending</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 425K</div>
            <p className="text-xs text-muted-foreground">Per pelanggan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2K</div>
            <p className="text-xs text-muted-foreground">Total points aktif</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">Daftar Pelanggan</TabsTrigger>
          <TabsTrigger value="loyalty">Program Loyalitas</TabsTrigger>
          <TabsTrigger value="segments">Segmentasi</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Daftar Pelanggan</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari pelanggan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Total Belanja</TableHead>
                    <TableHead>Kunjungan</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-xs">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>Rp {customer.totalSpent.toLocaleString()}</TableCell>
                      <TableCell>{customer.visits}x</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-warning text-warning" />
                          {customer.points}
                        </div>
                      </TableCell>
                      <TableCell>{getTierBadge(customer.tier)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tier Membership</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    tier: "Platinum",
                    min: "Rp 5 Jt",
                    benefits: "Diskon 20%, Birthday voucher Rp 200K",
                    members: 45,
                  },
                  {
                    tier: "Gold",
                    min: "Rp 2 Jt",
                    benefits: "Diskon 15%, Birthday voucher Rp 100K",
                    members: 128,
                  },
                  {
                    tier: "Silver",
                    min: "Rp 500K",
                    benefits: "Diskon 10%, Birthday voucher Rp 50K",
                    members: 342,
                  },
                  {
                    tier: "Bronze",
                    min: "< Rp 500K",
                    benefits: "Diskon 5%, Collect points",
                    members: 733,
                  },
                ].map((tier) => (
                  <div key={tier.tier} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      {getTierBadge(tier.tier)}
                      <span className="text-sm text-muted-foreground">{tier.members} members</span>
                    </div>
                    <p className="text-sm font-medium mb-1">Min. {tier.min}</p>
                    <p className="text-xs text-muted-foreground">{tier.benefits}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rewards & Vouchers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { points: 100, reward: "Diskon Rp 10.000", redeemed: 234 },
                  { points: 250, reward: "Diskon Rp 30.000", redeemed: 156 },
                  { points: 500, reward: "Gratis 1 Menu", redeemed: 89 },
                  { points: 1000, reward: "Diskon 50%", redeemed: 45 },
                ].map((reward, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{reward.reward}</p>
                      <p className="text-xs text-muted-foreground">
                        {reward.points} points • {reward.redeemed}x ditukar
                      </p>
                    </div>
                    <Star className="h-5 w-5 fill-warning text-warning" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Segmentasi Pelanggan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: "High Value Customers",
                  count: 142,
                  criteria: "Total belanja > Rp 3 Jt",
                  revenue: "Rp 124 Jt",
                },
                {
                  name: "Frequent Buyers",
                  count: 285,
                  criteria: "Kunjungan > 15x/bulan",
                  revenue: "Rp 89 Jt",
                },
                {
                  name: "At Risk",
                  count: 78,
                  criteria: "Tidak kunjungan 30 hari",
                  revenue: "Rp 12 Jt",
                },
                {
                  name: "New Customers",
                  count: 156,
                  criteria: "Bergabung < 3 bulan",
                  revenue: "Rp 18 Jt",
                },
              ].map((segment, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{segment.name}</h3>
                    <Badge variant="secondary">{segment.count} pelanggan</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{segment.criteria}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <span className="text-sm font-bold text-primary">{segment.revenue}</span>
                  </div>
                  <Button className="w-full mt-3" variant="outline" size="sm">
                    Kirim Kampanye Marketing
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
