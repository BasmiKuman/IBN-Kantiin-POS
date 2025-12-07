import { forwardRef } from "react";

interface ThermalReceiptItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  variant?: string;
}

interface ThermalReceiptProps {
  transactionNumber: string;
  date: Date;
  items: ThermalReceiptItem[];
  subtotal: number;
  tax: number;
  taxRate?: number;
  total: number;
  paymentMethod: string;
  paymentAmount: number;
  changeAmount: number;
  customerName?: string;
  earnedPoints?: number;
  totalPoints?: number;
  paperWidth?: '58mm' | '80mm'; // Default 58mm for Xiaomi Redmi Pad SE
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  cashierName?: string;
}

export const ThermalReceipt = forwardRef<HTMLDivElement, ThermalReceiptProps>(
  (
    {
      transactionNumber,
      date,
      items,
      subtotal,
      tax,
      taxRate = 0,
      total,
      paymentMethod,
      paymentAmount,
      changeAmount,
      customerName,
      earnedPoints,
      totalPoints,
      paperWidth = '58mm', // Default 58mm - optimized for Xiaomi Redmi Pad SE 8.7"
      storeName = 'BK POS',
      storeAddress = '',
      storePhone = '',
      cashierName,
    },
    ref
  ) => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount).replace('Rp', 'Rp');
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date);
    };

    const getPaymentMethodLabel = (method: string) => {
      switch (method.toLowerCase()) {
        case "cash":
        case "tunai":
          return "TUNAI";
        case "qris":
          return "QRIS";
        case "transfer":
          return "TRANSFER";
        default:
          return method.toUpperCase();
      }
    };

    // Fungsi untuk memotong nama produk agar tidak terpotong
    // Optimized untuk Xiaomi Redmi Pad SE dengan thermal printer 58mm
    const wrapName = (name: string, maxLength: number): string[] => {
      if (name.length <= maxLength) return [name];
      
      const words = name.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= maxLength) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          // If single word is too long, force break it
          if (word.length > maxLength) {
            let remaining = word;
            while (remaining.length > maxLength) {
              lines.push(remaining.substring(0, maxLength));
              remaining = remaining.substring(maxLength);
            }
            currentLine = remaining;
          } else {
            currentLine = word;
          }
        }
      });
      if (currentLine) lines.push(currentLine);
      
      return lines;
    };

    // Tentukan lebar berdasarkan paper size
    // Xiaomi Redmi Pad SE 8.7" optimal dengan 58mm (24 chars)
    const maxWidth = paperWidth === '58mm' ? '200px' : '280px';
    const fontSize = paperWidth === '58mm' ? '9px' : '10px';
    const maxChars = paperWidth === '58mm' ? 24 : 32;
    const separator = '='.repeat(maxChars);
    const lightSeparator = '-'.repeat(maxChars);

    return (
      <div ref={ref} className="thermal-receipt">
        <style>{`
          .thermal-receipt {
            font-family: 'Courier New', Courier, monospace;
            font-size: ${fontSize};
            line-height: 1.4;
            color: #000;
            background: #fff;
            max-width: ${maxWidth};
            width: 100%;
            margin: 0 auto;
            padding: 8px;
            box-sizing: border-box;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          
          .thermal-receipt * {
            font-family: 'Courier New', Courier, monospace !important;
            box-sizing: border-box;
          }
          
          .tr-center { text-align: center; }
          .tr-left { text-align: left; }
          .tr-right { text-align: right; }
          .tr-bold { font-weight: bold; }
          .tr-my-1 { margin: 4px 0; }
          .tr-my-2 { margin: 8px 0; }
          
          .tr-separator { 
            margin: 3px 0; 
            text-align: center;
            letter-spacing: -0.5px;
          }
          
          .tr-row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
            gap: 4px;
          }
          
          .tr-row-left {
            flex: 1;
            text-align: left;
          }
          
          .tr-row-right {
            text-align: right;
            white-space: nowrap;
          }
          
          .tr-item {
            margin: 4px 0;
          }
          
          .tr-item-name {
            display: block;
            word-break: break-word;
            margin-bottom: 1px;
          }
          
          .tr-item-detail {
            display: flex;
            justify-content: space-between;
            font-size: ${paperWidth === '58mm' ? '8px' : '9px'};
            margin-left: 4px;
            gap: 4px;
          }

          @media print {
            @page {
              size: ${paperWidth} auto;
              margin: 0;
            }
            
            body * {
              visibility: hidden;
            }
            
            .thermal-receipt,
            .thermal-receipt * {
              visibility: visible;
            }
            
            .thermal-receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: ${paperWidth};
              max-width: ${paperWidth};
              padding: 4mm;
              margin: 0;
            }
          }
        `}</style>

        {/* Header */}
        <div className="tr-separator">{separator}</div>
        <div className="tr-center tr-bold" style={{ fontSize: paperWidth === '58mm' ? '11px' : '13px' }}>
          <div>{storeName}</div>
        </div>
        {(storeAddress || storePhone) && (
          <div className="tr-center" style={{ fontSize: paperWidth === '58mm' ? '7px' : '8px' }}>
            {storeAddress && <div>{storeAddress}</div>}
            {storePhone && <div>Telp: {storePhone}</div>}
          </div>
        )}
        <div className="tr-separator">{separator}</div>

        {/* Transaction Info */}
        <div className="tr-my-1" style={{ fontSize: paperWidth === '58mm' ? '8px' : '9px' }}>
          <div>No: {transactionNumber}</div>
          <div>Tgl: {formatDate(date)}</div>
          {cashierName && <div>Kasir: {cashierName}</div>}
          {customerName && <div>Pelanggan: {customerName}</div>}
        </div>

        <div className="tr-separator">{separator}</div>

        {/* Items - NO "PRODUK" header, start directly with products */}
        <div className="tr-my-1">
          {items.map((item, index) => {
            let itemName = item.name;
            if (item.variant) itemName += ' - ' + item.variant;
            
            const nameLines = wrapName(itemName, maxChars);
            return (
              <div key={index} className="tr-item">
                <div className="tr-item-name">
                  {nameLines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
                <div className="tr-item-detail">
                  <span style={{ flex: 1 }}>  {item.quantity} x {formatCurrency(item.price)}</span>
                  <span className="tr-bold" style={{ whiteSpace: 'nowrap' }}>= {formatCurrency(item.subtotal)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="tr-separator">{lightSeparator}</div>

        {/* Totals */}
        <div className="tr-my-1">
          <div className="tr-row">
            <span className="tr-row-left">Subtotal:</span>
            <span className="tr-row-right">{formatCurrency(subtotal)}</span>
          </div>
          {tax > 0 && (
            <div className="tr-row">
              <span className="tr-row-left">Pajak ({taxRate}%):</span>
              <span className="tr-row-right">{formatCurrency(tax)}</span>
            </div>
          )}
        </div>

        <div className="tr-separator">{separator}</div>
        <div className="tr-row tr-bold" style={{ fontSize: paperWidth === '58mm' ? '10px' : '12px' }}>
          <span className="tr-row-left">TOTAL:</span>
          <span className="tr-row-right">{formatCurrency(total)}</span>
        </div>
        <div className="tr-separator">{separator}</div>

        {/* Payment */}
        <div className="tr-my-1">
          <div className="tr-row">
            <span className="tr-row-left">Metode:</span>
            <span className="tr-row-right tr-bold">{getPaymentMethodLabel(paymentMethod)}</span>
          </div>
          {(paymentMethod.toLowerCase() === "cash" || paymentMethod.toLowerCase() === "tunai") && (
            <>
              <div className="tr-row">
                <span className="tr-row-left">Bayar:</span>
                <span className="tr-row-right">{formatCurrency(paymentAmount)}</span>
              </div>
              <div className="tr-row tr-bold">
                <span className="tr-row-left">Kembalian:</span>
                <span className="tr-row-right">{formatCurrency(changeAmount)}</span>
              </div>
            </>
          )}
        </div>

        {/* Loyalty Points */}
        {earnedPoints && earnedPoints > 0 && (
          <>
            <div className="tr-separator">{separator}</div>
            <div className="tr-center tr-bold" style={{ fontSize: paperWidth === '58mm' ? '9px' : '10px' }}>POIN LOYALTY</div>
            <div className="tr-separator">{separator}</div>
            <div className="tr-my-1">
              <div className="tr-row">
                <span className="tr-row-left">Poin Didapat:</span>
                <span className="tr-row-right tr-bold">+{earnedPoints}</span>
              </div>
              {totalPoints !== undefined && (
                <div className="tr-row">
                  <span className="tr-row-left">Total Poin:</span>
                  <span className="tr-row-right">{totalPoints}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="tr-separator">{separator}</div>
        <div className="tr-center tr-my-2">
          <div className="tr-bold">Terima Kasih!</div>
          <div style={{ fontSize: paperWidth === '58mm' ? '7px' : '8px' }}>
            <div>Barang yang sudah dibeli</div>
            <div>tidak dapat dikembalikan</div>
          </div>
        </div>
        <div className="tr-separator">{separator}</div>
        <div className="tr-center" style={{ fontSize: '7px' }}>
          <div>Powered by BasmiKuman POS</div>
          <div>© {new Date().getFullYear()}</div>
        </div>
      </div>
    );
  }
);

ThermalReceipt.displayName = "ThermalReceipt";
