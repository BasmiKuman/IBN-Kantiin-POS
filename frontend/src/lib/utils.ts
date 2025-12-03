import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined, options?: { locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number }) {
  const amount = Number(value) || 0;
  const { locale = 'id-ID', minimumFractionDigits = 0, maximumFractionDigits = 0 } = options || {};

  try {
    // Use explicit notation: 'standard' to avoid any compact/shortening behavior
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
      notation: 'standard',
    }).format(amount);
  } catch (e) {
    // Fallback
    return amount.toLocaleString();
  }
}
