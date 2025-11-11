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
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Mail, Phone, Star, Gift, TrendingUp } from "lucide-react";
import { useCustomers, useCreateCustomer, useUpdateCustomer, useUpdateCustomerPoints } from "@/hooks/supabase/useCustomers";
import { useToast } from "@/hooks/use-toast";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const { toast } = useToast();
  const { data: customers = [], isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();

  const handleCreateCustomer = async () => {
    if (!formData.name || !formData.phone) {
      toast({
        title: "Error",
        description: "Nama dan No. Telepon wajib diisi",
        variant: "destructive",
      });
      return;
    }

    createCustomer.mutate({
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone,
      address: formData.address || null,
      notes: formData.notes || null,
      points: 0,
      tier: 'bronze',
      total_purchases: 0,
      last_purchase_date: null,
    }, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          notes: "",
        });
      }
    });
  };

  const getTierBadge = (tier: string) => {
    const variants: Record<string, string> = {
      platinum: "bg-purple-500 text-white",
      gold: "bg-warning text-warning-foreground",
      silver: "bg-gray-400 text-white",
      bronze: "bg-orange-600 text-white",
    };
    const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
    return <Badge className={variants[tier] || variants.bronze}>{tierName}</Badge>;
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      customer.phone.includes(searchQuery)
  );

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.last_purchase_date).length;
  const avgSpending = customers.length > 0 
    ? customers.reduce((sum, c) => sum + (c.total_purchases || 0), 0) / customers.length 
    : 0;
  const totalPoints = customers.reduce((sum, c) => sum + (c.points || 0), 0);

  const tierCounts = {
    platinum: customers.filter(c => c.tier === 'platinum').length,
    gold: customers.filter(c => c.tier === 'gold').length,
    silver: customers.filter(c => c.tier === 'silver').length,
    bronze: customers.filter(c => c.tier === 'bronze').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data pelanggan...</p>
        </div>
      </div>
    );
  }

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
                <Label>Nama Lengkap *</Label>
                <Input 
                  placeholder="Nama pelanggan" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  placeholder="email@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>No. Telepon *</Label>
                <Input 
                  placeholder="08123456789" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Alamat</Label>
                <Textarea 
                  placeholder="Alamat lengkap" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Catatan</Label>
                <Textarea 
                  placeholder="Catatan tambahan" 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              <Button 
                className="w-full"
                onClick={handleCreateCustomer}
                disabled={createCustomer.isPending}
              >
                {createCustomer.isPending ? "Menyimpan..." : "Simpan Pelanggan"}
              </Button>
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
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Terdaftar di sistem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelanggan Aktif</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-muted-foreground">{totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0}% dari total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Spending</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {(avgSpending / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">Per pelanggan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalPoints / 1000).toFixed(1)}K</div>
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
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Tidak ada pelanggan. Klik "Tambah Pelanggan" untuk menambahkan pelanggan baru.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {customer.email && (
                              <div className="flex items-center gap-1 text-xs">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>Rp {(customer.total_purchases || 0).toLocaleString()}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            {customer.points || 0}
                          </div>
                        </TableCell>
                        <TableCell>{getTierBadge(customer.tier || 'bronze')}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setIsDetailDialogOpen(true);
                            }}
                          >
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
                    tier: "platinum",
                    min: "Rp 5 Jt",
                    benefits: "Diskon 20%, Birthday voucher Rp 200K",
                    members: tierCounts.platinum,
                  },
                  {
                    tier: "gold",
                    min: "Rp 2 Jt",
                    benefits: "Diskon 15%, Birthday voucher Rp 100K",
                    members: tierCounts.gold,
                  },
                  {
                    tier: "silver",
                    min: "Rp 500K",
                    benefits: "Diskon 10%, Birthday voucher Rp 50K",
                    members: tierCounts.silver,
                  },
                  {
                    tier: "bronze",
                    min: "< Rp 500K",
                    benefits: "Diskon 5%, Collect points",
                    members: tierCounts.bronze,
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

      {/* Customer Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pelanggan</DialogTitle>
            <DialogDescription>
              Informasi lengkap dan riwayat transaksi pelanggan
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Nama Lengkap</Label>
                    <p className="text-lg font-semibold">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">No. Telepon</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  {selectedCustomer.email && (
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{selectedCustomer.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Tier Membership</Label>
                    <div className="mt-2">
                      {getTierBadge(selectedCustomer.tier || 'bronze')}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Loyalty Points</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-5 w-5 fill-warning text-warning" />
                      <p className="text-xl font-bold">{selectedCustomer.points || 0}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Bergabung Sejak</Label>
                    <p className="font-medium">
                      {new Date(selectedCustomer.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        Rp {(selectedCustomer.total_purchases || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Total Belanja</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">-</p>
                      <p className="text-xs text-muted-foreground mt-1">Total Kunjungan</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {selectedCustomer.last_purchase_date 
                          ? new Date(selectedCustomer.last_purchase_date).toLocaleDateString('id-ID')
                          : 'Belum ada'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Kunjungan Terakhir</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Address & Notes */}
              {(selectedCustomer.address || selectedCustomer.notes) && (
                <div className="space-y-3">
                  {selectedCustomer.address && (
                    <div>
                      <Label className="text-muted-foreground">Alamat</Label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                        {selectedCustomer.address}
                      </p>
                    </div>
                  )}
                  {selectedCustomer.notes && (
                    <div>
                      <Label className="text-muted-foreground">Catatan</Label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                        {selectedCustomer.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Tutup
                </Button>
                <Button className="flex-1">
                  Edit Pelanggan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
