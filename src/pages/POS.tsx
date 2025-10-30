import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const products = [
    { id: 1, name: "Nasi Goreng", price: 15000, category: "Makanan" },
    { id: 2, name: "Mie Goreng", price: 15000, category: "Makanan" },
    { id: 3, name: "Ayam Bakar", price: 25000, category: "Makanan" },
    { id: 4, name: "Es Teh Manis", price: 5000, category: "Minuman" },
    { id: 5, name: "Kopi Susu", price: 8000, category: "Minuman" },
    { id: 6, name: "Jus Jeruk", price: 10000, category: "Minuman" },
    { id: 7, name: "Sate Ayam", price: 20000, category: "Makanan" },
    { id: 8, name: "Gado-gado", price: 15000, category: "Makanan" },
  ];

  const addToCart = (product: typeof products[0]) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, change: number) => {
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Produk</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="makanan">Makanan</TabsTrigger>
                <TabsTrigger value="minuman">Minuman</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-0">
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="cursor-pointer transition-all hover:shadow-md"
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square mb-2 flex items-center justify-center rounded-lg bg-muted">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium">{product.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm font-semibold text-primary">
                            Rp {product.price.toLocaleString()}
                          </p>
                          <Badge variant="secondary">{product.category}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="makanan">
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {filteredProducts
                    .filter((p) => p.category === "Makanan")
                    .map((product) => (
                      <Card
                        key={product.id}
                        className="cursor-pointer transition-all hover:shadow-md"
                        onClick={() => addToCart(product)}
                      >
                        <CardContent className="p-4">
                          <div className="aspect-square mb-2 flex items-center justify-center rounded-lg bg-muted">
                            <Package className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm font-semibold text-primary mt-2">
                            Rp {product.price.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="minuman">
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {filteredProducts
                    .filter((p) => p.category === "Minuman")
                    .map((product) => (
                      <Card
                        key={product.id}
                        className="cursor-pointer transition-all hover:shadow-md"
                        onClick={() => addToCart(product)}
                      >
                        <CardContent className="p-4">
                          <div className="aspect-square mb-2 flex items-center justify-center rounded-lg bg-muted">
                            <Package className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm font-semibold text-primary mt-2">
                            Rp {product.price.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Keranjang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-[300px] space-y-2 overflow-auto">
              {cart.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Keranjang kosong
                </p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Rp {item.price.toLocaleString()} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-7 w-7"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pajak (10%)</span>
                <span>Rp {tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">Rp {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button className="w-full" size="lg" disabled={cart.length === 0}>
                <CreditCard className="mr-2 h-4 w-4" />
                Kartu Debit/Kredit
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                size="lg"
                disabled={cart.length === 0}
              >
                <Banknote className="mr-2 h-4 w-4" />
                Tunai
              </Button>
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                disabled={cart.length === 0}
              >
                <Smartphone className="mr-2 h-4 w-4" />
                E-Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Package({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
