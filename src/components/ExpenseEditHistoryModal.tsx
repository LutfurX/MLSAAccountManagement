import React from 'react';
import { History, X, Clock, ArrowRight, AlertCircle, Calendar, Tag, DollarSign } from 'lucide-react';
import { SchoolExpense } from '../types';
import { 
  formatCurrency, 
  formatBanglaDate, 
  formatBanglaDateTime, 
  toBanglaDigits 
} from '../utils/formatters';

interface ExpenseEditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: SchoolExpense | null;
}

export const ExpenseEditHistoryModal: React.FC<ExpenseEditHistoryModalProps> = ({
  isOpen,
  onClose,
  expense,
}) => {
  if (!isOpen || !expense) return null;

  const history = expense.editHistory || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full my-auto shadow-2xl border border-slate-200 flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                খরচের এডিট হিস্ট্রি (সংশোধন লগ)
              </h3>
              <p className="text-xs text-slate-500">
                খাত: <span className="font-bold text-slate-700">{expense.category}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Current State Summary Card */}
        <div className="bg-slate-50 p-4 border-b border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            বর্তমান সক্রিয় তথ্য
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">তারিখ:</span>
              <span className="font-bold text-slate-800">{formatBanglaDate(expense.date)}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">টাকার পরিমাণ:</span>
              <span className="font-extrabold text-rose-600">{formatCurrency(expense.amount)}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">ক্যাটাগরি:</span>
              <span className="font-semibold text-slate-800">{expense.category}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">বিবরণ:</span>
              <span className="font-semibold text-slate-800 truncate block">{expense.title}</span>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {history.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">কোনো এডিট হিস্ট্রি নেই</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                এই খরচের রেকর্ডটি এখনও কোনো প্রকার পরিবর্তন বা সংশোধন করা হয়নি।
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                <span>মোট সংশোধন সংখ্যা: {toBanglaDigits(history.length)} বার</span>
                <span>(সর্বশেষ থেকে পুরাতন)</span>
              </div>

              {history.map((log, index) => (
                <div
                  key={log.id || index}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs relative hover:border-amber-300 transition-colors"
                >
                  {/* Log Item Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                        সংশোধন #{toBanglaDigits(history.length - index)}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatBanglaDateTime(log.editedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Reason if specified */}
                  {log.reason && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50/60 border border-amber-100 text-xs text-amber-900 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">সংশোধনের কারণ: </span>
                        <span>{log.reason}</span>
                      </div>
                    </div>
                  )}

                  {/* Field Changes */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500">
                      পরিবর্তিত তথ্যাবলি:
                    </div>
                    {log.changes.map((ch, chIdx) => (
                      <div
                        key={chIdx}
                        className="bg-slate-50 rounded-lg p-2.5 text-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                      >
                        <span className="font-bold text-slate-700 min-w-[90px]">
                          {ch.field}:
                        </span>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="line-through text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                            {ch.oldValue}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            {ch.newValue}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
