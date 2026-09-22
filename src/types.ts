export type FeeType = 
  | 'মাসিক বেতন'
  | 'ভর্তি ফি'
  | 'পরীক্ষার ফি'
  | 'সেশন ফি'
  | 'বই ও স্টেশনারি'
  | 'অন্যান্য ফি';

export type StudentClass =
  | 'প্লে'
  | 'নার্সারি'
  | '১ম শ্রেণি'
  | '২য় শ্রেণি'
  | '৩য় শ্রেণি'
  | '৪র্থ শ্রেণি'
  | '৫ম শ্রেণি'
  | '৬ষ্ঠ শ্রেণি'
  | '৭ম শ্রেণি'
  | '৮ম শ্রেণি';

export type PaymentMethod = 'নগদ ক্যাশ' | 'ব্যাংক জমা' | 'বিকাশ/নগদ';

export interface FeeEditHistoryItem {
  id: string;
  editedAt: string; // ISO date string
  reason?: string;
  changes: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

export interface StudentFee {
  id: string;
  date: string; // YYYY-MM-DD
  studentName?: string;
  studentClass?: StudentClass;
  rollNo?: string;
  feeType?: FeeType;
  targetMonth?: string; // যেমন: 'সেপ্টেম্বর ২০২৬'
  amount: number;
  receiptNo: string;
  paymentMethod?: PaymentMethod;
  collectorName?: string; // আদায়কারী
  receivedBy?: string; // গ্রহণকারী
  collectedBy: string; // backward compatibility
  notes?: string;
  createdAt: string;
  editHistory?: FeeEditHistoryItem[];
}

export type ExpenseCategory =
  | 'অফিস খরচ'
  | 'আপ্যায়ন'
  | 'মোবাইল বিল'
  | 'বিদ্যুৎ বিল'
  | 'অন্যান্য'
  | string;

export interface ExpenseEditHistoryItem {
  id: string;
  editedAt: string; // ISO date string
  reason?: string;
  changes: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

export interface SchoolExpense {
  id: string;
  date: string; // YYYY-MM-DD
  category: string;
  title: string;
  amount: number;
  paidFrom?: 'ক্যাশ ফান্ড' | 'ব্যাংক অ্যাকাউন্ট';
  paidTo?: string;
  voucherNo?: string;
  voucherImage?: string; // Base64 data URL বা আপলোড করা ভাউচার
  notes?: string;
  createdAt: string;
  editHistory?: ExpenseEditHistoryItem[];
}

export type BankTransactionType = 'credit' | 'debit';

export interface BankTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: BankTransactionType; // credit = এড / জমা, debit = উত্তোলন / খরচ
  amount: number;
  source: string; // যেমন: 'ক্যাশ ফান্ড থেকে ব্যাংকে জমা', 'শিক্ষক বেতন বাবদ উত্তোলন' ইত্যাদি
  referenceNo: string; // চেক নং বা ট্রানজেকশন আইডি
  description: string;
  slipImage?: string; // ডিপোজিট স্লিপ / চেকের ছবি (Base64)
  recordedBy: string;
  createdAt: string;
}

export interface DayAccountSummary {
  date: string;
  totalIncome: number;
  incomeCount: number;
  totalExpense: number;
  expenseCount: number;
  netBalance: number;
}

export interface MonthAccountSummary {
  monthKey: string; // YYYY-MM
  monthName: string;
  year: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  activeDaysCount: number;
  totalDaysInMonth: number;
  dailyAverageIncome: number;
  dailyAverageExpense: number;
  dailyAverageNet: number;
}

export type UserRole = 'admin' | 'user';

export interface AppUser {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  designation: string;
  phone?: string;
  createdAt: string;
}

