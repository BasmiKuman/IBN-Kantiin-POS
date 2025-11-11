import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { ProductVariant } from "@/hooks/supabase/useProductVariants";
import { formatCurrency } from "@/lib/utils";

interface VariantSelectorProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  variants: ProductVariant[];
  onSelect: (variant: ProductVariant) => void;
}

export function VariantSelector({
  open,
  onClose,
  productName,
  variants,
  onSelect,
}: VariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const handleSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  const handleConfirm = () => {
    if (selectedVariant) {
      onSelect(selectedVariant);
      setSelectedVariant(null);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedVariant(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pilih Varian</DialogTitle>
          <DialogDescription>{productName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => handleSelect(variant)}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                selectedVariant?.id === variant.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedVariant?.id === variant.id
                      ? "border-primary bg-primary"
                      : "border-border"
                  }`}
                >
                  {selectedVariant?.id === variant.id && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-medium">{variant.name}</p>
                  {variant.sku_suffix && (
                    <p className="text-xs text-muted-foreground">
                      SKU: {variant.sku_suffix}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className="text-base font-semibold">
                {formatCurrency(variant.price)}
              </Badge>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedVariant}
            className="flex-1"
          >
            Tambahkan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
