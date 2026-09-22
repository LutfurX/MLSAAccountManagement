import React from 'react';
import { Printer, Download, X, CheckCircle, GraduationCap } from 'lucide-react';
import { StudentFee } from '../types';
import { 
  formatCurrency, 
  formatBanglaDate, 
  SCHOOL_INFO, 
  toBanglaDigits 
} from '../utils/formatters';

interface ReceiptModalProps {
  fee: StudentFee | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ fee, onClose }) => {
  if (!fee) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[92vh] overflow-y-auto print:border-none print:shadow-none print:w-full print:max-w-none print:max-h-none print:overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            টাকা আদায়ের অফিসিয়াল রসিদ
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              প্রিন্ট করুন
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="mt-4 border-2 border-slate-800 p-6 rounded-xl bg-amber-50/20 relative">
          
          {/* Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4">
            <div className="flex items-center justify-center gap-3">
              <img
                src="/school_logo.jpg"
                alt="School Logo"
                className="w-16 h-16 object-contain rounded-full"
                referrerPolicy="no-referrer"
              />
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {SCHOOL_INFO.name}
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  {SCHOOL_INFO.address} • স্থাপিত: {SCHOOL_INFO.established}
                </p>
                <div className="inline-block mt-1 px-4 py-0.5 bg-slate-900 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                  টাকা জমার মানি রসিদ (Student Fee Receipt)
                </div>
              </div>
            </div>
          </div>

          {/* Meta details */}
          <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-700 mt-4 py-2 border-b border-dashed border-slate-300">
            <div>
              <span className="text-slate-500">রসিদ নং: </span>
              <strong className="font-mono text-slate-900">{fee.receiptNo}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500">তারিখ: </span>
              <strong className="text-slate-900">{formatBanglaDate(fee.date)}</strong>
            </div>
          </div>

          {/* Details */}
          <div className="my-4 space-y-2.5 text-sm">
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-1.5">
              <div>
                <span className="text-slate-600">আদায়কারী: </span>
                <strong className="text-slate-900 text-base">{fee.collectorName || fee.collectedBy || fee.studentName || '—'}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-600">গ্রহণকারী: </span>
                <strong className="text-slate-900 text-base">{fee.receivedBy || 'অফিস'}</strong>
              </div>
            </div>

            {fee.notes && (
              <div className="border-b border-slate-100 pb-1.5">
                <span className="text-slate-600">বিবরণ / মন্তব্য: </span>
                <span className="font-medium text-slate-800">{fee.notes}</span>
              </div>
            )}
          </div>

          {/* Total Amount Box */}
          <div className="my-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
            <span className="text-sm font-bold text-emerald-900">মোট আদায়কৃত টাকা:</span>
            <span className="text-2xl font-black text-emerald-700">
              {formatCurrency(fee.amount)}
            </span>
          </div>

          {/* Signature Area */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs font-semibold text-slate-700">
            <div>
              <div className="border-t border-slate-400 pt-1 w-36 mx-auto">
                <div className="font-bold text-slate-900">{fee.collectorName || fee.collectedBy || '—'}</div>
                <span className="text-[11px] text-slate-500 font-normal">আদায়কারী</span>
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 w-36 mx-auto">
                <div className="font-bold text-slate-900">{fee.receivedBy || 'অফিস / ক্যাশিয়ার'}</div>
                <span className="text-[11px] text-slate-500 font-normal">গ্রহণকারী</span>
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 mt-5">
            কম্পিউটার জেনারেটেড রসিদ • মোগলগাঁও লিটল স্টার একাডেমি, সিলেট
          </div>
        </div>
      </div>
    </div>
  );
};
