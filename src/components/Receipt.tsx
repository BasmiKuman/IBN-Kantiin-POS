import { forwardRef } from "react";

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface ReceiptProps {
  transactionNumber: string;
  date: Date;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  taxRate?: number;
  serviceCharge?: number;
  total: number;
  paymentMethod: string;
  paymentAmount: number;
  changeAmount: number;
  customerName?: string;
  customerPoints?: number;
  earnedPoints?: number;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  (
    {
      transactionNumber,
      date,
      items,
      subtotal,
      tax,
      taxRate = 0,
      serviceCharge = 0,
      total,
      paymentMethod,
      paymentAmount,
      changeAmount,
      customerName,
      customerPoints,
      earnedPoints,
    },
    ref
  ) => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date);
    };

    const getPaymentMethodLabel = (method: string) => {
      switch (method) {
        case "cash":
          return "TUNAI";
        case "qris":
          return "QRIS";
        case "transfer":
          return "TRANSFER BANK";
        default:
          return method.toUpperCase();
      }
    };

    return (
      <div ref={ref} className="receipt-container bg-white p-6 text-black">
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .receipt-container, .receipt-container * {
              visibility: visible;
            }
            .receipt-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 80mm;
              padding: 10mm;
            }
            @page {
              size: 80mm auto;
              margin: 0;
            }
          }
        `}</style>

        <div className="text-center border-b-2 border-dashed border-gray-400 pb-3 mb-3">
          <h1 className="text-2xl font-bold mb-1">BASMIKUMAN POS</h1>
          <p className="text-xs mt-1">Jl. Contoh No. 123, Kota</p>
          <p className="text-xs">Telp: (021) 12345678</p>
        </div>

        <div className="text-xs mb-3 space-y-1">
          <div className="flex justify-between">
            <span>No. Transaksi:</span>
            <span className="font-bold">{transactionNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal:</span>
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir:</span>
            <span>{localStorage.getItem("username") || "Kasir"}</span>
          </div>
          {customerName && (
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <span className="font-medium">{customerName}</span>
            </div>
          )}
        </div>

        <div className="border-t-2 border-b-2 border-dashed border-gray-400 py-3 mb-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left pb-2">Item</th>
                <th className="text-center pb-2 w-16">Qty</th>
                <th className="text-right pb-2 w-20">Harga</th>
                <th className="text-right pb-2 w-24">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2">{item.name}</td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-right py-2">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="text-right py-2 font-medium">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-xs space-y-1 mb-3">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {tax > 0 && taxRate > 0 && (
            <div className="flex justify-between">
              <span>Pajak ({taxRate}%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}
          {serviceCharge > 0 && (
            <div className="flex justify-between">
              <span>Biaya Layanan:</span>
              <span>{formatCurrency(serviceCharge)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold border-t-2 border-gray-400 pt-2 mt-2">
            <span>TOTAL:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="text-xs space-y-1 border-t-2 border-dashed border-gray-400 pt-3 mb-3">
          <div className="flex justify-between font-medium">
            <span>Metode Bayar:</span>
            <span>{getPaymentMethodLabel(paymentMethod)}</span>
          </div>
          {paymentMethod === "cash" && (
            <>
              <div className="flex justify-between">
                <span>Bayar:</span>
                <span>{formatCurrency(paymentAmount)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Kembalian:</span>
                <span>{formatCurrency(changeAmount)}</span>
              </div>
            </>
          )}
        </div>

        {earnedPoints && earnedPoints > 0 && (
          <div className="text-xs bg-gray-100 p-2 rounded mb-3">
            <div className="flex justify-between font-medium">
              <span>Poin Didapat:</span>
              <span className="text-green-600">+{earnedPoints} poin</span>
            </div>
            {customerPoints !== undefined && (
              <div className="flex justify-between text-gray-600">
                <span>Total Poin:</span>
                <span>{customerPoints} poin</span>
              </div>
            )}
          </div>
        )}

        <div className="text-center text-xs border-t-2 border-dashed border-gray-400 pt-3">
          <p className="font-medium mb-2">Terima Kasih!</p>
          <p className="text-gray-600">Barang yang sudah dibeli</p>
          <p className="text-gray-600">tidak dapat dikembalikan</p>
        </div>

        <div className="text-center text-xs mt-4 text-gray-400">
          <p>Powered by BasmiKuman POS System</p>
          <p>© {new Date().getFullYear()} BasmiKuman</p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = "Receipt";
