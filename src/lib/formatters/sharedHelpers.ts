// Shared helper functions untuk semua formatter

// Helper function to pad text for alignment (58mm = 24 chars untuk printer kecil)
export function padText(left: string, right: string, width: number = 24): string {
  const totalLength = left.length + right.length;
  const spaces = width - totalLength;
  return left + ' '.repeat(Math.max(1, spaces)) + right;
}

// Helper function to wrap long text into multiple lines
export function wrapText(text: string, maxWidth: number = 24): string[] {
  if (!text) return [''];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    // If adding this word would exceed maxWidth
    if ((currentLine + word).length > maxWidth) {
      if (currentLine) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        // Word itself is longer than maxWidth, split it
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

// Format currency (shorter format for 58mm, with fallback for Android)
export function formatCurrency(amount: number): string {
  try {
    // Try toLocaleString first
    const formatted = amount.toLocaleString('id-ID');
    return 'Rp' + formatted;
  } catch (e) {
    // Fallback for Android browsers that might have issues
    const str = Math.round(amount).toString();
    // Add thousand separators manually
    return 'Rp' + str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}

// Get settings from localStorage
export function getReceiptSettings() {
  try {
    const savedReceipt = localStorage.getItem('settings_receipt');
    const savedStore = localStorage.getItem('settings_store');
    
    const receiptSettings = savedReceipt ? JSON.parse(savedReceipt) : {
      header: '', // Default kosong - user bisa isi di settings
      tagline: '',
      footer: '',
    };
    
    const storeSettings = savedStore ? JSON.parse(savedStore) : {
      name: 'BK POS',
      address: '',
      phone: '',
    };
    
    return { receiptSettings, storeSettings };
  } catch (error) {
    console.error('Error loading receipt settings:', error);
    return {
      receiptSettings: {
        header: '',
        tagline: '',
        footer: '',
      },
      storeSettings: {
        name: 'BK POS',
        address: '',
        phone: '',
      },
    };
  }
}
