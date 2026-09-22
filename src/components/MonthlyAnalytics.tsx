import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt, 
  Calculator, 
  PieChart, 
  BarChart3, 
  Printer, 
  Clock, 
  CheckCircle2
} from 'lucide-react';
import { StudentFee, SchoolExpense, MonthAccountSummary } from '../types';
import { 
  formatCurrency, 
  formatBanglaDate, 
  toBanglaDigits, 
  getMonthKeyFromDate, 
  getBanglaMonthYearLabel, 
  getTodayDateString,
  SCHOOL_INFO 
} from '../utils/formatters';
import { computeMonthlySummary, getAvailableMonthKeys } from '../utils/storage';

interface MonthlyAnalyticsProps {
  fees: StudentFee[];
  expenses: SchoolExpense[];
}

export const MonthlyAnalytics: React.FC<MonthlyAnalyticsProps> = ({
  fees,
  expenses,
}) => {
  const availableMonths = useMemo(() => {
    return getAvailableMonthKeys(fees, expenses);
  }, [fees, expenses]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || '');

  // Monthly calculated statistics
  const summary: MonthAccountSummary = useMemo(() => {
    return computeMonthlySummary(selectedMonth, fees, expenses);
  }, [selectedMonth, fees, expenses]);

  // Filter fees & expenses for this month
  const monthFees = useMemo(() => {
    return fees.filter((f) => getMonthKeyFromDate(f.date) === selectedMonth);
  }, [fees, selectedMonth]);

  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => getMonthKeyFromDate(e.date) === selectedMonth);
  }, [expenses, selectedMonth]);

  // Group by day of month for visual comparison
  const dailyBreakdown = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    
    // Fill all days that have data
    monthFees.forEach((f) => {
      if (!map[f.date]) map[f.date] = { income: 0, expense: 0 };
      map[f.date].income += f.amount;
    });

    monthExpenses.forEach((e) => {
      if (!map[e.date]) map[e.date] = { income: 0, expense: 0 };
      map[e.date].expense += e.amount;
    });

    return Object.entries(map)
      .map(([date, data]) => ({
        date,
        dayNum: date.split('-')[2],
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [monthFees, monthExpenses]);

  // Max value for bar chart scaling
  const maxDayAmount = useMemo(() => {
    let max = 1000;
    dailyBreakdown.forEach((d) => {
      if (d.income > max) max = d.income;
      if (d.expense > max) max = d.expense;
    });
    return max;
  }, [dailyBreakdown]);

  // Category breakdown for expenses
  const categoryExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    monthExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthExpenses]);

  const isNetSurplus = summary.netBalance >= 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-md flex items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-teal-100 text-xs font-semibold mb-2">
            <Calculator className="w-3.5 h-3.5 text-amber-300" />
            <span>মাসিক সামগ্রিক প্রতিবেদন ও গড় অ্যানালিটিক্স</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            {summary.monthName} মাসের আয়, ব্যয় ও গড় হিসাব
          </h2>
          <p className="text-teal-100 text-sm mt-1 max-w-xl">
            মাসের মোট আয়-ব্যয়ের পাশাপাশি প্রতিদিন গড়ে কত টাকা আয় এবং কত টাকা খরচ হয়েছে তা স্বয়ংক্রিয়ভাবে পরিমাপ করা হয়।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 text-sm font-bold bg-white text-slate-900 rounded-xl border border-slate-300 shadow-xs cursor-pointer focus:outline-hidden"
          >
            {availableMonths.map((mKey) => (
              <option key={mKey} value={mKey}>
                {getBanglaMonthYearLabel(mKey)}
              </option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            রিপোর্ট প্রিন্ট
          </button>
        </div>
      </div>

      {/* Primary Monthly Totals Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">
              {summary.monthName} মাসের মোট আয়
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
              {formatCurrency(summary.totalIncome)}
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">
              ছাত্র-ছাত্রীদের বেতন ও সকল ফি
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">
              {summary.monthName} মাসের মোট খরচ
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">
              {formatCurrency(summary.totalExpense)}
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">
              স্কুল পরিচালনা ও যাবতীয় ব্যয়
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Net Monthly Balance */}
        <div className={`rounded-xl p-5 border shadow-xs flex items-center justify-between ${
          isNetSurplus ? 'bg-indigo-50/50 border-indigo-200' : 'bg-amber-50/50 border-amber-200'
        }`}>
          <div>
            <span className="text-xs text-slate-600 font-semibold block uppercase">
              মাসিক নিট উদ্বৃত্ত / স্থিতি
            </span>
            <div className={`text-2xl sm:text-3xl font-black mt-1 ${
              isNetSurplus ? 'text-indigo-700' : 'text-amber-700'
            }`}>
              {formatCurrency(summary.netBalance)}
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">
              {isNetSurplus ? 'আয় খরচের চেয়ে বেশি (উদ্বৃত্ত)' : 'খরচ আয়ের চেয়ে বেশি (ঘাটতি)'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isNetSurplus ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {isNetSurplus ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>
        </div>
      </div>

      {/* HIGHLIGHTED REQUIREMENT: "মাসিক সেটা গড় আকারে দেখা যাবে" */}
      <div className="bg-white rounded-2xl border-2 border-indigo-600/30 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                দৈনিক গড় হিসাব (Daily Average Performance)
              </h3>
              <p className="text-xs text-slate-500">
                {summary.monthName} মাসের সক্রিয় {toBanglaDigits(summary.activeDaysCount)} টি কার্যদিবসের গড় পরিসংখ্যান
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>মাসে মোট কার্যদিবস: {toBanglaDigits(summary.activeDaysCount)} দিন</span>
          </div>
        </div>

        {/* 3 Average Cards */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          {/* Daily Average Revenue */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
            <span className="text-xs font-bold text-emerald-800 uppercase block">
              দৈনিক গড় আয় (Daily Avg Income)
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {formatCurrency(summary.dailyAverageIncome)}
            </div>
            <p className="text-[11px] text-emerald-600 mt-1">
              মোট আয় ÷ {toBanglaDigits(summary.activeDaysCount)} কার্যদিবস
            </p>
          </div>

          {/* Daily Average Expense */}
          <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4">
            <span className="text-xs font-bold text-rose-800 uppercase block">
              দৈনিক গড় খরচ (Daily Avg Expense)
            </span>
            <div className="text-2xl font-black text-rose-700 mt-1">
              {formatCurrency(summary.dailyAverageExpense)}
            </div>
            <p className="text-[11px] text-rose-600 mt-1">
              মোট খরচ ÷ {toBanglaDigits(summary.activeDaysCount)} কার্যদিবস
            </p>
          </div>

          {/* Daily Average Net Balance */}
          <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4">
            <span className="text-xs font-bold text-indigo-800 uppercase block">
              দৈনিক গড় নিট উদ্বৃত্ত (Daily Net Margin)
            </span>
            <div className={`text-2xl font-black mt-1 ${
              summary.dailyAverageNet >= 0 ? 'text-indigo-700' : 'text-rose-700'
            }`}>
              {formatCurrency(summary.dailyAverageNet)}
            </div>
            <p className="text-[11px] text-indigo-600 mt-1">
              প্রতিদিনের গড় সঞ্চয় / উদ্বৃত্ত
            </p>
          </div>
        </div>
      </div>

      {/* Visual Chart: Day by Day comparison of income vs expenses */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              দিনভিত্তিক আয় ও ব্যয়ের তুলনামূলক চার্ট ({summary.monthName})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              সবুজ বার = আয় (বেতন), লাল বার = খরচ
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
              আদায়কৃত বেতন
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-500"></span>
              দৈনিক খরচ
            </span>
          </div>
        </div>

        {dailyBreakdown.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            এই মাসে কোনো দিনভিত্তিক লেনদেন পাওয়া যায়নি
          </div>
        ) : (
          <div className="mt-6 space-y-3.5">
            {dailyBreakdown.map((item) => {
              const incomePercent = Math.min(100, Math.round((item.income / maxDayAmount) * 100));
              const expensePercent = Math.min(100, Math.round((item.expense / maxDayAmount) * 100));

              return (
                <div key={item.date} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">
                      {formatBanglaDate(item.date)}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-700 font-semibold">
                        আয়: {formatCurrency(item.income)}
                      </span>
                      <span className="text-rose-600 font-semibold">
                        খরচ: {formatCurrency(item.expense)}
                      </span>
                      <span className={`font-bold ${item.net >= 0 ? 'text-indigo-700' : 'text-amber-700'}`}>
                        ব্যালেন্স: {formatCurrency(item.net)}
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex justify-end">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${incomePercent}%` }}
                        title={`আয়: ${item.income}`}
                      />
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex justify-start">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all"
                        style={{ width: `${expensePercent}%` }}
                        title={`খরচ: ${item.expense}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expense Categories Breakdown */}
      {categoryExpenses.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-indigo-600" />
            খাতভিত্তিক খরচের বিভাজন ({summary.monthName})
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {categoryExpenses.map(([cat, amt]) => {
              const pct = summary.totalExpense > 0 
                ? Math.round((amt / summary.totalExpense) * 100) 
                : 0;
              return (
                <div key={cat} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>{cat}</span>
                    <span className="text-rose-600 font-bold">{toBanglaDigits(pct)}%</span>
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-1">
                    {formatCurrency(amt)}
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
