import React from 'react';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';
import { StudentFee } from '../types';
import { 
  SCHOOL_INFO, 
  formatCurrency, 
  formatBanglaDate, 
  getTodayDateString, 
  toBanglaDigits, 
  getBanglaMonthYearLabel 
} from '../utils/formatters';

interface MonthlyFeePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthKey: string;
  fees: StudentFee[];
}

export const MonthlyFeePrintModal: React.FC<MonthlyFeePrintModalProps> = ({
  isOpen,
  onClose,
  monthKey,
  fees,
}) => {
  if (!isOpen) return null;

  const sortedFees = [...fees].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const totalAmount = sortedFees.reduce((sum, f) => sum + f.amount, 0);
  const monthLabel = getBanglaMonthYearLabel(monthKey);
  const todayStr = getTodayDateString();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #monthly-fee-print-area, #monthly-fee-print-area * {
            visibility: visible !important;
          }
          #monthly-fee-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="bg-white rounded-2xl max-w-4xl w-full my-auto shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {monthLabel} মাসের ফি আদায় রিপোর্ট ও প্রিন্ট
              </h3>
              <p className="text-xs text-slate-500">
                প্রিন্ট করুন অথবা ব্রাউজারের প্রিন্ট ডায়লগ থেকে PDF হিসেবে ডাউনলোড করুন
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              প্রিন্ট বা PDF সংরক্ষণ করুন
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Viewport */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div
            id="monthly-fee-print-area"
            className="bg-white w-full max-w-3xl p-8 sm:p-10 shadow-sm border border-slate-200 rounded-xl text-slate-900 flex flex-col justify-between"
          >
            {/* School Header */}
            <div>
              <div className="text-center border-b-2 border-slate-800 pb-4 mb-5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {SCHOOL_INFO.name}
                </h1>
                <p className="text-sm font-semibold text-slate-700 mt-1">
                  {SCHOOL_INFO.address}
                </p>
                <div className="inline-block mt-2 px-4 py-1 bg-slate-100 border border-slate-300 rounded-full text-xs font-bold text-slate-800 uppercase tracking-wide">
                  মাসিক বেতন ও ফি আদায়ের বিবরণী
                </div>
              </div>

              {/* Report Metadata */}
              <div className="flex items-center justify-between text-xs text-slate-700 mb-4 pb-2 border-b border-slate-200">
                <div>
                  <span className="font-bold text-slate-900">হিসাবের মাস: </span>
                  <span className="text-emerald-800 font-extrabold text-sm">{monthLabel}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">প্রিন্ট তারিখ: </span>
                  <span>{formatBanglaDate(todayStr)}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">মোট এন্ট্রি: </span>
                  <span>{toBanglaDigits(sortedFees.length)} টি</span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead className="bg-slate-100 text-slate-900 font-bold">
                    <tr>
                      <th className="border border-slate-300 py-2.5 px-3 text-center w-12">ক্র.</th>
                      <th className="border border-slate-300 py-2.5 px-3">তারিখ</th>
                      <th className="border border-slate-300 py-2.5 px-3">রসিদ নং</th>
                      <th className="border border-slate-300 py-2.5 px-3">আদায়কারী</th>
                      <th className="border border-slate-300 py-2.5 px-3">গ্রহণকারী</th>
                      <th className="border border-slate-300 py-2.5 px-3">বিবরণ / মন্তব্য</th>
                      <th className="border border-slate-300 py-2.5 px-3 text-right">পরিমাণ (টাকা)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFees.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="border border-slate-300 py-8 text-center text-slate-500">
                          এই মাসে কোনো ফি আদায়ের রেকর্ড নেই
                        </td>
                      </tr>
                    ) : (
                      sortedFees.map((fee, idx) => (
                        <tr key={fee.id} className="even:bg-slate-50">
                          <td className="border border-slate-300 py-2 px-3 text-center font-medium">
                            {toBanglaDigits(idx + 1)}
                          </td>
                          <td className="border border-slate-300 py-2 px-3 whitespace-nowrap">
                            {formatBanglaDate(fee.date)}
                          </td>
                          <td className="border border-slate-300 py-2 px-3 font-mono">
                            {fee.receiptNo}
                          </td>
                          <td className="border border-slate-300 py-2 px-3 font-semibold">
                            {fee.collectorName || fee.collectedBy || fee.studentName || '—'}
                          </td>
                          <td className="border border-slate-300 py-2 px-3">
                            {fee.receivedBy || 'অফিস'}
                          </td>
                          <td className="border border-slate-300 py-2 px-3 text-slate-600">
                            {fee.notes || fee.feeType || '—'}
                          </td>
                          <td className="border border-slate-300 py-2 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                            {formatCurrency(fee.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-black text-slate-950">
                      <td colSpan={6} className="border border-slate-300 py-2.5 px-3 text-right text-xs uppercase tracking-wider">
                        {monthLabel} মাসের সর্বমোট আদায়:
                      </td>
                      <td className="border border-slate-300 py-2.5 px-3 text-right text-sm text-emerald-800 whitespace-nowrap font-black">
                        {formatCurrency(totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Bottom Signatures Area */}
            <div className="pt-14 mt-8 border-t border-dashed border-slate-300">
              <div className="grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="border-t border-slate-500 pt-1 font-bold text-slate-800">
                    আদায়কারী / ক্যাশিয়ার
                  </div>
                  <span className="text-[10px] text-slate-500">স্বাক্ষর ও তারিখ</span>
                </div>
                <div>
                  <div className="border-t border-slate-500 pt-1 font-bold text-slate-800">
                    হিসাবরক্ষক
                  </div>
                  <span className="text-[10px] text-slate-500">যাচাই ও অনুমোদন</span>
                </div>
                <div>
                  <div className="border-t border-slate-500 pt-1 font-bold text-slate-800">
                    অধ্যক্ষ / প্রধান শিক্ষক
                  </div>
                  <span className="text-[10px] text-slate-500">চূড়ান্ত স্বাক্ষর ও সিল</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
