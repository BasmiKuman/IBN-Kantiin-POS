import { formatCurrency } from '@/lib/formatters/sharedHelpers';
import type { ReceiptData } from '@/lib/receiptFormatter';

interface ReceiptPreviewProps {
  data: ReceiptData;
  type: 'cashier' | 'kitchen';
}

export function ReceiptPreview({ data, type }: ReceiptPreviewProps) {
  const settings = {
    header: localStorage.getItem('receipt_header') || 'BK POS',
    tagline: localStorage.getItem('receipt_tagline') || 'Kantin Terbaik',
    footer: localStorage.getItem('receipt_footer') || 'Terima kasih atas kunjungan Anda',
    address: localStorage.getItem('store_address') || 'Jl. Contoh No. 123',
    phone: localStorage.getItem('store_phone') || '0812-3456-7890',
  };

  return (
    <div className="receipt-preview bg-white text-black p-6 font-mono text-sm max-w-[320px] mx-auto border-2 border-dashed border-gray-300 rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-3 mb-3">
        <div className="text-xl font-bold mb-1">{settings.header}</div>
        <div className="text-xs">{settings.tagline}</div>
        <div className="text-xs mt-2">{settings.address}</div>
        {settings.phone && <div className="text-xs">Telp: {settings.phone}</div>}
      </div>

      {/* Order Info */}
      <div className="border-b border-gray-400 pb-2 mb-3">
        <div className="flex justify-between">
          <span className="font-bold">Order #{data.orderNumber}</span>
          <span className="text-xs">{new Date(data.date).toLocaleString('id-ID')}</span>
        </div>
        {data.cashierName && (
          <div className="text-xs mt-1">Kasir: {data.cashierName}</div>
        )}
        {data.customerName && (
          <div className="text-xs">Customer: {data.customerName}</div>
        )}
      </div>

      {/* Items */}
      <div className="mb-3">
        <div className="font-bold text-center mb-2 border-b border-gray-300 pb-1">
          {type === 'kitchen' ? 'PESANAN DAPUR' : 'DETAIL PESANAN'}
        </div>
        
        {data.items.map((item, idx) => (
          <div key={idx} className="mb-3 border-b border-dotted border-gray-300 pb-2">
            <div className="font-semibold">
              {item.name}
              {item.variant && <span className="text-xs"> ({item.variant})</span>}
            </div>
            {item.notes && (
              <div className="text-xs text-gray-600 italic ml-2">* {item.notes}</div>
            )}
            {type === 'cashier' && (
              <div className="flex justify-between mt-1 text-xs">
                <span className="ml-2">
                  {item.quantity} x {formatCurrency(item.price)}
                </span>
                <span className="font-semibold">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            )}
            {type === 'kitchen' && (
              <div className="text-lg font-bold ml-2">Qty: {item.quantity}</div>
            )}
          </div>
        ))}
      </div>

      {/* Totals - only for cashier */}
      {type === 'cashier' && (
        <div className="border-t-2 border-black pt-2 mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Subtotal:</span>
            <span>{formatCurrency(data.subtotal)}</span>
          </div>
          {data.tax > 0 && (
            <div className="flex justify-between text-sm mb-1">
              <span>Pajak:</span>
              <span>{formatCurrency(data.tax)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-2 mt-2">
            <span>TOTAL:</span>
            <span>{formatCurrency(data.total)}</span>
          </div>
          
          {/* Payment Method */}
          <div className="mt-3 text-center">
            <div className="inline-block bg-gray-800 text-white px-4 py-1 rounded">
              Pembayaran: {data.paymentMethod === 'cash' ? 'Tunai' : 
                          data.paymentMethod === 'qris' ? 'QRIS' :
                          data.paymentMethod === 'transfer' ? 'Transfer' : 
                          data.paymentMethod}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center border-t border-gray-400 pt-3 mt-3 text-xs">
        <div className="mb-2">{settings.footer}</div>
        <div className="font-semibold">Terima kasih!</div>
      </div>
    </div>
  );
}
