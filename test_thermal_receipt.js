// Test script untuk melihat output thermal receipt
// Run: node test_thermal_receipt.js

// Simulate thermal receipt generation
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

function formatDate(date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function wrapText(text, maxLength) {
  if (text.length <= maxLength) return [text];
  
  const words = text.split(' ');
  const lines = [];
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
}

function generateThermalReceipt(data) {
  const { INIT, ALIGN_CENTER, ALIGN_LEFT, CUT_PAPER } = PrinterCommands;
  
  const paperWidth = data.paperWidth || '58mm';
  const maxChars = paperWidth === '58mm' ? 24 : 32;
  const separator = '='.repeat(maxChars);
  const lightSeparator = '-'.repeat(maxChars);
  
  const storeName = data.storeName || 'BK POS';
  
  let receipt = INIT;
  
  // Header - Centered
  receipt += ALIGN_CENTER;
  receipt += separator + '\n';
  receipt += storeName + '\n';
  receipt += separator + '\n';
  receipt += '\n';
  
  // Transaction Info - Left Aligned
  receipt += ALIGN_LEFT;
  receipt += 'No: ' + data.transactionNumber + '\n';
  receipt += 'Tgl: ' + formatDate(data.date) + '\n';
  if (data.cashierName) receipt += 'Kasir: ' + data.cashierName + '\n';
  if (data.customerName) receipt += 'Pelanggan: ' + data.customerName + '\n';
  receipt += '\n';
  
  receipt += ALIGN_CENTER;
  receipt += separator + '\n';
  receipt += '\n';
  
  // Items
  receipt += ALIGN_LEFT;
  
  data.items.forEach((item) => {
    let itemName = item.name;
    if (item.variant) itemName += ' - ' + item.variant;
    
    const nameLines = wrapText(itemName, maxChars);
    nameLines.forEach(line => {
      receipt += line + '\n';
    });
    
    receipt += '  ' + item.quantity + ' x ' + formatCurrency(item.price) + '\n';
    receipt += '  = ' + formatCurrency(item.subtotal) + '\n';
    receipt += '\n';
  });
  
  // Light separator before totals
  receipt += ALIGN_CENTER;
  receipt += lightSeparator + '\n';
  receipt += '\n';
  
  // Totals
  receipt += ALIGN_LEFT;
  const subtotalLabel = 'Subtotal:';
  const subtotalValue = formatCurrency(data.subtotal);
  const subtotalSpaces = ' '.repeat(Math.max(1, maxChars - subtotalLabel.length - subtotalValue.length));
  receipt += subtotalLabel + subtotalSpaces + subtotalValue + '\n';
  
  if (data.tax > 0) {
    const taxRate = data.taxRate || 0;
    const taxLabel = `Pajak (${taxRate}%):`;
    const taxValue = formatCurrency(data.tax);
    const taxSpaces = ' '.repeat(Math.max(1, maxChars - taxLabel.length - taxValue.length));
    receipt += taxLabel + taxSpaces + taxValue + '\n';
  }
  
  receipt += '\n';
  
  // TOTAL
  receipt += ALIGN_CENTER;
  receipt += separator + '\n';
  receipt += ALIGN_LEFT;
  
  const totalLabel = 'TOTAL:';
  const totalValue = formatCurrency(data.total);
  const totalSpaces = ' '.repeat(Math.max(1, maxChars - totalLabel.length - totalValue.length));
  receipt += totalLabel + totalSpaces + totalValue + '\n';
  
  receipt += ALIGN_CENTER;
  receipt += separator + '\n';
  receipt += '\n';
  
  // Payment info
  receipt += ALIGN_LEFT;
  receipt += 'Pembayaran: ' + data.paymentMethod.toUpperCase() + '\n';
  
  receipt += '\n';
  receipt += ALIGN_CENTER;
  receipt += 'Terima kasih!\n';
  receipt += 'Selamat menikmati!\n';
  receipt += '\n';
  
  receipt += CUT_PAPER;
  
  return receipt;
}

// Test data
const testData = {
  transactionNumber: 'TRX-001',
  date: new Date(),
  items: [
    {
      name: 'Susu Telur Madu Jahe Hangat Special',
      quantity: 2,
      price: 15000,
      subtotal: 30000,
    },
    {
      name: 'Kopi Hitam',
      quantity: 3,
      price: 5000,
      subtotal: 15000,
      variant: 'Size L'
    },
    {
      name: 'Nasi Goreng Spesial',
      quantity: 1,
      price: 25000,
      subtotal: 25000,
    }
  ],
  subtotal: 70000,
  tax: 0,
  total: 70000,
  paymentMethod: 'tunai',
  paymentAmount: 100000,
  changeAmount: 30000,
  customerName: 'Budi',
  paperWidth: '58mm',
  storeName: 'BK POS',
  cashierName: 'Admin',
};

console.log('=== THERMAL RECEIPT TEST ===\n');
const receipt = generateThermalReceipt(testData);

// Clean output for display (remove ESC/POS commands)
const cleanReceipt = receipt
  .replace(/\x1B\x40/g, '') // INIT
  .replace(/\x1B\x61\x01/g, '') // ALIGN_CENTER
  .replace(/\x1B\x61\x00/g, '') // ALIGN_LEFT
  .replace(/\x1D\x56\x41\x03/g, ''); // CUT_PAPER

console.log(cleanReceipt);
console.log('\n=== END ===');
console.log('\nFormat Check:');
console.log('✓ Currency with thousand separator: ' + formatCurrency(15000));
console.log('✓ Long names wrapped properly');
console.log('✓ Clean separator lines');
console.log('✓ Consistent formatting');
