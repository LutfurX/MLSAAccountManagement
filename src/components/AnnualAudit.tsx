import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Calendar, 
  Printer, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Landmark, 
  CheckCircle2, 
  ShieldCheck, 
  PieChart, 
  Building2, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Info,
  Scale
} from 'lucide-react';
import { StudentFee, SchoolExpense, BankTransaction } from '../types';
import { 
  formatCurrency, 
  toBanglaDigits, 
  formatBanglaDate, 
  BANGLA_MONTHS, 
  SCHOOL_INFO, 
  getTodayDateString 
} from '../utils/formatters';

interface AnnualAuditProps {
  fees: StudentFee[];
  expenses: SchoolExpense[];
  bankTransactions: BankTransaction[];
  bankBalance: number;
}

export const AnnualAudit: React.FC<AnnualAuditProps> = ({
  fees,
  expenses,
  bankTransactions,
  bankBalance,
}) => {
  // 1. Determine available years from data
  const availableYears = useMemo(() => {
    const yearSet = new Set<string>();
    
    // Default current year
    const currentYearStr = new Date().getFullYear().toString();
    yearSet.add(currentYearStr);

    fees.forEach((f) => {
      if (f.date && f.date.length >= 4) yearSet.add(f.date.substring(0, 4));
    });
    expenses.forEach((e) => {
      if (e.date && e.date.length >= 4) yearSet.add(e.date.substring(0, 4));
    });
    bankTransactions.forEach((b) => {
      if (b.date && b.date.length >= 4) yearSet.add(b.date.substring(0, 4));
    });

    return Array.from(yearSet).sort((a, b) => b.localeCompare(a));
  }, [fees, expenses, bankTransactions]);

  const [selectedYear, setSelectedYear] = useState<string>(
    availableYears[0] || new Date().getFullYear().toString()
  );

  // 2. Filter data for the selected fiscal/calendar year
  const yearFees = useMemo(() => {
    return fees.filter((f) => f.date && f.date.startsWith(selectedYear));
  }, [fees, selectedYear]);

  const yearExpenses = useMemo(() => {
    return expenses.filter((e) => e.date && e.date.startsWith(selectedYear));
  }, [expenses, selectedYear]);

  const yearBankTransactions = useMemo(() => {
    return bankTransactions.filter((b) => b.date && b.date.startsWith(selectedYear));
  }, [bankTransactions, selectedYear]);

  // 3. Overall Totals
  const totalAnnualIncome = useMemo(() => {
    return yearFees.reduce((sum, f) => sum + (f.amount || 0), 0);
  }, [yearFees]);

  const totalAnnualExpense = useMemo(() => {
    return yearExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [yearExpenses]);

  const netAnnualSurplus = totalAnnualIncome - totalAnnualExpense;

  // Bank stats for the year
  const yearBankDeposit = useMemo(() => {
    return yearBankTransactions
      .filter((b) => b.type === 'credit')
      .reduce((sum, b) => sum + (b.amount || 0), 0);
  }, [yearBankTransactions]);

  const yearBankWithdraw = useMemo(() => {
    return yearBankTransactions
      .filter((b) => b.type === 'debit')
      .reduce((sum, b) => sum + (b.amount || 0), 0);
  }, [yearBankTransactions]);

  // Cash in hand estimation (Total Cash Collected - Cash Deposited to Bank - Cash Expenses)
  const cashIncome = useMemo(() => {
    return yearFees
      .filter((f) => (f.paymentMethod || 'ক্যাশ') === 'ক্যাশ')
      .reduce((sum, f) => sum + (f.amount || 0), 0);
  }, [yearFees]);

  const cashExpenses = useMemo(() => {
    return yearExpenses
      .filter((e) => e.paidFrom !== 'ব্যাংক অ্যাকাউন্ট')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [yearExpenses]);

  // 4. Month by Month Audit Grid (12 Months of the selected year)
  const monthlyMatrix = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthNum = String(i + 1).padStart(2, '0');
      const monthKey = `${selectedYear}-${monthNum}`;
      const monthName = BANGLA_MONTHS[i];

      const mFees = yearFees.filter((f) => f.date && f.date.startsWith(monthKey));
      const mExpenses = yearExpenses.filter((e) => e.date && e.date.startsWith(monthKey));
      const mBankTx = yearBankTransactions.filter((b) => b.date && b.date.startsWith(monthKey));

      const income = mFees.reduce((sum, f) => sum + f.amount, 0);
      const expense = mExpenses.reduce((sum, e) => sum + e.amount, 0);
      const bankIn = mBankTx.filter((b) => b.type === 'credit').reduce((sum, b) => sum + b.amount, 0);
      const bankOut = mBankTx.filter((b) => b.type === 'debit').reduce((sum, b) => sum + b.amount, 0);

      return {
        monthIndex: i + 1,
        monthName,
        monthKey,
        feeCount: mFees.length,
        income,
        expenseCount: mExpenses.length,
        expense,
        net: income - expense,
        bankIn,
        bankOut,
      };
    });
  }, [selectedYear, yearFees, yearExpenses, yearBankTransactions]);

  // 5. Categorized Income Breakdown (Fee Types)
  const incomeCategoryBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    yearFees.forEach((f) => {
      const type = f.feeType || 'মাসিক বেতন';
      if (!map[type]) map[type] = { count: 0, total: 0 };
      map[type].count += 1;
      map[type].total += f.amount;
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        count: data.count,
        total: data.total,
        percentage: totalAnnualIncome > 0 ? (data.total / totalAnnualIncome) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [yearFees, totalAnnualIncome]);

  // 6. Categorized Expense Breakdown (Expense Categories)
  const expenseCategoryBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    yearExpenses.forEach((e) => {
      const cat = e.category || 'অন্যান্য';
      if (!map[cat]) map[cat] = { count: 0, total: 0 };
      map[cat].count += 1;
      map[cat].total += e.amount;
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        count: data.count,
        total: data.total,
        percentage: totalAnnualExpense > 0 ? (data.total / totalAnnualExpense) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [yearExpenses, totalAnnualExpense]);

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = ['ক্রমিক', 'মাস', 'মোট আয় (৳)', 'আদায় সংখ্যা', 'মোট ব্যয় (৳)', 'ভাউচার সংখ্যা', 'মাসিক উদ্বৃত্ত/ঘাটতি (৳)', 'ব্যাংকে জমা (৳)', 'ব্যাংক উত্তোলন (৳)'];
    const rows = monthlyMatrix.map((m) => [
      m.monthIndex,
      m.monthName,
      m.income,
      m.feeCount,
      m.expense,
      m.expenseCount,
      m.net,
      m.bankIn,
      m.bankOut,
    ]);

    // Summary row
    rows.push([
      'সর্বমোট',
      `${selectedYear} বাৎসরিক পূর্ণ হিসাব`,
      totalAnnualIncome,
      yearFees.length,
      totalAnnualExpense,
      yearExpenses.length,
      netAnnualSurplus,
      yearBankDeposit,
      yearBankWithdraw,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Annual_Audit_Report_${selectedYear}_${SCHOOL_INFO.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-slate-800 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold mb-3 backdrop-blur-xs border border-white/15">
              <Scale className="w-3.5 h-3.5" />
              <span>প্রতিষ্ঠানিক বার্ষিক নিরীক্ষা ও ব্যালেন্স শিট (Annual Audit)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>বার্ষিক অডিট ও আর্থিক বিবরণী</span>
              <span className="px-3 py-1 rounded-xl bg-indigo-500/30 text-indigo-200 text-lg sm:text-xl font-mono border border-indigo-400/40">
                {toBanglaDigits(selectedYear)} খ্রি.
              </span>
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 max-w-2xl leading-relaxed">
              {SCHOOL_INFO.name}-এর ১২ মাসের সামগ্রিক আয়-ব্যয়, ছাত্র বেতন খাত, পরিচালন খরচ ও ব্যাংক হিসাবের অডিট পর্যালোচনা।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Year Selector */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <label htmlFor="audit-year" className="text-xs text-slate-300 font-semibold whitespace-nowrap">
                অডিট বছর:
              </label>
              <select
                id="audit-year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-white font-bold text-sm focus:outline-hidden cursor-pointer"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr} className="bg-slate-900 text-white font-sans">
                    {toBanglaDigits(yr)} সাল
                  </option>
                ))}
              </select>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
              title="অডিট রিপোর্ট প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4 mr-2" />
              <span>রিপোর্ট প্রিন্ট</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
              title="এক্সেল সিএসভি ফরম্যাটে ডাউনলোড করুন"
            >
              <Download className="w-4 h-4 mr-2" />
              <span>CSV এক্সেল ডাউনলোড</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Official Header (Only Visible When Printed) */}
      <div className="hidden print:block text-center border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-2xl font-black text-slate-900">{SCHOOL_INFO.name}</h1>
        <p className="text-xs text-slate-600">{SCHOOL_INFO.address} • স্থাপিত: {toBanglaDigits(SCHOOL_INFO.established)} খ্রি.</p>
        <div className="mt-2 inline-block px-4 py-1 rounded bg-slate-100 border border-slate-300 font-bold text-sm text-slate-900">
          বার্ষিক আর্থিক অডিট ও আয়-ব্যয় সমাপনী প্রতিবেদন ({toBanglaDigits(selectedYear)} খ্রি.)
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          মুদ্রণের তারিখ: {formatBanglaDate(getTodayDateString())}
        </p>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Annual Income */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              বাৎসরিক সর্বমোট আয়
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-emerald-700">
              {formatCurrency(totalAnnualIncome)}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>সর্বমোট {toBanglaDigits(yearFees.length)} টি রসিদ আদায়</span>
            </p>
          </div>
        </div>

        {/* Total Annual Expense */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              বাৎসরিক সর্বমোট ব্যয়
            </span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-rose-700">
              {formatCurrency(totalAnnualExpense)}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>সর্বমোট {toBanglaDigits(yearExpenses.length)} টি খরচের ভাউচার</span>
            </p>
          </div>
        </div>

        {/* Net Surplus / Deficit */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              বাৎসরিক প্রকৃত উদ্বৃত্ত / ঘাটতি
            </span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              netAnnualSurplus >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-black ${
              netAnnualSurplus >= 0 ? 'text-indigo-700' : 'text-amber-700'
            }`}>
              {netAnnualSurplus >= 0 ? '+' : '-'} {formatCurrency(Math.abs(netAnnualSurplus))}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {netAnnualSurplus >= 0 ? '✓ প্রতিষ্ঠান উদ্বৃত্তে রয়েছে' : '⚠️ আয়ের তুলনায় ব্যয় বেশি'}
            </p>
          </div>
        </div>

        {/* Bank & Cash Balance Status */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              বর্তমান ব্যাংক স্থিতি
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-blue-700">
              {formatCurrency(bankBalance)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              বাৎসরিক ব্যাংক জমা: <strong className="text-emerald-600 font-bold">{formatCurrency(yearBankDeposit)}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Main 12-Month Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {toBanglaDigits(selectedYear)} সালের ১২ মাসের আয়-ব্যয় অডিট শিট
              </h3>
              <p className="text-xs text-slate-500">
                মাসভিত্তিক আদায়, ব্যয়, উদ্বৃত্ত এবং ব্যাংকিং লেনদেনের পুঙ্খানুপুঙ্খ বিবরণ
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/90 text-slate-700 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-center">ক্রমিক</th>
                <th className="py-3 px-4">মাস</th>
                <th className="py-3 px-4 text-center">আদায় রসিদ</th>
                <th className="py-3 px-4 text-right text-emerald-800">মোট আদায় (৳)</th>
                <th className="py-3 px-4 text-center">খরচ ভাউচার</th>
                <th className="py-3 px-4 text-right text-rose-800">মোট ব্যয় (৳)</th>
                <th className="py-3 px-4 text-right">মাসিক উদ্বৃত্ত/ঘাটতি</th>
                <th className="py-3 px-4 text-right text-blue-800">ব্যাংকে জমা</th>
                <th className="py-3 px-4 text-right text-amber-800">ব্যাংক উত্তোলন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyMatrix.map((m) => {
                const hasActivity = m.income > 0 || m.expense > 0 || m.bankIn > 0 || m.bankOut > 0;
                return (
                  <tr 
                    key={m.monthKey} 
                    className={`hover:bg-slate-50/80 transition-colors ${
                      hasActivity ? 'bg-white' : 'bg-slate-50/30 text-slate-400'
                    }`}
                  >
                    <td className="py-3 px-4 text-center font-mono text-xs">
                      {toBanglaDigits(m.monthIndex)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {m.monthName}
                    </td>
                    <td className="py-3 px-4 text-center text-xs">
                      {m.feeCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                          {toBanglaDigits(m.feeCount)} টি
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700 whitespace-nowrap">
                      {m.income > 0 ? formatCurrency(m.income) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center text-xs">
                      {m.expenseCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-100">
                          {toBanglaDigits(m.expenseCount)} টি
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-700 whitespace-nowrap">
                      {m.expense > 0 ? formatCurrency(m.expense) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold whitespace-nowrap">
                      {hasActivity ? (
                        <span className={m.net >= 0 ? 'text-indigo-700' : 'text-amber-700'}>
                          {m.net >= 0 ? '+' : '-'} {formatCurrency(Math.abs(m.net))}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-blue-700 whitespace-nowrap">
                      {m.bankIn > 0 ? formatCurrency(m.bankIn) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-amber-700 whitespace-nowrap">
                      {m.bankOut > 0 ? formatCurrency(m.bankOut) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Grand Total Footer */}
            <tfoot className="bg-slate-100/90 font-black text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td colSpan={2} className="py-3.5 px-4 text-right uppercase tracking-wider text-xs">
                  বাৎসরিক মোট ফলাফল:
                </td>
                <td className="py-3.5 px-4 text-center text-xs">
                  {toBanglaDigits(yearFees.length)} টি
                </td>
                <td className="py-3.5 px-4 text-right text-emerald-800 text-base">
                  {formatCurrency(totalAnnualIncome)}
                </td>
                <td className="py-3.5 px-4 text-center text-xs">
                  {toBanglaDigits(yearExpenses.length)} টি
                </td>
                <td className="py-3.5 px-4 text-right text-rose-800 text-base">
                  {formatCurrency(totalAnnualExpense)}
                </td>
                <td className="py-3.5 px-4 text-right text-base text-indigo-900">
                  {netAnnualSurplus >= 0 ? '+' : '-'} {formatCurrency(Math.abs(netAnnualSurplus))}
                </td>
                <td className="py-3.5 px-4 text-right text-blue-800">
                  {formatCurrency(yearBankDeposit)}
                </td>
                <td className="py-3.5 px-4 text-right text-amber-800">
                  {formatCurrency(yearBankWithdraw)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Two Column Breakdown: Income Heads vs Expense Heads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Income Heads Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>আয়ের খাতওয়ারি বাৎসরিক বিশ্লেষণ</span>
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              মোট: {formatCurrency(totalAnnualIncome)}
            </span>
          </div>

          <div className="p-4 sm:p-5">
            {incomeCategoryBreakdown.length === 0 ? (
              <p className="text-center py-6 text-sm text-slate-400">এই বছরে আয়ের কোনো এন্ট্রি নেই</p>
            ) : (
              <div className="space-y-4">
                {incomeCategoryBreakdown.map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {item.name}
                        <span className="text-[11px] text-slate-500 font-normal">
                          ({toBanglaDigits(item.count)} টি)
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-700">
                          {formatCurrency(item.total)}
                        </span>
                        <span className="text-[11px] text-slate-400 w-12 text-right">
                          {toBanglaDigits(item.percentage.toFixed(1))}%
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expense Heads Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span>ব্যয়ের খাতওয়ারি বাৎসরিক বিশ্লেষণ</span>
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700">
              মোট: {formatCurrency(totalAnnualExpense)}
            </span>
          </div>

          <div className="p-4 sm:p-5">
            {expenseCategoryBreakdown.length === 0 ? (
              <p className="text-center py-6 text-sm text-slate-400">এই বছরে ব্যয়ের কোনো এন্ট্রি নেই</p>
            ) : (
              <div className="space-y-4">
                {expenseCategoryBreakdown.map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        {item.name}
                        <span className="text-[11px] text-slate-500 font-normal">
                          ({toBanglaDigits(item.count)} টি)
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-700">
                          {formatCurrency(item.total)}
                        </span>
                        <span className="text-[11px] text-slate-400 w-12 text-right">
                          {toBanglaDigits(item.percentage.toFixed(1))}%
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Official Signatures Box for Print & Institutional Auditing */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs mt-6">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
          অডিট যাচাইকারী ও প্রাতিষ্ঠানিক অনুমোদন স্বাক্ষর:
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8">
          <div className="border-t border-slate-400 pt-2 text-center">
            <p className="text-xs font-bold text-slate-800">হিসাবরক্ষক / সহকারী শিক্ষক</p>
            <p className="text-[11px] text-slate-500">{SCHOOL_INFO.name}</p>
          </div>
          <div className="border-t border-slate-400 pt-2 text-center">
            <p className="text-xs font-bold text-slate-800">অডিট কমিটির আহ্বায়ক</p>
            <p className="text-[11px] text-slate-500">হিসাব নিরীক্ষা কমিটি</p>
          </div>
          <div className="border-t border-slate-400 pt-2 text-center">
            <p className="text-xs font-bold text-slate-800">প্রধান শিক্ষক / সভাপতি</p>
            <p className="text-[11px] text-slate-500">ব্যবস্থাপনা কমিটি</p>
          </div>
        </div>
      </div>
    </div>
  );
};
