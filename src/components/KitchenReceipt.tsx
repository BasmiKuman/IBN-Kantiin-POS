import { forwardRef } from "react";

interface KitchenReceiptItem {
  name: string;
  quantity: number;
}

interface KitchenReceiptProps {
  orderNumber: string;
  date: Date;
  items: KitchenReceiptItem[];
  customerName?: string;
  notes?: string;
}

export const KitchenReceipt = forwardRef<HTMLDivElement, KitchenReceiptProps>(
  (
    {
      orderNumber,
      date,
      items,
      customerName,
      notes,
    },
    ref
  ) => {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date);
    };

    return (
      <div ref={ref} className="kitchen-receipt-container bg-white p-6 text-black">
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .kitchen-receipt-container, .kitchen-receipt-container * {
              visibility: visible;
            }
            .kitchen-receipt-container {
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
          <p className="text-lg font-bold text-red-600">STRUK DAPUR</p>
        </div>

        <div className="text-xs mb-3 space-y-1">
          <div className="flex justify-between">
            <span>No. Order:</span>
            <span className="font-bold text-lg">{orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal:</span>
            <span>{formatDate(date)}</span>
          </div>
          {customerName && (
            <div className="flex justify-between">
              <span>Nama:</span>
              <span className="font-bold">{customerName}</span>
            </div>
          )}
        </div>

        <div className="border-t-2 border-b-2 border-gray-800 py-3 mb-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="text-left pb-2 font-bold">Item</th>
                <th className="text-center pb-2 w-16 font-bold">Qty</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-gray-400">
                  <td className="py-3 font-medium text-base">{item.name}</td>
                  <td className="text-center py-3 font-bold text-lg">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {notes && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-300 rounded">
            <p className="text-xs font-bold mb-1">CATATAN:</p>
            <p className="text-sm">{notes}</p>
          </div>
        )}

        <div className="text-center text-xs border-t-2 border-dashed border-gray-400 pt-3">
          <p className="text-lg font-bold">TOTAL: {items.reduce((sum, item) => sum + item.quantity, 0)} ITEM</p>
          <p className="mt-2 text-gray-600">Segera Proses Pesanan Ini</p>
        </div>

        <div className="text-center text-xs mt-4 text-gray-400">
          <p>{formatDate(date)}</p>
        </div>
      </div>
    );
  }
);

KitchenReceipt.displayName = "KitchenReceipt";
