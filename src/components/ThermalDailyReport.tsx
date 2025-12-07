import { forwardRef } from "react";

interface ProductSales {
  name: string;
  quantity: number;
  revenue: number;
}

interface HourlySales {
  hour: string;
  transactions: number;
  revenue: number;
}

interface ThermalDailyReportProps {
  date: Date;
  cashierName: string;
  shift?: string;
  totalTransactions: number;
  totalRevenue: number;
  avgTransaction: number;
  cashAmount: number;
  cashCount: number;
  qrisAmount: number;
  qrisCount: number;
  transferAmount: number;
  transferCount: number;
  topProducts: ProductSales[];
  hourlySales?: HourlySales[];
  foodRevenue?: number;
  foodCount?: number;
  drinkRevenue?: number;
  drinkCount?: number;
  totalCost?: number;
  profit?: number;
  margin?: number;
  notes?: string[];
  paperWidth?: '58mm' | '80mm';
  storeName?: string;
}

export const ThermalDailyReport = forwardRef<HTMLDivElement, ThermalDailyReportProps>(
  (
    {
      date,
      cashierName,
      shift,
      totalTransactions,
      totalRevenue,
      avgTransaction,
      cashAmount,
      cashCount,
      qrisAmount,
      qrisCount,
      transferAmount,
      transferCount,
      topProducts,
      hourlySales,
      foodRevenue,
      foodCount,
      drinkRevenue,
      drinkCount,
      totalCost,
      profit,
      margin,
      notes,
      paperWidth = '58mm', // Default 58mm - optimized for Xiaomi Redmi Pad SE
      storeName = 'BASMIKUMAN POS',
    },
    ref
  ) => {
    const formatCurrency = (amount: number) => {
      // Simple format to avoid truncation on 58mm thermal printer
      return 'Rp ' + amount;
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "long",
      }).format(date);
    };

    const formatTime = (date: Date) => {
      return new Intl.DateTimeFormat("id-ID", {
        timeStyle: "medium",
      }).format(date);
    };

    // Wrap long product names
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

    const maxWidth = paperWidth === '58mm' ? '200px' : '280px';
    const fontSize = paperWidth === '58mm' ? '9px' : '10px';
    const maxChars = paperWidth === '58mm' ? 24 : 32;
    const separator = '='.repeat(maxChars);
    const lightSeparator = '-'.repeat(maxChars);

    return (
      <div ref={ref} className="thermal-report">
        <style>{`
          .thermal-report {
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
          
          .thermal-report * {
            font-family: 'Courier New', Courier, monospace !important;
            box-sizing: border-box;
          }
          
          .td-center { text-align: center; }
          .td-bold { font-weight: bold; }
          .td-my-1 { margin: 4px 0; }
          .td-my-2 { margin: 8px 0; }
          
          .td-row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
            gap: 4px;
          }
          
          .td-row-left {
            flex: 1;
            text-align: left;
          }
          
          .td-row-right {
            text-align: right;
            white-space: nowrap;
          }
          
          .td-separator {
            margin: 3px 0;
            text-align: center;
            letter-spacing: -0.5px;
          }
          
          .td-product-item {
            margin: 4px 0;
          }

          @media print {
            @page {
              size: ${paperWidth} auto;
              margin: 0;
            }
            
            body * {
              visibility: hidden;
            }
            
            .thermal-report,
            .thermal-report * {
              visibility: visible;
            }
            
            .thermal-report {
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
        <div className="td-separator">{separator}</div>
        <div className="td-center td-bold" style={{ fontSize: paperWidth === '58mm' ? '10px' : '11px' }}>
          <div>LAPORAN HARIAN</div>
          <div>{storeName}</div>
        </div>
        <div className="td-separator">{separator}</div>

        {/* Report Info */}
        <div className="td-my-1" style={{ fontSize: paperWidth === '58mm' ? '8px' : '9px' }}>
          <div>Tanggal: {formatDate(date)}</div>
          <div>Waktu: {formatTime(new Date())}</div>
          <div>Kasir: {cashierName}</div>
          {shift && <div>Shift: {shift}</div>}
        </div>

        {/* Summary */}
        <div className="td-separator">{separator}</div>
        <div className="td-center td-bold">RINGKASAN</div>
        <div className="td-separator">{separator}</div>
        <div className="td-my-1">
          <div className="td-row">
            <span className="td-row-left">Total Transaksi:</span>
            <span className="td-row-right td-bold">{totalTransactions}</span>
          </div>
          <div className="td-row">
            <span className="td-row-left">Total Pendapatan:</span>
            <span className="td-row-right td-bold">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="td-row">
            <span className="td-row-left">Rata-rata/Trx:</span>
            <span className="td-row-right">{formatCurrency(avgTransaction)}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="td-separator">{separator}</div>
        <div className="td-center td-bold">METODE BAYAR</div>
        <div className="td-separator">{separator}</div>
        <div className="td-my-1" style={{ fontSize: paperWidth === '58mm' ? '8px' : '9px' }}>
          <div className="td-row">
            <span className="td-row-left">Tunai ({cashCount}x)</span>
            <span className="td-row-right">{formatCurrency(cashAmount)}</span>
          </div>
          <div className="td-row">
            <span className="td-row-left">QRIS ({qrisCount}x)</span>
            <span className="td-row-right">{formatCurrency(qrisAmount)}</span>
          </div>
          <div className="td-row">
            <span className="td-row-left">Transfer ({transferCount}x)</span>
            <span className="td-row-right">{formatCurrency(transferAmount)}</span>
          </div>
        </div>

        {/* Top Products */}
        <div className="td-separator">{separator}</div>
        <div className="td-center td-bold">TOP PRODUK</div>
        <div className="td-separator">{separator}</div>
        <div className="td-my-1">
          {topProducts.slice(0, paperWidth === '58mm' ? 5 : 10).map((product, index) => {
            const nameLines = wrapName(product.name, maxChars - 3);
            return (
              <div key={index} className="td-product-item">
                <div className="td-bold">
                  {nameLines.map((line, i) => (
                    <div key={i}>{i === 0 ? `${index + 1}. ${line}` : `   ${line}`}</div>
                  ))}
                </div>
                <div className="td-row" style={{ fontSize: paperWidth === '58mm' ? '7px' : '8px', marginLeft: '8px' }}>
                  <span className="td-row-left">  {product.quantity} pcs</span>
                  <span className="td-row-right">{formatCurrency(product.revenue)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hourly Sales - only for 80mm */}
        {hourlySales && hourlySales.length > 0 && paperWidth === '80mm' && (
          <>
            <div className="td-separator">{separator}</div>
            <div className="td-center td-bold">REKAP PER JAM</div>
            <div className="td-separator">{separator}</div>
            <div className="td-my-1" style={{ fontSize: '8px' }}>
              {hourlySales.map((hour, index) => (
                <div key={index} className="td-row">
                  <span style={{ flex: '0 0 auto' }}>{hour.hour}</span>
                  <span style={{ flex: '0 0 auto', marginLeft: '4px' }}>{hour.transactions}x</span>
                  <span className="td-row-right">{formatCurrency(hour.revenue)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Category Breakdown */}
        {(foodRevenue || drinkRevenue) && (
          <>
            <div className="td-separator">{separator}</div>
            <div className="td-center td-bold">KATEGORI</div>
            <div className="td-separator">{separator}</div>
            <div className="td-my-1">
              {foodRevenue && foodRevenue > 0 && (
                <div className="td-row">
                  <span className="td-row-left">Makanan ({foodCount}x)</span>
                  <span className="td-row-right">{formatCurrency(foodRevenue)}</span>
                </div>
              )}
              {drinkRevenue && drinkRevenue > 0 && (
                <div className="td-row">
                  <span className="td-row-left">Minuman ({drinkCount}x)</span>
                  <span className="td-row-right">{formatCurrency(drinkRevenue)}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Profit */}
        {profit !== undefined && totalCost !== undefined && (
          <>
            <div className="td-separator">{separator}</div>
            <div className="td-center td-bold">PROFIT</div>
            <div className="td-separator">{separator}</div>
            <div className="td-my-1">
              <div className="td-row">
                <span className="td-row-left">Modal:</span>
                <span className="td-row-right">{formatCurrency(totalCost)}</span>
              </div>
              <div className="td-row">
                <span className="td-row-left">Profit Kotor:</span>
                <span className="td-row-right td-bold">{formatCurrency(profit)}</span>
              </div>
              {margin !== undefined && (
                <div className="td-row">
                  <span className="td-row-left">Margin:</span>
                  <span className="td-row-right">{margin.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Notes */}
        {notes && notes.length > 0 && (
          <>
            <div className="td-separator">{separator}</div>
            <div className="td-center td-bold">CATATAN</div>
            <div className="td-separator">{separator}</div>
            <div className="td-my-1" style={{ fontSize: paperWidth === '58mm' ? '7px' : '8px' }}>
              {notes.map((note, index) => {
                const noteLines = wrapName(`- ${note}`, maxChars);
                return (
                  <div key={index} style={{ marginBottom: '4px' }}>
                    {noteLines.map((line, i) => (
                      <div key={i}>{i === 0 ? line : `  ${line}`}</div>
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="td-separator">{separator}</div>
        <div className="td-center td-my-1">
          <div className="td-bold">Laporan Valid</div>
          <div style={{ fontSize: '7px' }}>Dicetak Otomatis</div>
        </div>
        <div className="td-separator">{separator}</div>
        <div className="td-center" style={{ fontSize: '7px' }}>
          <div>Powered by BasmiKuman POS</div>
          <div>© {new Date().getFullYear()}</div>
        </div>
      </div>
    );
  }
);

ThermalDailyReport.displayName = "ThermalDailyReport";
