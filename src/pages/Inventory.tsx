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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/supabase/useProducts";
import { useCategories, useCreateCategory } from "@/hooks/supabase/useCategories";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    sku: "",
    price: "",
    cost: "",
    stock: "",
    min_stock: "",
    description: "",
  });

  const { toast } = useToast();
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const createCategory = useCreateCategory();

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProduct = async () => {
    if (!formData.name || !formData.category_id || !formData.sku || !formData.price) {
      toast({
        title: "Error",
        description: "Mohon isi semua field yang wajib",
        variant: "destructive",
      });
      return;
    }

    createProduct.mutate({
      name: formData.name,
      category_id: formData.category_id,
      sku: formData.sku,
      price: parseFloat(formData.price),
      cost: formData.cost ? parseFloat(formData.cost) : 0,
      stock: formData.stock ? parseInt(formData.stock) : 0,
      min_stock: formData.min_stock ? parseInt(formData.min_stock) : 0,
      description: formData.description || null,
    }, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        setFormData({
          name: "",
          category_id: "",
          sku: "",
          price: "",
          cost: "",
          stock: "",
          min_stock: "",
          description: "",
        });
      }
    });
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    updateProduct.mutate({
      id: editingProduct.id,
      name: formData.name,
      category_id: formData.category_id,
      sku: formData.sku,
      price: parseFloat(formData.price),
      cost: formData.cost ? parseFloat(formData.cost) : 0,
      stock: formData.stock ? parseInt(formData.stock) : 0,
      min_stock: formData.min_stock ? parseInt(formData.min_stock) : 0,
      description: formData.description || null,
    }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setEditingProduct(null);
        setFormData({
          name: "",
          category_id: "",
          sku: "",
          price: "",
          cost: "",
          stock: "",
          min_stock: "",
          description: "",
        });
      }
    });
  };

  const handleEditClick = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category_id: product.category_id || "",
      sku: product.sku,
      price: product.price.toString(),
      cost: product.cost?.toString() || "",
      stock: product.stock.toString(),
      min_stock: product.min_stock?.toString() || "",
      description: product.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      deleteProduct.mutate(id);
    }
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Nama kategori tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    createCategory.mutate(
      { name: newCategoryName.trim(), description: null },
      {
        onSuccess: (data: any) => {
          toast({
            title: "Kategori Berhasil Ditambahkan",
            description: `Kategori "${newCategoryName}" telah dibuat`,
          });
          setNewCategoryName("");
          setIsCategoryDialogOpen(false);
          // Auto-select kategori yang baru dibuat
          if (data && data.id) {
            setFormData({ ...formData, category_id: data.id });
          }
        },
      }
    );
  };

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.min_stock && p.stock <= p.min_stock).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  const getStatusBadge = (product: any) => {
    if (!product.min_stock) return <Badge className="bg-success text-success-foreground">Normal</Badge>;
    
    if (product.stock === 0) {
      return <Badge variant="destructive">Habis</Badge>;
    } else if (product.stock <= product.min_stock * 0.5) {
      return <Badge variant="destructive">Kritis</Badge>;
    } else if (product.stock <= product.min_stock) {
      return <Badge className="bg-warning text-warning-foreground">Rendah</Badge>;
    }
    return <Badge className="bg-success text-success-foreground">Normal</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data produk...</p>
        </div>
      </div>
    );
  }

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
                <Label>Nama Produk *</Label>
                <Input 
                  placeholder="Contoh: Nasi Goreng" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Kategori *</Label>
                    <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" size="sm" variant="ghost" className="h-6 px-2">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Kategori Baru</DialogTitle>
                          <DialogDescription>Buat kategori baru untuk produk Anda</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Nama Kategori</Label>
                            <Input 
                              placeholder="Contoh: Makanan, Minuman" 
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleCreateCategory();
                                }
                              }}
                            />
                          </div>
                          <Button 
                            className="w-full"
                            onClick={handleCreateCategory}
                            disabled={createCategory.isPending}
                          >
                            {createCategory.isPending ? "Menyimpan..." : "Simpan Kategori"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>SKU *</Label>
                  <Input 
                    placeholder="FOOD-001" 
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Harga Jual *</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Harga Modal</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stok Awal</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min. Stok</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={formData.min_stock}
                    onChange={(e) => setFormData({...formData, min_stock: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Input 
                  placeholder="Deskripsi produk" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleCreateProduct}
                disabled={createProduct.isPending}
              >
                {createProduct.isPending ? "Menyimpan..." : "Simpan Produk"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
            <DialogDescription>Update informasi produk</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Produk *</Label>
              <Input 
                placeholder="Contoh: Nasi Goreng" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Kategori *</Label>
                  <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" size="sm" variant="ghost" className="h-6 px-2">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambah Kategori Baru</DialogTitle>
                        <DialogDescription>Buat kategori baru untuk produk Anda</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nama Kategori</Label>
                          <Input 
                            placeholder="Contoh: Makanan, Minuman" 
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreateCategory();
                              }
                            }}
                          />
                        </div>
                        <Button 
                          className="w-full"
                          onClick={handleCreateCategory}
                          disabled={createCategory.isPending}
                        >
                          {createCategory.isPending ? "Menyimpan..." : "Simpan Kategori"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>SKU *</Label>
                <Input 
                  placeholder="FOOD-001" 
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harga Jual *</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Modal</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stok</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Min. Stok</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={formData.min_stock}
                  onChange={(e) => setFormData({...formData, min_stock: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input 
                placeholder="Deskripsi produk" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleUpdateProduct}
              disabled={updateProduct.isPending}
            >
              {updateProduct.isPending ? "Menyimpan..." : "Update Produk"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">{categories.length} kategori</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Perlu restock segera</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Inventori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {(totalValue / 1000000).toFixed(1)} Jt</div>
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
          {lowStockCount > 0 && (
            <div className="mb-4 rounded-lg border border-warning bg-warning/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning" />
                <div>
                  <h4 className="font-medium text-warning">Perhatian Stok!</h4>
                  <p className="text-sm text-muted-foreground">
                    {lowStockCount} produk memiliki stok rendah atau kritis. Segera lakukan pemesanan ulang.
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
                <TableHead>SKU</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Tidak ada produk. Klik "Tambah Produk" untuk menambahkan produk baru.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.categories?.name || "-"}</TableCell>
                    <TableCell><Badge variant="outline">{product.sku}</Badge></TableCell>
                    <TableCell>{product.stock} pcs</TableCell>
                    <TableCell>Rp {product.price.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(product)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="outline" onClick={() => handleEditClick(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="destructive"
                          onClick={() => handleDeleteClick(product.id)}
                          disabled={deleteProduct.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
