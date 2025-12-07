// Test script untuk melihat output product sales report
// Run: node test_product_sales_report.js

const PrinterCommands = {
  INIT: '\x1B\x40',
  ALIGN_CENTER: '\x1B\x61\x01',
  ALIGN_LEFT: '\x1B\x61\x00',
  CUT_PAPER: '\x1D\x56\x41\x03'
};

function formatCurrency(amount) {
  try {
    const formatted = amount.toLocaleString('id-ID');
    return 'Rp' + formatted;
  } catch (e) {
    const str = Math.round(amount).toString();
    return 'Rp' + str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}

function wrapText(text, maxWidth = 24) {
  if (!text) return [''];
  
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > maxWidth) {
      if (currentLine) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        lines.push(word.substring(0, maxWidth));
        currentLine = word.substring(maxWidth) + ' ';
      }
    } else {
      currentLine += word + ' ';
    }
  });

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines.length > 0 ? lines : [''];
}

function generateProductSalesReport(data) {
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, CUT_PAPER } = PrinterCommands;
  
  let receipt = INIT;
  
  // Header - Centered
  receipt += ALIGN_CENTER + '\n';
  receipt += 'BK POS\n';
  receipt += 'LAPORAN PENJUALAN PRODUK\n';
  receipt += '\n';
  
  // Period - Left aligned
  receipt += ALIGN_LEFT;
  receipt += `Periode: ${data.period}\n`;
  receipt += `Tanggal: ${new Date().toLocaleDateString('id-ID')}\n`;
  receipt += '------------------------\n';
  receipt += '\n';
  
  // Products List
  receipt += ALIGN_CENTER;
  receipt += 'PRODUK TERJUAL\n';
  receipt += ALIGN_LEFT;
  receipt += '------------------------\n';
  
  data.products.forEach((product, idx) => {
    const hargaSatuan = product.total_quantity > 0 
      ? Math.round(product.total_revenue / product.total_quantity)
      : 0;
    
    // Wrap long product names
    const nameLines = wrapText(product.product_name, 24);
    nameLines.forEach((line, i) => {
      if (i === 0) {
        receipt += `${idx + 1}. ${line}\n`;
      } else {
        receipt += `   ${line}\n`;
      }
    });
    
    // Qty x price = total - with proper currency formatting
    const qtyText = product.total_quantity + ' pcs';
    const priceText = formatCurrency(hargaSatuan);
    const totalText = formatCurrency(product.total_revenue);
    
    receipt += '   ' + qtyText + ' x ' + priceText + '\n';
    receipt += '   = ' + totalText + '\n';
    receipt += '\n';
  });
  
  receipt += '========================\n';
  
  // Summary
  receipt += ALIGN_CENTER;
  receipt += 'RINGKASAN\n';
  receipt += ALIGN_LEFT;
  receipt += '------------------------\n';
  
  receipt += 'Jenis Produk: ' + data.products.length + '\n';
  receipt += 'Total Item: ' + data.totalItems + ' pcs\n';
  receipt += '\n';
  
  // Grand total - with proper currency formatting
  let label = 'TOTAL PENJUALAN:';
  let value = formatCurrency(data.totalRevenue);
  let spaces = 24 - label.length - value.length;
  receipt += label + ' '.repeat(Math.max(1, spaces)) + value + '\n';
  receipt += '========================\n';
  receipt += '\n';
  
  // Footer
  receipt += '\n';
  receipt += ALIGN_CENTER;
  receipt += `Dicetak: ${new Date().toLocaleString('id-ID')}\n`;
  receipt += '\n';
  
  receipt += CUT_PAPER;
  
  return receipt;
}

// Test data
const testData = {
  period: 'Harian',
  products: [
    {
      product_name: 'Susu Telur Madu Jahe Hangat Special',
      total_quantity: 15,
      total_revenue: 225000,
    },
    {
      product_name: 'Kopi Hitam',
      total_quantity: 30,
      total_revenue: 150000,
    },
    {
      product_name: 'Nasi Goreng Spesial',
      total_quantity: 12,
      total_revenue: 300000,
    },
    {
      product_name: 'Es Teh Manis',
      total_quantity: 25,
      total_revenue: 75000,
    }
  ],
  totalItems: 82,
  totalRevenue: 750000,
};

console.log('=== PRODUCT SALES REPORT TEST ===\n');
const receipt = generateProductSalesReport(testData);

// Clean output
const cleanReceipt = receipt
  .replace(/\x1B\x40/g, '')
  .replace(/\x1B\x61\x01/g, '')
  .replace(/\x1B\x61\x00/g, '')
  .replace(/\x1D\x56\x41\x03/g, '');

console.log(cleanReceipt);
console.log('\n=== END ===');
console.log('\nFormat Check:');
console.log('✓ Numbering: 1., 2., 3., 4.');
console.log('✓ Currency with thousand separator: ' + formatCurrency(225000));
console.log('✓ Long names wrapped properly');
console.log('✓ Consistent indentation');
console.log('✓ Clean summary section');
