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
import { Label } from "@/components/ui/label";
import { Search, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const products = [
    {
      id: 1,
      name: "Nasi Goreng Spesial",
      category: "Makanan",
      stock: 50,
      unit: "porsi",
      price: 15000,
      supplier: "Dapur Utama",
      status: "normal",
    },
    {
      id: 2,
      name: "Es Teh Manis",
      category: "Minuman",
      stock: 100,
      unit: "gelas",
      price: 5000,
      supplier: "Supplier Minuman",
      status: "normal",
    },
    {
      id: 3,
      name: "Ayam Bakar",
      category: "Makanan",
      stock: 8,
      unit: "porsi",
      price: 25000,
      supplier: "Dapur Utama",
      status: "low",
    },
    {
      id: 4,
      name: "Kopi Susu",
      category: "Minuman",
      stock: 45,
      unit: "gelas",
      price: 8000,
      supplier: "Supplier Kopi",
      status: "normal",
    },
    {
      id: 5,
      name: "Beras Premium",
      category: "Bahan Baku",
      stock: 5,
      unit: "kg",
      price: 15000,
      supplier: "Toko Sembako",
      status: "critical",
    },
  ];

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return <Badge variant="destructive">Kritis</Badge>;
      case "low":
        return <Badge className="bg-warning text-warning-foreground">Rendah</Badge>;
      default:
        return <Badge className="bg-success text-success-foreground">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Inventori</h2>
          <p className="text-muted-foreground">Kelola stok produk dan bahan baku</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
              <DialogDescription>Masukkan detail produk yang ingin ditambahkan</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Produk</Label>
                <Input placeholder="Contoh: Nasi Goreng" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Input placeholder="Makanan/Minuman" />
                </div>
                <div className="space-y-2">
                  <Label>Stok</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input placeholder="porsi/gelas/kg" />
                </div>
                <div className="space-y-2">
                  <Label>Harga</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Input placeholder="Nama supplier" />
              </div>
              <Button className="w-full">Simpan Produk</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">208</div>
            <p className="text-xs text-muted-foreground">5 kategori berbeda</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">12</div>
            <p className="text-xs text-muted-foreground">Perlu restock segera</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Inventori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 45.8 Jt</div>
            <p className="text-xs text-muted-foreground">Total nilai stok</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Produk</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts.some((p) => p.status !== "normal") && (
            <div className="mb-4 rounded-lg border border-warning bg-warning/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning" />
                <div>
                  <h4 className="font-medium text-warning">Perhatian Stok!</h4>
                  <p className="text-sm text-muted-foreground">
                    Beberapa produk memiliki stok rendah atau kritis. Segera lakukan pemesanan
                    ulang.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    {product.stock} {product.unit}
                  </TableCell>
                  <TableCell>Rp {product.price.toLocaleString()}</TableCell>
                  <TableCell>{product.supplier}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="outline">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
