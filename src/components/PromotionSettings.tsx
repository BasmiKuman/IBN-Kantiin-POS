import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion } from "@/hooks/supabase/usePromotions";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface PromotionFormData {
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y';
  value: number;
  min_purchase: number;
  max_discount?: number;
  start_date: string;
  end_date: string;
  usage_limit?: number;
  is_active: boolean;
}

export function PromotionSettings() {
  const { data: promotions, isLoading } = usePromotions();
  const { mutate: createPromotion, isPending: isCreating } = useCreatePromotion();
  const { mutate: updatePromotion, isPending: isUpdating } = useUpdatePromotion();
  const { mutate: deletePromotion, isPending: isDeleting } = useDeletePromotion();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  const [formData, setFormData] = useState<PromotionFormData>({
    code: "",
    name: "",
    description: "",
    type: "percentage",
    value: 0,
    min_purchase: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      type: "percentage",
      value: 0,
      min_purchase: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_active: true,
    });
    setEditingPromotion(null);
  };

  const handleOpenDialog = (promotion?: any) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        code: promotion.code,
        name: promotion.name,
        description: promotion.description || "",
        type: promotion.type,
        value: promotion.value,
        min_purchase: promotion.min_purchase || 0,
        max_discount: promotion.max_discount,
        start_date: new Date(promotion.start_date).toISOString().split('T')[0],
        end_date: new Date(promotion.end_date).toISOString().split('T')[0],
        usage_limit: promotion.usage_limit,
        is_active: promotion.is_active,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.name || formData.value <= 0) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...formData,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
      max_discount: formData.max_discount || null,
      usage_limit: formData.usage_limit || null,
    };

    if (editingPromotion) {
      updatePromotion(
        { id: editingPromotion.id, data: payload },
        {
          onSuccess: () => {
            toast({
              title: "Berhasil",
              description: "Promosi berhasil diupdate",
            });
            handleCloseDialog();
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: error.message || "Gagal mengupdate promosi",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      createPromotion(payload, {
        onSuccess: () => {
          toast({
            title: "Berhasil",
            description: "Promosi berhasil dibuat",
          });
          handleCloseDialog();
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Gagal membuat promosi",
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleDelete = (promotionId: string) => {
    if (!confirm("Yakin ingin menghapus promosi ini?")) return;

    deletePromotion(promotionId, {
      onSuccess: () => {
        toast({
          title: "Berhasil",
          description: "Promosi berhasil dihapus",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Gagal menghapus promosi",
          variant: "destructive",
        });
      },
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Kelola Promosi</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus promosi dan diskon untuk pelanggan
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Promosi
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Min. Pembelian</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Penggunaan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!promotions || promotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Belum ada promosi. Klik tombol "Tambah Promosi" untuk membuat promosi baru.
                  </TableCell>
                </TableRow>
              ) : (
                promotions.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-medium">{promo.code}</TableCell>
                    <TableCell>{promo.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {promo.type === 'percentage' ? 'Persentase' : 
                         promo.type === 'fixed' ? 'Nominal' : 'Beli X Dapat Y'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {promo.type === 'percentage' 
                        ? `${promo.value}%` 
                        : formatCurrency(promo.value)}
                    </TableCell>
                    <TableCell>
                      {promo.min_purchase > 0 ? formatCurrency(promo.min_purchase) : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(promo.start_date), 'd MMM yyyy', { locale: localeId })}
                      {' - '}
                      {format(new Date(promo.end_date), 'd MMM yyyy', { locale: localeId })}
                    </TableCell>
                    <TableCell>
                      {promo.usage_count || 0}
                      {promo.usage_limit ? ` / ${promo.usage_limit}` : ''}
                    </TableCell>
                    <TableCell>
                      <Badge variant={promo.is_active ? "default" : "secondary"}>
                        {promo.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenDialog(promo)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(promo.id)}
                          disabled={isDeleting}
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
        </div>
      </CardContent>

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion ? "Edit Promosi" : "Tambah Promosi Baru"}
            </DialogTitle>
            <DialogDescription>
              Lengkapi informasi promosi di bawah ini
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Kode Promo *</Label>
                <Input
                  id="code"
                  placeholder="DISKON10"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nama Promosi *</Label>
                <Input
                  id="name"
                  placeholder="Diskon 10%"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Deskripsi promosi..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipe Promosi *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Persentase (%)</SelectItem>
                    <SelectItem value="fixed">Nominal (Rp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">
                  Nilai {formData.type === 'percentage' ? '(%)' : '(Rp)'} *
                </Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step={formData.type === 'percentage' ? '1' : '1000'}
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_purchase">Min. Pembelian (Rp)</Label>
                <Input
                  id="min_purchase"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.min_purchase}
                  onChange={(e) =>
                    setFormData({ ...formData, min_purchase: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_discount">Max. Diskon (Rp)</Label>
                <Input
                  id="max_discount"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.max_discount || ''}
                  onChange={(e) =>
                    setFormData({ 
                      ...formData, 
                      max_discount: e.target.value ? parseFloat(e.target.value) : undefined 
                    })
                  }
                  placeholder="Opsional"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Tanggal Mulai *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Tanggal Berakhir *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage_limit">Batas Penggunaan</Label>
              <Input
                id="usage_limit"
                type="number"
                min="0"
                value={formData.usage_limit || ''}
                onChange={(e) =>
                  setFormData({ 
                    ...formData, 
                    usage_limit: e.target.value ? parseInt(e.target.value) : undefined 
                  })
                }
                placeholder="Kosongkan untuk unlimited"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="is_active">Aktifkan Promosi</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Batal
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isCreating || isUpdating}
            >
              {(isCreating || isUpdating) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingPromotion ? "Update" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
