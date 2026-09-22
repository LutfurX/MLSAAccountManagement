import { StudentFee, SchoolExpense, BankTransaction } from '../types';

export const BANGLA_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

export const SCHOOL_INFO = {
  name: 'মোগলগাঁও লিটল স্টার একাডেমি',
  shortName: 'লিটল স্টার একাডেমি',
  address: 'মোগলগাঁও, জালালাবাদ, সিলেট',
  established: '২০১৬',
  email: 'info@littlestaracademy.edu.bd',
  phone: '০১৭১১-XXXXXX',
  logo: '/school_logo.jpg',
};

// Convert English numbers to Bangla numbers
export function toBanglaDigits(num: number | string): string {
  const banglaDigits: { [key: string]: string } = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
  };
  return String(num).replace(/[0-9]/g, (digit) => banglaDigits[digit] || digit);
}

// Format Taka currency
export function formatCurrency(amount: number, useBanglaDigits = true): string {
  const formatted = new Intl.NumberFormat('en-IN').format(Math.round(amount));
  if (useBanglaDigits) {
    return `৳ ${toBanglaDigits(formatted)}`;
  }
  return `৳ ${formatted}`;
}

// Format Date string YYYY-MM-DD into readable Bangla date
export function formatBanglaDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const monthName = BANGLA_MONTHS[monthIndex] || parts[1];
      return `${toBanglaDigits(day)} ${monthName}, ${toBanglaDigits(year)}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

// Get today's date in YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get month string YYYY-MM
export function getMonthKeyFromDate(dateStr: string): string {
  return dateStr.substring(0, 7);
}

// Get Bangla Month-Year label (e.g. সেপ্টেম্বর ২০২৬)
export function getBanglaMonthYearLabel(monthKey: string): string {
  const parts = monthKey.split('-');
  if (parts.length === 2) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const monthName = BANGLA_MONTHS[monthIndex] || parts[1];
    return `${monthName} ${toBanglaDigits(year)}`;
  }
  return monthKey;
}

// Format ISO date-time into Bangla
export function formatBanglaDateTime(isoStr: string): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const dateFormatted = `${toBanglaDigits(d.getDate())} ${BANGLA_MONTHS[d.getMonth()] || ''}, ${toBanglaDigits(d.getFullYear())}`;
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${dateFormatted}, ${toBanglaDigits(hours)}:${toBanglaDigits(minutes)} ${period}`;
  } catch {
    return isoStr;
  }
}

// Generate unique receipt/voucher IDs
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

export function generateReceiptNo(prefix = 'REC'): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${toBanglaDigits(rand)}`;
}

// Initial empty data for real production usage (no dummy data)
export const INITIAL_FEES: StudentFee[] = [];

export const INITIAL_EXPENSES: SchoolExpense[] = [];

export const INITIAL_BANK_TRANSACTIONS: BankTransaction[] = [];

