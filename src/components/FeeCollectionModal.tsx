import React, { useState } from 'react';
import { 
  Plus, 
  Wallet, 
  Calendar, 
  User, 
  DollarSign 
} from 'lucide-react';
import { StudentFee } from '../types';
import { 
  getTodayDateString, 
  generateId, 
  generateReceiptNo, 
  BANGLA_MONTHS, 
  toBanglaDigits 
} from '../utils/formatters';

interface FeeCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFee: (fee: StudentFee) => void;
  initialDate?: string;
}

export const FeeCollectionModal: React.FC<FeeCollectionModalProps> = ({
  isOpen,
  onClose,
  onAddFee,
  initialDate,
}) => {
  const [date, setDate] = useState(initialDate || getTodayDateString());
  const [amount, setAmount] = useState('');
  const [collectorName, setCollectorName] = useState('অফিস সহকারী'); // আদায়কারী
  const [receivedBy, setReceivedBy] = useState('অধ্যক্ষ / হিসাব শাখা'); // গ্রহণকারী
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('সঠিক টাকার পরিমাণ লিখুন');
      return;
    }

    if (!collectorName.trim()) {
      alert('আদায়কারীর নাম লিখুন');
      return;
    }

    if (!receivedBy.trim()) {
      alert('টাকা গ্রহণকারীর নাম লিখুন');
      return;
    }

    const now = new Date();
    const currentMonthName = BANGLA_MONTHS[now.getMonth()];
    const currentYear = now.getFullYear();

    const newFee: StudentFee = {
      id: generateId(),
      date,
      studentName: collectorName.trim(), // fallback
      studentClass: '৫ম শ্রেণি',
      rollNo: '—',
      feeType: 'মাসিক বেতন',
      targetMonth: `${currentMonthName} ${toBanglaDigits(currentYear)}`,
      amount: numAmount,
      receiptNo: generateReceiptNo('REC'),
      paymentMethod: 'নগদ ক্যাশ',
      collectorName: collectorName.trim(),
      receivedBy: receivedBy.trim(),
      collectedBy: collectorName.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onAddFee(newFee);
    // Reset fields
    setAmount('');
    setNotes('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-md w-full my-auto shadow-2xl border border-slate-200 flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug truncate">
                বেতন কালেকশন ফরম
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                মোগলগাঁও লিটল স্টার একাডেমি • দৈনিক আদায় ও রসিদ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg cursor-pointer shrink-0 ml-2"
            title="বন্ধ করুন"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-5 overflow-y-auto flex-1 space-y-4 overscroll-contain">
            
            {/* ১. তারিখ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                তারিখ *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* ২. পরিমাণ */}
            <div>
              <label className="block text-xs font-semibold text-emerald-800 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                পরিমাণ (টাকা) *
              </label>
              <input
                type="number"
                placeholder="টাকার পরিমাণ লিখুন (যেমন: ১০০০)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                required
                className="w-full px-3.5 py-2.5 text-lg font-bold text-emerald-700 bg-emerald-50/50 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* ৩. আদায়কারী */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                আদায়কারী *
              </label>
              <input
                type="text"
                placeholder="যিনি টাকা তুলেছেন / আদায়কারীর নাম"
                value={collectorName}
                onChange={(e) => setCollectorName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* ৪. গ্রহণকারী */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                গ্রহণকারী *
              </label>
              <input
                type="text"
                placeholder="যিনি টাকা গ্রহণ করেছেন / গ্রহণকারীর নাম"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* ৫. বিবরণ / মন্তব্য (ঐচ্ছিক) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                বিবরণ / মন্তব্য (ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="প্রয়োজনে শিক্ষার্থীর নাম বা অতিরিক্ত বিবরণ..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 p-4 border-t border-slate-100 bg-slate-50/90 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
