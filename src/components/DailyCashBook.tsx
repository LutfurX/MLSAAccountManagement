import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  ChevronUp, 
  Printer, 
  Wallet, 
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { StudentFee, SchoolExpense, DayAccountSummary } from '../types';
import { 
  formatCurrency, 
  formatBanglaDate, 
  toBanglaDigits, 
  getTodayDateString,
  SCHOOL_INFO 
} from '../utils/formatters';

interface DailyCashBookProps {
  fees: StudentFee[];
  expenses: SchoolExpense[];
  dailySummaries: Record<string, DayAccountSummary>;
  onOpenExpenseModalWithDate: (date: string) => void;
  onOpenFeeModalWithDate: (date: string) => void;
}

export const DailyCashBook: React.FC<DailyCashBookProps> = ({
  fees,
  expenses,
  dailySummaries,
  onOpenExpenseModalWithDate,
  onOpenFeeModalWithDate,
}) => {
  const [expandedDate, setExpandedDate] = useState<string | null>(getTodayDateString());
  const [searchDate, setSearchDate] = useState<string>('');

  // Sort dates descending
  const sortedDates = useMemo(() => {
    const dates = Object.keys(dailySummaries);
    // Ensure today is present
    const today = getTodayDateString();
    if (!dates.includes(today)) {
      dates.push(today);
    }
    return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [dailySummaries]);

  // Filter dates if user picked a date
  const displayDates = useMemo(() => {
    if (!searchDate) return sortedDates;
    return sortedDates.filter((d) => d === searchDate);
  }, [sortedDates, searchDate]);

  // Toggle accordion
  const toggleExpand = (date: string) => {
    setExpandedDate((prev) => (prev === date ? null : date));
  };

  const handlePrintDailySheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title & Explanatory Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-md flex items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-blue-100 text-xs font-semibold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-200" />
            <span>দৈনিক আয়-ব্যয় যোগ-বিয়োগ কাউন্টার</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            দৈনিক ক্যাশ ও লাভ-ক্ষতি হিসাব
          </h2>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            একই দিনের ছাত্র-ছাত্রীদের বেতন এবং ঐ দিনের খরচ স্বয়ংক্রিয়ভাবে যোগ-বিয়োগ হয়ে প্রতিটি তারিখের নেট ব্যালেন্স প্রদর্শিত হয়।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="px-3 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/30 focus:outline-hidden backdrop-blur-xs cursor-pointer"
            title="নির্দিষ্ট তারিখের হিসাব দেখুন"
          />
          {searchDate && (
            <button
              onClick={() => setSearchDate('')}
              className="px-2 py-1 bg-white/20 text-white text-xs rounded hover:bg-white/30 cursor-pointer"
            >
              সব তারিখ
            </button>
          )}
          <button
            onClick={handlePrintDailySheet}
            className="inline-flex items-center px-3.5 py-2 bg-white text-slate-900 hover:bg-blue-50 font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 mr-1.5 text-indigo-600" />
            ক্যাশ শিট প্রিন্ট
          </button>
        </div>
      </div>

      {/* Daily Ledger Table / Timeline */}
      <div className="space-y-4">
        {displayDates.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-slate-400 border border-slate-200">
            এই তারিখে কোনো আয় বা খরচের হিসাব পাওয়া যায়নি
          </div>
        ) : (
          displayDates.map((date) => {
            const summary = dailySummaries[date] || {
              date,
              totalIncome: 0,
              incomeCount: 0,
              totalExpense: 0,
              expenseCount: 0,
              netBalance: 0,
            };

            const dayFees = fees.filter((f) => f.date === date);
            const dayExpenses = expenses.filter((e) => e.date === date);
            const isExpanded = expandedDate === date;
            const isSurplus = summary.netBalance >= 0;

            return (
              <div
                key={date}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
              >
                {/* Accordion Header / Date Summary Row */}
                <div
                  onClick={() => toggleExpand(date)}
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 select-none border-b border-transparent data-[expanded=true]:border-slate-100"
                  data-expanded={isExpanded}
                >
                  {/* Date & Indicator */}
                  <div className="flex items-center space-x-3.5">
                    <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 ${
                      isSurplus ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                          {formatBanglaDate(date)}
                        </h3>
                        {date === getTodayDateString() && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-600 text-white">
                            আজকের হিসাব
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        বেতন আদায়: {toBanglaDigits(dayFees.length)} টি • খরচ ভাউচার: {toBanglaDigits(dayExpenses.length)} টি
                      </p>
                    </div>
                  </div>

                  {/* Math Row: (+) আয় - (-) ব্যয় = (=) নেট ব্যালেন্স */}
                  <div className="flex items-center gap-6">
                    {/* Income */}
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                        মোট বেতন আয় (+)
                      </span>
                      <span className="text-base font-bold text-emerald-600 flex items-center justify-end gap-0.5">
                        <ArrowUpRight className="w-4 h-4" />
                        {formatCurrency(summary.totalIncome)}
                      </span>
                    </div>

                    <span className="inline text-slate-300 font-bold text-lg">-</span>

                    {/* Expense */}
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                        আজকের মোট খরচ (-)
                      </span>
                      <span className="text-base font-bold text-rose-600 flex items-center justify-end gap-0.5">
                        <ArrowDownRight className="w-4 h-4" />
                        {formatCurrency(summary.totalExpense)}
                      </span>
                    </div>

                    <span className="inline text-slate-300 font-bold text-lg">=</span>

                    {/* Net Balance */}
                    <div className="text-right min-w-[130px]">
                      <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                        দিনের উদ্বৃত্ত / ব্যালেন্স
                      </span>
                      <span className={`text-base sm:text-lg font-black flex items-center gap-1 ${
                        isSurplus ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {isSurplus ? (
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-rose-600" />
                        )}
                        {formatCurrency(summary.netBalance)}
                      </span>
                    </div>

                    <div className="text-slate-400 pl-2">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Breakdown for this specific date */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 bg-slate-50/60 border-t border-slate-100 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Left: Fees Collected on this day */}
                      <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-2xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                            <Wallet className="w-4 h-4 text-emerald-600" />
                            আদায়কৃত বেতন তালিকা ({toBanglaDigits(dayFees.length)} জন)
                          </h4>
                          <span className="text-xs font-bold text-emerald-700">
                            মোট: {formatCurrency(summary.totalIncome)}
                          </span>
                        </div>

                        {dayFees.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">
                            এই তারিখে কোনো বেতন আদায় রেকর্ড নেই
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100 mt-2 max-h-64 overflow-y-auto pr-1">
                            {dayFees.map((f) => (
                              <div key={f.id} className="py-2.5 flex items-center justify-between text-xs border-b border-slate-100 last:border-0">
                                <div>
                                  <div className="font-bold text-slate-800 text-sm">
                                    আদায়কারী: {f.collectorName || f.collectedBy || f.studentName || '—'}
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    গ্রহণকারী: <span className="font-medium text-slate-700">{f.receivedBy || 'অফিস'}</span>
                                    {f.notes && <span> • {f.notes}</span>}
                                  </div>
                                </div>
                                <span className="font-black text-emerald-700 text-base">
                                  {formatCurrency(f.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Expenses on this day */}
                      <div className="bg-white rounded-xl p-4 border border-rose-100 shadow-2xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <h4 className="text-sm font-bold text-rose-800 flex items-center gap-1.5">
                            <Receipt className="w-4 h-4 text-rose-600" />
                            আজকের খরচের তালিকা ({toBanglaDigits(dayExpenses.length)} টি)
                          </h4>
                          <span className="text-xs font-bold text-rose-700">
                            মোট: {formatCurrency(summary.totalExpense)}
                          </span>
                        </div>

                        {dayExpenses.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">
                            এই তারিখে কোনো খরচের ভাউচার নেই
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100 mt-2 max-h-64 overflow-y-auto pr-1">
                            {dayExpenses.map((exp) => (
                              <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs border-b border-slate-100 last:border-0">
                                <div>
                                  <span className="font-bold text-slate-800 text-sm">{exp.title}</span>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    <span className="font-medium text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 mr-1.5">
                                      {exp.category}
                                    </span>
                                    {exp.voucherImage && (
                                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1 py-0.5 rounded">
                                        ✓ ভাউচার কপি আছে
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="font-black text-rose-600 text-base">
                                  {formatCurrency(exp.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Summary Footer bar for this day */}
                    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          {formatBanglaDate(date)} দিনের সমাপ্তি ফলাফল:
                        </span>
                        {isSurplus ? (
                          <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                            নিট উদ্বৃত্ত: {formatCurrency(summary.netBalance)}
                          </span>
                        ) : (
                          <span className="text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded">
                            নিট ঘাটতি: {formatCurrency(Math.abs(summary.netBalance))}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400">
                        {SCHOOL_INFO.name} • দৈনিক ক্যাশ বুক
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
