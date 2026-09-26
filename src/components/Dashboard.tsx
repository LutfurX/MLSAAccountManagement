import React from 'react';
import { 
  Building2, 
  Wallet, 
  Sparkles, 
  Landmark, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Receipt, 
  Clock, 
  ChevronRight,
  GraduationCap,
  Scale
} from 'lucide-react';
import { StudentFee, SchoolExpense, BankTransaction, DayAccountSummary } from '../types';
import { 
  formatCurrency, 
  formatBanglaDate, 
  getTodayDateString, 
  toBanglaDigits, 
  SCHOOL_INFO 
} from '../utils/formatters';

interface DashboardProps {
  fees: StudentFee[];
  expenses: SchoolExpense[];
  bankTransactions: BankTransaction[];
  bankBalance: number;
  todayIncome: number;
  todayExpense: number;
  todayBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
  dailyAvgIncome: number;
  dailyAvgExpense: number;
  onOpenFeeModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenBankModal?: (type: 'credit' | 'debit') => void;
  onNavigateTab: (tab: string) => void;
  onViewReceipt: (fee: StudentFee) => void;
  isAdmin?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  fees,
  expenses,
  bankTransactions,
  bankBalance,
  todayIncome,
  todayExpense,
  todayBalance,
  monthlyIncome,
  monthlyExpense,
  monthlyNet,
  dailyAvgIncome,
  dailyAvgExpense,
  onOpenFeeModal,
  onOpenExpenseModal,
  onOpenBankModal,
  onNavigateTab,
  onViewReceipt,
  isAdmin = true,
}) => {
  const todayStr = getTodayDateString();

  // Recent transactions across fees, expenses and bank
  const recentActivities = React.useMemo(() => {
    const list: Array<{
      id: string;
      date: string;
      category: 'fee' | 'expense' | 'bank';
      title: string;
      subtitle: string;
      amount: number;
      isPositive: boolean;
      rawObj: any;
    }> = [];

    fees.slice(-5).forEach((f) => {
      const collector = f.collectorName || f.collectedBy || f.studentName || 'আদায়কারী';
      const receiver = f.receivedBy ? ` • গ্রহণ: ${f.receivedBy}` : '';
      list.push({
        id: `fee-${f.id}`,
        date: f.date,
        category: 'fee',
        title: `আদায়কারী: ${collector}`,
        subtitle: `${f.notes ? f.notes : f.feeType || 'বেতন আদায়'}${receiver}`,
        amount: f.amount,
        isPositive: true,
        rawObj: f,
      });
    });

    expenses.slice(-5).forEach((e) => {
      list.push({
        id: `exp-${e.id}`,
        date: e.date,
        category: 'expense',
        title: e.title,
        subtitle: `ক্যাটাগরি: ${e.category}${e.voucherImage ? ' • ভাউচার সংযুক্ত' : ''}`,
        amount: e.amount,
        isPositive: false,
        rawObj: e,
      });
    });

    bankTransactions.slice(-5).forEach((b) => {
      list.push({
        id: `bank-${b.id}`,
        date: b.date,
        category: 'bank',
        title: b.source,
        subtitle: `ব্যাংক ${b.type === 'credit' ? 'জমা' : 'উত্তোলন'} • ${b.referenceNo}`,
        amount: b.amount,
        isPositive: b.type === 'credit',
        rawObj: b,
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);
  }, [fees, expenses, bankTransactions]);

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 shrink-0 rounded-2xl bg-white p-1 shadow-md border-2 border-indigo-400/40 overflow-hidden flex items-center justify-center">
              <img
                src="/school_logo.jpg"
                alt="School Crest"
                className="w-full h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-1.5 border border-indigo-400/30">
                <Building2 className="w-3.5 h-3.5" />
                <span>মোগলগাঁও, জালালাবাদ, সিলেট • স্থাপিত: ২০১৬</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white">
                {SCHOOL_INFO.name}
              </h2>
              <p className="text-slate-300 text-sm mt-1 max-w-xl">
                দৈনিক ছাত্র-ছাত্রীদের বেতন তোলা, আজকের খরচ এন্ট্রি, ব্যাংকের ব্যালেন্স ও হিস্ট্রি এবং মাসিক গড় হিসাব নিকাশ।
              </p>
            </div>
          </div>

          {/* Quick Action Command Center */}
          <div className="flex items-center gap-3 shrink-0">
            {isAdmin ? (
              <>
                {/* 1. New Fee */}
                <button
                  onClick={onOpenFeeModal}
                  className="flex items-center justify-center px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  বেতন কালেকশন
                </button>

                {/* 2. Today's Expense (USER EMPHASIZED) */}
                <button
                  onClick={onOpenExpenseModal}
                  className="flex items-center justify-center px-5 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 mr-1.5 text-amber-200" />
                  আজকের খরচ
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('fees')}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer"
                >
                  ফি তালিকা দেখুন
                </button>
                <button
                  onClick={() => onNavigateTab('expenses')}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer"
                >
                  খরচের হিসাব দেখুন
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 Core Vital Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Today's Collection */}
        <div 
          onClick={() => onNavigateTab('fees')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">আজকের বেতন আয়</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {formatCurrency(todayIncome)}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>{formatBanglaDate(todayStr)}</span>
            <span className="text-indigo-600 font-semibold group-hover:underline flex items-center">
              বিস্তারিত <ChevronRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* Today's Expense */}
        <div 
          onClick={() => onNavigateTab('expenses')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">আজকের মোট খরচ</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">
            {formatCurrency(todayExpense)}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>আজকের খরচের তালিকা</span>
            <span className="text-rose-600 font-semibold group-hover:underline flex items-center">
              দেখুন <ChevronRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* Today's Net Balance (Math of Today: Income - Expense) */}
        <div 
          onClick={() => onNavigateTab('dashboard')}
          className={`p-5 rounded-2xl border shadow-xs transition-all ${
            todayBalance >= 0 
              ? 'bg-blue-50/50 border-blue-200' 
              : 'bg-amber-50/50 border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">আজকের যোগ-বিয়োগ স্থিতি</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              todayBalance >= 0 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
            }`}>
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-black mt-2 ${
            todayBalance >= 0 ? 'text-blue-700' : 'text-amber-700'
          }`}>
            {formatCurrency(todayBalance)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            (বেতন আয় - আজকের খরচ = উদ্বৃত্ত)
          </p>
        </div>

        {/* Current Bank Balance */}
        <div 
          onClick={() => onNavigateTab('bank')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">বর্তমান ব্যাংক ব্যালেন্স</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-2">
            {formatCurrency(bankBalance)}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>ক্রেডিট ও ডেবিট হিস্ট্রি</span>
            <span className="text-indigo-600 font-semibold group-hover:underline flex items-center">
              হিস্ট্রি <ChevronRight className="w-3 h-3" />
            </span>
          </p>
        </div>
      </div>

      {/* Monthly Performance Highlight */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              চলতি মাসের হিসাব বিবরণী
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              চলতি মাসে সংগৃহীত মোট বেতন এবং মোট খরচের পরিসংখ্যান
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs font-bold text-slate-700 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              <span>বার্ষিক অডিট শিট</span>
            </button>
            <button
              onClick={() => onNavigateTab('monthly')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              পূর্ণাঙ্গ মাসিক রিপোর্ট <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">চলতি মাসের মোট আয়</span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-700 block mt-1">
              {formatCurrency(monthlyIncome)}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">চলতি মাসের মোট ব্যয়</span>
            <span className="text-xl sm:text-2xl font-bold text-rose-600 block mt-1">
              {formatCurrency(monthlyExpense)}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Combined Activity (Full Width) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            সাম্প্রতিক লেনদেনের বিবরণী
          </h4>
          <span className="text-xs text-slate-400">সর্বশেষ কার্যক্রম</span>
        </div>

        {recentActivities.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            এখনও কোনো লেনদেনের হিসাব লিপিবদ্ধ করা হয়নি। নতুন বেতন, খরচ বা ব্যাংক লেনদেন যুক্ত করুন।
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-2">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    act.category === 'fee'
                      ? 'bg-emerald-100 text-emerald-700'
                      : act.category === 'expense'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {act.category === 'fee' ? (
                      <Wallet className="w-4 h-4" />
                    ) : act.category === 'expense' ? (
                      <Receipt className="w-4 h-4" />
                    ) : (
                      <Landmark className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{act.title}</p>
                    <p className="text-xs text-slate-400 truncate">{act.subtitle} • {formatBanglaDate(act.date)}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`font-black text-sm ${act.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {act.isPositive ? '+' : '-'} {formatCurrency(act.amount)}
                  </span>
                  {act.category === 'fee' && (
                    <button
                      onClick={() => onViewReceipt(act.rawObj)}
                      className="block text-[11px] text-indigo-600 hover:underline mt-0.5 cursor-pointer ml-auto"
                    >
                      রসিদ দেখুন
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
