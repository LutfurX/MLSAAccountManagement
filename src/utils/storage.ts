import {
  StudentFee,
  SchoolExpense,
  BankTransaction,
  DayAccountSummary,
  MonthAccountSummary,
} from '../types';
import {
  getMonthKeyFromDate,
  getBanglaMonthYearLabel,
} from './formatters';

const STORAGE_KEYS = {
  FEES: 'mlsa_student_fees_v2',
  EXPENSES: 'mlsa_school_expenses_v2',
  BANK: 'mlsa_bank_transactions_v2',
};

export function loadFeesFromStorage(): StudentFee[] {
  try {
    // Clear legacy dummy data if exists
    if (localStorage.getItem('mlsa_student_fees_v1')) {
      localStorage.removeItem('mlsa_student_fees_v1');
    }
    const raw = localStorage.getItem(STORAGE_KEYS.FEES);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load fees:', err);
    return [];
  }
}

export function saveFeesToStorage(fees: StudentFee[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(fees));
  } catch (err) {
    console.error('Failed to save fees:', err);
  }
}

export function loadExpensesFromStorage(): SchoolExpense[] {
  try {
    // Clear legacy dummy data if exists
    if (localStorage.getItem('mlsa_school_expenses_v1')) {
      localStorage.removeItem('mlsa_school_expenses_v1');
    }
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load expenses:', err);
    return [];
  }
}

export function saveExpensesToStorage(expenses: SchoolExpense[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (err) {
    console.error('Failed to save expenses:', err);
  }
}

export function loadBankTransactionsFromStorage(): BankTransaction[] {
  try {
    // Clear legacy dummy data if exists
    if (localStorage.getItem('mlsa_bank_transactions_v1')) {
      localStorage.removeItem('mlsa_bank_transactions_v1');
    }
    const raw = localStorage.getItem(STORAGE_KEYS.BANK);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load bank transactions:', err);
    return [];
  }
}

export function saveBankTransactionsToStorage(txs: BankTransaction[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.BANK, JSON.stringify(txs));
  } catch (err) {
    console.error('Failed to save bank transactions:', err);
  }
}

export function clearAllStorage() {
  try {
    localStorage.removeItem(STORAGE_KEYS.FEES);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.BANK);
    localStorage.removeItem('mlsa_student_fees_v1');
    localStorage.removeItem('mlsa_school_expenses_v1');
    localStorage.removeItem('mlsa_bank_transactions_v1');
  } catch (err) {
    console.error('Failed to clear storage:', err);
  }
}


// Compute live Bank Balance
export function computeBankBalance(txs: BankTransaction[]): number {
  return txs.reduce((acc, curr) => {
    if (curr.type === 'credit') {
      return acc + curr.amount;
    } else {
      return acc - curr.amount;
    }
  }, 0);
}

// Compute Day-by-Day Summary (Income, Expense, Net)
export function computeDailySummaries(
  fees: StudentFee[],
  expenses: SchoolExpense[]
): Record<string, DayAccountSummary> {
  const map: Record<string, DayAccountSummary> = {};

  fees.forEach((f) => {
    if (!map[f.date]) {
      map[f.date] = {
        date: f.date,
        totalIncome: 0,
        incomeCount: 0,
        totalExpense: 0,
        expenseCount: 0,
        netBalance: 0,
      };
    }
    map[f.date].totalIncome += f.amount;
    map[f.date].incomeCount += 1;
  });

  expenses.forEach((e) => {
    if (!map[e.date]) {
      map[e.date] = {
        date: e.date,
        totalIncome: 0,
        incomeCount: 0,
        totalExpense: 0,
        expenseCount: 0,
        netBalance: 0,
      };
    }
    map[e.date].totalExpense += e.amount;
    map[e.date].expenseCount += 1;
  });

  Object.keys(map).forEach((date) => {
    map[date].netBalance = map[date].totalIncome - map[date].totalExpense;
  });

  return map;
}

// Compute Monthly Breakdown & Daily Averages
export function computeMonthlySummary(
  monthKey: string, // YYYY-MM
  fees: StudentFee[],
  expenses: SchoolExpense[]
): MonthAccountSummary {
  const filteredFees = fees.filter((f) => getMonthKeyFromDate(f.date) === monthKey);
  const filteredExpenses = expenses.filter((e) => getMonthKeyFromDate(e.date) === monthKey);

  const totalIncome = filteredFees.reduce((acc, f) => acc + f.amount, 0);
  const totalExpense = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // Distinct active days that have either fee or expense
  const activeDates = new Set<string>();
  filteredFees.forEach((f) => activeDates.add(f.date));
  filteredExpenses.forEach((e) => activeDates.add(e.date));

  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  const activeDaysCount = activeDates.size;
  const calcDivisor = activeDaysCount > 0 ? activeDaysCount : 1;

  // We compute average per active recording day as well as per total month days
  const dailyAverageIncome = totalIncome / calcDivisor;
  const dailyAverageExpense = totalExpense / calcDivisor;
  const dailyAverageNet = netBalance / calcDivisor;

  return {
    monthKey,
    monthName: getBanglaMonthYearLabel(monthKey),
    year,
    totalIncome,
    totalExpense,
    netBalance,
    activeDaysCount,
    totalDaysInMonth,
    dailyAverageIncome,
    dailyAverageExpense,
    dailyAverageNet,
  };
}

// Get all unique month keys present in data
export function getAvailableMonthKeys(
  fees: StudentFee[],
  expenses: SchoolExpense[]
): string[] {
  const set = new Set<string>();
  fees.forEach((f) => set.add(getMonthKeyFromDate(f.date)));
  expenses.forEach((e) => set.add(getMonthKeyFromDate(e.date)));

  // If empty, add current month
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  set.add(current);

  return Array.from(set).sort().reverse();
}

// Export all data to JSON file
export function exportDataAsJSON(
  fees: StudentFee[],
  expenses: SchoolExpense[],
  txs: BankTransaction[]
) {
  const payload = {
    school: 'মোগলগাঁও লিটল স্টার একাডেমি',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    fees,
    expenses,
    bankTransactions: txs,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `moghalgaon-school-accounts-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Clear all accounts and transactions
export function resetDemoData() {
  clearAllStorage();
}

