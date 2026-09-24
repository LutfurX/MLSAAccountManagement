import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  Search, 
  PlusCircle, 
  Trash2, 
  Eye, 
  Filter, 
  Calendar, 
  Printer,
  Pencil,
  History,
  FileText
} from 'lucide-react';
import { StudentFee } from '../types';
import { 
  formatCurrency, 
  formatBanglaDate, 
  toBanglaDigits, 
  getMonthKeyFromDate,
  getBanglaMonthYearLabel 
} from '../utils/formatters';
import { MonthlyFeePrintModal } from './MonthlyFeePrintModal';
import { EditFeeModal } from './EditFeeModal';
import { FeeEditHistoryModal } from './FeeEditHistoryModal';

interface FeeSectionProps {
  fees: StudentFee[];
  onOpenFeeModal: () => void;
  onDeleteFee: (id: string) => void;
  onUpdateFee: (updatedFee: StudentFee) => void;
  onViewReceipt: (fee: StudentFee) => void;
  isAdmin?: boolean;
}

export const FeeSection: React.FC<FeeSectionProps> = ({
  fees,
  onOpenFeeModal,
  onDeleteFee,
  onUpdateFee,
  onViewReceipt,
  isAdmin = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isPrintMonthModalOpen, setIsPrintMonthModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<StudentFee | null>(null);
  const [viewingHistoryFee, setViewingHistoryFee] = useState<StudentFee | null>(null);

  // Month-wise group keys
  const availableMonths = useMemo(() => {
    const keys = new Set<string>();
    fees.forEach((f) => keys.add(getMonthKeyFromDate(f.date)));
    const now = new Date();
    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    keys.add(current);
    return Array.from(keys).sort().reverse();
  }, [fees]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || '');

  // Fees filtered by selected month
  const monthFees = useMemo(() => {
    return fees.filter((f) => getMonthKeyFromDate(f.date) === selectedMonth);
  }, [fees, selectedMonth]);

  // Total collected for selected month
  const totalMonthAmount = useMemo(() => {
    return monthFees.reduce((sum, f) => sum + f.amount, 0);
  }, [monthFees]);

  // Filtered by search and class
  const filteredFees = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return [...monthFees]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((fee) => {
        const matchesClass = selectedClass === 'all' || fee.studentClass === selectedClass;
        if (!q) return matchesClass;
        const matchesSearch =
          (fee.collectorName && fee.collectorName.toLowerCase().includes(q)) ||
          (fee.receivedBy && fee.receivedBy.toLowerCase().includes(q)) ||
          (fee.collectedBy && fee.collectedBy.toLowerCase().includes(q)) ||
          (fee.studentName && fee.studentName.toLowerCase().includes(q)) ||
          (fee.receiptNo && fee.receiptNo.toLowerCase().includes(q)) ||
          (fee.notes && fee.notes.toLowerCase().includes(q));
        return matchesClass && matchesSearch;
      });
  }, [monthFees, selectedClass, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 rounded-2xl p-6 sm:p-7 text-white shadow-md flex items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-semibold mb-2">
            <Wallet className="w-3.5 h-3.5 text-amber-200" />
            <span>মাসভিত্তিক বেতন কালেকশন ও হিসাব</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            ছাত্র-ছাত্রীদের বেতন ও ফি এর খাতা
          </h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            প্রতিটি মাসের বেতন ও অন্যান্য ফি আলাদাভাবে এক জায়গায় সংরক্ষিত থাকে।
          </p>
        </div>

        {isAdmin ? (
          <button
            id="add-student-fee-btn"
            onClick={onOpenFeeModal}
            className="inline-flex items-center px-6 py-3.5 bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-base rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer active:scale-95 shrink-0"
          >
            <PlusCircle className="w-5 h-5 mr-2 text-emerald-600" />
            নতুন বেতন কালেকশন
          </button>
        ) : (
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/20 text-white text-xs font-bold border border-white/30 backdrop-blur-xs">
              <Eye className="w-4 h-4 text-amber-200" />
              <span>কমিটি ভিউ (শুধুমাত্র দেখার অনুমতি)</span>
            </span>
          </div>
        )}
      </div>

      {/* Month Selector Bar ("এগুলো মাস আকারে হবে একটা জায়গায়") */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600 shrink-0" />
          <span className="text-sm font-bold text-slate-800">মাস নির্বাচন করুন:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableMonths.map((mKey) => {
            const isSelected = selectedMonth === mKey;
            return (
              <button
                key={mKey}
                onClick={() => setSelectedMonth(mKey)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {getBanglaMonthYearLabel(mKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Month Total Collection Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-500 font-semibold block uppercase">
            {getBanglaMonthYearLabel(selectedMonth)} মাসের মোট কালেকশন
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {formatCurrency(totalMonthAmount)}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            নির্বাচিত মাসের সর্বমোট ফি আদায় ({toBanglaDigits(monthFees.length)} টি রসিদ)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPrintMonthModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
            title="পুরো মাসের হিসাব প্রিন্ট ও PDF এ রূপান্তর করুন"
          >
            <Printer className="w-4 h-4" />
            <span>পুরো মাসের হিসাব প্রিন্ট / PDF</span>
          </button>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Fees Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              {getBanglaMonthYearLabel(selectedMonth)} মাসের ফি আদায়ের বিস্তারিত তালিকা
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              মোট {toBanglaDigits(filteredFees.length)} টি এন্ট্রি দৃশ্যমান
            </p>
          </div>

          {/* Search & Class Filter & Print Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="আদায়কারী, রসিদ বা বিবরণ দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-48 sm:w-56"
              />
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
            >
              <option value="all">সকল শ্রেণি</option>
              <option value="প্লে">প্লে</option>
              <option value="নার্সারি">নার্সারি</option>
              <option value="১ম শ্রেণি">১ম শ্রেণি</option>
              <option value="২য় শ্রেণি">২য় শ্রেণি</option>
              <option value="৩য় শ্রেণি">৩য় শ্রেণি</option>
              <option value="৪র্থ শ্রেণি">৪র্থ শ্রেণি</option>
              <option value="৫ম শ্রেণি">৫ম শ্রেণি</option>
              <option value="৬ষ্ঠ শ্রেণি">৬ষ্ঠ শ্রেণি</option>
              <option value="৭ম শ্রেণি">৭ম শ্রেণি</option>
              <option value="৮ম শ্রেণি">৮ম শ্রেণি</option>
            </select>

            <button
              onClick={() => setIsPrintMonthModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="পুরো মাসের হিসাব প্রিন্ট বা PDF করুন"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">প্রিন্ট / PDF</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">আদায়ের তারিখ</th>
                <th className="py-3 px-4">রসিদ নং</th>
                <th className="py-3 px-4">আদায়কারী</th>
                <th className="py-3 px-4">গ্রহণকারী</th>
                <th className="py-3 px-4">বিবরণ / মন্তব্য</th>
                <th className="py-3 px-4 text-right">টাকা</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    এই মাসে কোনো ফি আদায়ের রেকর্ড পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => {
                  const hasEditHistory = fee.editHistory && fee.editHistory.length > 0;
                  return (
                    <tr key={fee.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {formatBanglaDate(fee.date)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{fee.receiptNo}</span>
                          {hasEditHistory && (
                            <button
                              onClick={() => setViewingHistoryFee(fee)}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                              title="এডিট হিস্ট্রি দেখুন"
                            >
                              <History className="w-2.5 h-2.5" />
                              <span>সংশোধিত</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {fee.collectorName || fee.collectedBy || fee.studentName || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {fee.receivedBy || 'অফিস'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                        {fee.notes || fee.feeType || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-black text-emerald-700">
                        {formatCurrency(fee.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap space-x-1">
                        {/* View Receipt */}
                        <button
                          onClick={() => onViewReceipt(fee)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors inline-flex cursor-pointer"
                          title="রসিদ দেখুন / প্রিন্ট"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Edit History button if edited */}
                        {hasEditHistory && (
                          <button
                            onClick={() => setViewingHistoryFee(fee)}
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
                              onClick={() => setEditingFee(fee)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors inline-flex cursor-pointer"
                              title="এডিট / সংশোধন করুন"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {/* Delete button */}
                            <button
                              onClick={() => {
                                if (window.confirm('আপনি কি এই ফি রেকর্ডটি মুছে ফেলতে চান?')) {
                                  onDeleteFee(fee.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors inline-flex cursor-pointer"
                              title="মুছুন"
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

      {/* Monthly Print / PDF Modal */}
      <MonthlyFeePrintModal
        isOpen={isPrintMonthModalOpen}
        onClose={() => setIsPrintMonthModalOpen(false)}
        monthKey={selectedMonth}
        fees={monthFees}
      />

      {/* Edit Fee Modal */}
      <EditFeeModal
        isOpen={!!editingFee}
        onClose={() => setEditingFee(null)}
        fee={editingFee}
        onSave={(updated) => {
          onUpdateFee(updated);
          setEditingFee(null);
        }}
      />

      {/* Fee Edit History Modal */}
      <FeeEditHistoryModal
        isOpen={!!viewingHistoryFee}
        onClose={() => setViewingHistoryFee(null)}
        fee={viewingHistoryFee}
      />
    </div>
  );
};
