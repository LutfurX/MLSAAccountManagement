import React from 'react';
import { History, X, Clock, ArrowRight, AlertCircle, Calendar, User, DollarSign } from 'lucide-react';
import { StudentFee } from '../types';
import { 
  formatCurrency, 
  formatBanglaDate, 
  formatBanglaDateTime, 
  toBanglaDigits 
} from '../utils/formatters';

interface FeeEditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  fee: StudentFee | null;
}

export const FeeEditHistoryModal: React.FC<FeeEditHistoryModalProps> = ({
  isOpen,
  onClose,
  fee,
}) => {
  if (!isOpen || !fee) return null;

  const history = fee.editHistory || [];

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
                এডিট হিস্ট্রি (সংশোধন লগ)
              </h3>
              <p className="text-xs text-slate-500">
                রসিদ নং: <span className="font-mono font-bold text-slate-700">{fee.receiptNo}</span>
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
              <span className="font-bold text-slate-800">{formatBanglaDate(fee.date)}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">টাকার পরিমাণ:</span>
              <span className="font-extrabold text-emerald-700">{formatCurrency(fee.amount)}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">আদায়কারী:</span>
              <span className="font-semibold text-slate-800">
                {fee.collectorName || fee.collectedBy || fee.studentName || '—'}
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">গ্রহণকারী:</span>
              <span className="font-semibold text-slate-800">{fee.receivedBy || 'অফিস'}</span>
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
                এই ফি রেকর্ডটি এখনও কোনো প্রকার পরিবর্তন বা সংশোধন করা হয়নি।
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
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{formatBanglaDateTime(log.editedAt)}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      সংশোধন #{toBanglaDigits(history.length - index)}
                    </span>
                  </div>

                  {/* Reason if available */}
                  {log.reason && (
                    <div className="mb-3 text-xs bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60 text-amber-900">
                      <span className="font-bold">সংশোধনের কারণ: </span>
                      <span>{log.reason}</span>
                    </div>
                  )}

                  {/* Changes List */}
                  <div className="space-y-2">
                    {log.changes.map((ch, chIdx) => (
                      <div
                        key={chIdx}
                        className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                      >
                        <span className="font-bold text-slate-700 min-w-[90px]">
                          {ch.field}:
                        </span>
                        <div className="flex items-center gap-2 flex-1 justify-end flex-wrap">
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-medium line-through">
                            {ch.oldValue || '—'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                            {ch.newValue || '—'}
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
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
