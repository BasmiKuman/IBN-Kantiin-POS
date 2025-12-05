interface ProductSalesReportPreviewProps {
  period: string;
  startDate?: string;
  endDate?: string;
  products: Array<{
    product_name: string;
    total_quantity: number;
    total_revenue: number;
  }>;
  totalItems: number;
  totalRevenue: number;
  cashierName?: string;
}

export function ProductSalesReportPreview({ 
  period, 
  startDate, 
  endDate, 
  products, 
  totalItems, 
  totalRevenue,
  cashierName 
}: ProductSalesReportPreviewProps) {
  return (
    <div className="receipt-preview bg-white text-black p-6 font-mono text-sm max-w-[400px] mx-auto border-2 border-dashed border-gray-300 rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-3 mb-3">
        <div className="text-xl font-bold mb-1">BK POS</div>
        <div className="text-lg font-semibold mt-2">LAPORAN PENJUALAN</div>
        <div className="text-base font-semibold">PRODUK</div>
      </div>

      {/* Period */}
      <div className="border-b border-gray-400 pb-2 mb-3 text-xs">
        <div>Periode: {period}</div>
        {startDate && endDate && (
          <>
            <div>Dari: {new Date(startDate).toLocaleDateString('id-ID')}</div>
            <div>Sampai: {new Date(endDate).toLocaleDateString('id-ID')}</div>
          </>
        )}
      </div>

      {/* Products List */}
      <div className="mb-3">
        <div className="font-bold text-center mb-2 border-b border-gray-300 pb-1">
          DETAIL PRODUK
        </div>
        
        {products.map((product, idx) => {
          const hargaSatuan = product.total_quantity > 0 
            ? Math.round(product.total_revenue / product.total_quantity)
            : 0;
          
          return (
            <div key={idx} className="mb-2 pb-2 border-b border-dotted border-gray-300">
              <div className="font-semibold">{product.product_name}</div>
              <div className="text-xs mt-1 flex justify-between">
                <span>{product.total_quantity} x Rp{hargaSatuan.toLocaleString('id-ID')}</span>
                <span className="font-semibold">
                  Rp{product.total_revenue.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="border-t-2 border-black pt-2 mb-3">
        <div className="font-bold text-center mb-2">RINGKASAN PENJUALAN</div>
        
        <div className="flex justify-between text-sm mb-1">
          <span>Total Jenis Produk:</span>
          <span className="font-semibold">{products.length}</span>
        </div>
        
        <div className="flex justify-between text-sm mb-2">
          <span>Total Item Terjual:</span>
          <span className="font-semibold">{totalItems}</span>
        </div>
        
        <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-2 mt-2">
          <span>TOTAL PENJUALAN:</span>
          <span>Rp{totalRevenue.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t border-gray-400 pt-3 mt-3 text-xs">
        <div>Dicetak: {new Date().toLocaleString('id-ID')}</div>
        {cashierName && <div>Oleh: {cashierName}</div>}
      </div>
    </div>
  );
}
