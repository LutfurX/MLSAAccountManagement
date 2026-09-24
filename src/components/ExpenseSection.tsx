import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Trash2, 
  Receipt, 
  Tag, 
  Calendar,
  CreditCard,
  DollarSign,
  Image as ImageIcon,
  Eye,
  Printer,
  Pencil,
  History
} from 'lucide-react';
import { SchoolExpense } from '../types';
import { 
  formatCurrency, 
  formatBanglaDate, 
  getTodayDateString, 
  toBanglaDigits,
  getMonthKeyFromDate,
  getBanglaMonthYearLabel
} from '../utils/formatters';
import { VoucherPreviewModal } from './VoucherPreviewModal';
import { MonthlyExpensePrintModal } from './MonthlyExpensePrintModal';
import { EditExpenseModal } from './EditExpenseModal';
import { ExpenseEditHistoryModal } from './ExpenseEditHistoryModal';

interface ExpenseSectionProps {
  expenses: SchoolExpense[];
  onOpenExpenseModal: () => void;
  onDeleteExpense: (id: string) => void;
  onUpdateExpense: (updatedExpense: SchoolExpense) => void;
  todayExpense: number;
  isAdmin?: boolean;
}

export const ExpenseSection: React.FC<ExpenseSectionProps> = ({
  expenses,
  onOpenExpenseModal,
  onDeleteExpense,
  onUpdateExpense,
  todayExpense,
  isAdmin = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [previewVoucher, setPreviewVoucher] = useState<SchoolExpense | null>(null);
  const [isPrintMonthModalOpen, setIsPrintMonthModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<SchoolExpense | null>(null);
  const [viewingHistoryExpense, setViewingHistoryExpense] = useState<SchoolExpense | null>(null);

  const todayStr = getTodayDateString();

  // Available months for filtering and printing
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => {
      const m = getMonthKeyFromDate(e.date);
      if (m) set.add(m);
    });
    const currentM = getMonthKeyFromDate(todayStr);
    set.add(currentM);
    return Array.from(set).sort().reverse();
  }, [expenses, todayStr]);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return getMonthKeyFromDate(todayStr);
  });

  // Expenses for the selected month
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => getMonthKeyFromDate(e.date) === selectedMonth);
  }, [expenses, selectedMonth]);

  const totalMonthExpense = useMemo(() => {
    return monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [monthExpenses]);

  // Extract all distinct categories
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    ['অফিস খরচ', 'আপ্যায়ন', 'মোবাইল বিল', 'বিদ্যুৎ বিল'].forEach(c => set.add(c));
    expenses.forEach(e => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((exp) => {
        // Also match month if date filter is not specifically picked
        const matchesMonth = !selectedMonth || getMonthKeyFromDate(exp.date) === selectedMonth;
        const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
        const matchesDate = !selectedDate || exp.date === selectedDate;
        if (!q) return matchesMonth && matchesCategory && matchesDate;
        const matchesSearch =
          (exp.title && exp.title.toLowerCase().includes(q)) ||
          (exp.category && exp.category.toLowerCase().includes(q)) ||
          (exp.voucherNo && exp.voucherNo.toLowerCase().includes(q)) ||
          (exp.notes && exp.notes.toLowerCase().includes(q));
        return matchesMonth && matchesCategory && matchesDate && matchesSearch;
      });
  }, [expenses, selectedMonth, selectedCategory, selectedDate, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner with "আজকের খরচ" explicit CTA */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-pink-700 rounded-2xl p-6 sm:p-7 text-white shadow-md flex items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-rose-100 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>দৈনিক খরচ ব্যবস্থাপনা</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            মোগলগাঁও লিটল স্টার একাডেমির ব্যয়ের হিসাব
          </h2>
          <p className="text-rose-100 text-sm mt-1 max-w-xl">
            অফিস খরচ, আপ্যায়ন, মোবাইল ও বিদ্যুৎ বিলসহ সকল ব্যয়ের হিসাব ও ভাউচার পরিচালনা করুন।
          </p>
        </div>

        {isAdmin ? (
          <div className="shrink-0">
            <button
              id="today-expense-action-btn"
              onClick={onOpenExpenseModal}
              className="inline-flex items-center px-6 py-4 bg-white hover:bg-rose-50 text-rose-700 font-extrabold text-base rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-5 h-5 mr-2 text-rose-600 animate-pulse" />
              আজকের খরচ যোগ করুন
            </button>
          </div>
        ) : (
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/20 text-white text-xs font-bold border border-white/30 backdrop-blur-xs">
              <Eye className="w-4 h-4 text-amber-200" />
              <span>কমিটি ভিউ (শুধুমাত্র দেখার অনুমতি)</span>
            </span>
          </div>
        )}
      </div>

      {/* Month Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
          <Calendar className="w-3.5 h-3.5" />
          মাস নির্বাচন:
        </span>
        {availableMonths.map((m) => {
          const isActive = selectedMonth === m;
          return (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {getBanglaMonthYearLabel(m)}
            </button>
          );
        })}
      </div>

      {/* Month Total Expense & KPI Card with prominent Print button */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-500 font-semibold block uppercase">
            {getBanglaMonthYearLabel(selectedMonth)} মাসের মোট ব্যয়
          </span>
          <div className="text-3xl font-extrabold text-rose-600 mt-1">
            {formatCurrency(totalMonthExpense)}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            নির্বাচিত মাসের সর্বমোট খরচ ({toBanglaDigits(monthExpenses.length)} টি ভাউচার)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPrintMonthModalOpen(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
            title="পুরো মাসের খরচের হিসাব প্রিন্ট ও PDF এ রূপান্তর করুন"
          >
            <Printer className="w-4 h-4" />
            <span>পুরো মাসের খরচ প্রিন্ট / PDF</span>
          </button>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">আজকের মোট খরচ</span>
            <div className="text-2xl font-bold text-rose-600 mt-1">
              {formatCurrency(todayExpense)}
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">
              {formatBanglaDate(todayStr)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">নির্বাচিত মাসের ভাউচার</span>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              {toBanglaDigits(monthExpenses.length)} টি
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">
              {getBanglaMonthYearLabel(selectedMonth)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">সর্বমোট খরচ রেকর্ড</span>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              {toBanglaDigits(expenses.length)} টি
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">
              এখন পর্যন্ত মোট ব্যয় ভাউচার
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Tag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Expense Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-600" />
              {getBanglaMonthYearLabel(selectedMonth)} মাসের খরচের ভাউচার তালিকা
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ফিল্টার ও অনুসন্ধান করে যেকোনো খরচের বিবরণ ও ভাউচার দেখুন
            </p>
          </div>

          {/* Search, Filter & Print Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="খরচের বিবরণ বা ক্যাটাগরি..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500 w-44 sm:w-52"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
            >
              <option value="all">সকল ক্যাটাগরি</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
            />

            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-xs text-rose-600 hover:underline px-1 cursor-pointer"
              >
                রিসেট
              </button>
            )}

            <button
              onClick={() => setIsPrintMonthModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="পুরো মাসের খরচের হিসাব প্রিন্ট বা PDF করুন"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">প্রিন্ট / PDF</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4">ক্যাটাগরি</th>
                <th className="py-3 px-4">খরচের বিবরণ</th>
                <th className="py-3 px-4 text-center">ভাউচার</th>
                <th className="py-3 px-4 text-right">পরিমাণ (টাকা)</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    কোনো খরচের হিসাব পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const hasEditHistory = exp.editHistory && exp.editHistory.length > 0;
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {formatBanglaDate(exp.date)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-900 font-medium">
                        <div className="flex items-center gap-2">
                          <span>{exp.title}</span>
                          {hasEditHistory && (
                            <button
                              onClick={() => setViewingHistoryExpense(exp)}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                              title="এডিট হিস্ট্রি দেখুন"
                            >
                              <History className="w-2.5 h-2.5" />
                              <span>সংশোধিত</span>
                            </button>
                          )}
                        </div>
                        {exp.notes && (
                          <div className="text-xs text-slate-400 mt-0.5">{exp.notes}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {exp.voucherImage ? (
                          <button
                            onClick={() => setPreviewVoucher(exp)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                            title="ভাউচার দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ভাউচার কপি</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-black text-rose-600 text-base">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap space-x-1">
                        {/* Edit History button if edited */}
                        {hasEditHistory && (
                          <button
                            onClick={() => setViewingHistoryExpense(exp)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition-colors inline-flex cursor-pointer"
                            title="এডিট হিস্ট্রি দেখুন"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            {/* Edit button */}
                            <button
                              onClick={() => setEditingExpense(exp)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors inline-flex cursor-pointer"
                              title="এডিট / সংশোধন করুন"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {/* Delete button */}
                            <button
                              onClick={() => {
                                if (window.confirm('আপনি কি এই খরচের এন্ট্রিটি মুছে ফেলতে চান?')) {
                                  onDeleteExpense(exp.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="খরচ মুছুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voucher preview modal */}
      {previewVoucher && (
        <VoucherPreviewModal
          isOpen={!!previewVoucher}
          onClose={() => setPreviewVoucher(null)}
          imageUrl={previewVoucher.voucherImage}
          title={previewVoucher.title}
          amount={previewVoucher.amount}
          date={previewVoucher.date}
        />
      )}

      {/* Monthly Print / PDF Modal */}
      <MonthlyExpensePrintModal
        isOpen={isPrintMonthModalOpen}
        onClose={() => setIsPrintMonthModalOpen(false)}
        monthKey={selectedMonth}
        expenses={monthExpenses}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
        onSave={(updated) => {
          onUpdateExpense(updated);
          setEditingExpense(null);
        }}
      />

      {/* Expense Edit History Modal */}
      <ExpenseEditHistoryModal
        isOpen={!!viewingHistoryExpense}
        onClose={() => setViewingHistoryExpense(null)}
        expense={viewingHistoryExpense}
      />
    </div>
  );
};
