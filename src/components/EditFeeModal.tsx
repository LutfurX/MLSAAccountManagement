import React, { useState, useEffect } from 'react';
import { 
  Pencil, 
  Wallet, 
  Calendar, 
  User, 
  DollarSign, 
  FileText, 
  X,
  History
} from 'lucide-react';
import { StudentFee, FeeEditHistoryItem } from '../types';
import { 
  formatCurrency, 
  formatBanglaDate, 
  generateId 
} from '../utils/formatters';

interface EditFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  fee: StudentFee | null;
  onSave: (updatedFee: StudentFee) => void;
}

export const EditFeeModal: React.FC<EditFeeModalProps> = ({
  isOpen,
  onClose,
  fee,
  onSave,
}) => {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [collectorName, setCollectorName] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (fee) {
      setDate(fee.date || '');
      setAmount(String(fee.amount || ''));
      setCollectorName(fee.collectorName || fee.collectedBy || fee.studentName || '');
      setReceivedBy(fee.receivedBy || 'অফিস');
      setNotes(fee.notes || '');
      setReason('');
    }
  }, [fee]);

  if (!isOpen || !fee) return null;

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

    // Determine what changed
    const changes: FeeEditHistoryItem['changes'] = [];

    const oldCollector = fee.collectorName || fee.collectedBy || fee.studentName || '';
    const oldReceiver = fee.receivedBy || 'অফিস';
    const oldNotes = fee.notes || '';

    if (fee.date !== date) {
      changes.push({
        field: 'তারিখ',
        oldValue: formatBanglaDate(fee.date),
        newValue: formatBanglaDate(date),
      });
    }

    if (fee.amount !== numAmount) {
      changes.push({
        field: 'পরিমাণ',
        oldValue: formatCurrency(fee.amount),
        newValue: formatCurrency(numAmount),
      });
    }

    if (oldCollector.trim() !== collectorName.trim()) {
      changes.push({
        field: 'আদায়কারী',
        oldValue: oldCollector || '—',
        newValue: collectorName.trim(),
      });
    }

    if (oldReceiver.trim() !== receivedBy.trim()) {
      changes.push({
        field: 'গ্রহণকারী',
        oldValue: oldReceiver || '—',
        newValue: receivedBy.trim(),
      });
    }

    if (oldNotes.trim() !== notes.trim()) {
      changes.push({
        field: 'বিবরণ / মন্তব্য',
        oldValue: oldNotes || '—',
        newValue: notes.trim() || '—',
      });
    }

    let updatedHistory = fee.editHistory || [];

    if (changes.length > 0) {
      const historyItem: FeeEditHistoryItem = {
        id: generateId(),
        editedAt: new Date().toISOString(),
        reason: reason.trim() || undefined,
        changes,
      };
      updatedHistory = [historyItem, ...updatedHistory];
    }

    const updatedFee: StudentFee = {
      ...fee,
      date,
      amount: numAmount,
      collectorName: collectorName.trim(),
      receivedBy: receivedBy.trim(),
      collectedBy: collectorName.trim(),
      notes: notes.trim(),
      editHistory: updatedHistory,
    };

    onSave(updatedFee);
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
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                ফি কালেকশন তথ্য এডিট করুন
              </h3>
              <p className="text-xs text-slate-500">
                রসিদ নং: <span className="font-mono font-semibold">{fee.receiptNo}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-5 overflow-y-auto flex-1 space-y-4 overscroll-contain">
            {/* তারিখ */}
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
                className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* পরিমাণ */}
            <div>
              <label className="block text-xs font-semibold text-blue-800 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-blue-600" />
                পরিমাণ (টাকা) *
              </label>
              <input
                type="number"
                placeholder="যেমন: ১০০০"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                required
                className="w-full px-3.5 py-2.5 text-lg font-bold text-blue-700 bg-blue-50/40 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* আদায়কারী */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                আদায়কারী *
              </label>
              <input
                type="text"
                placeholder="যিনি টাকা তুলেছেন তার নাম"
                value={collectorName}
                onChange={(e) => setCollectorName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* গ্রহণকারী */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                গ্রহণকারী *
              </label>
              <input
                type="text"
                placeholder="যিনি টাকা গ্রহণ করেছেন"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* বিবরণ / মন্তব্য */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                বিবরণ / মন্তব্য (ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="ফি এর অতিরিক্ত বিবরণ বা নোট..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* এডিটের কারণ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <History className="w-4 h-4 text-amber-500" />
                সংশোধনের কারণ (ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="যেমন: টাকার পরিমাণ ভুল হয়েছিল / তারিখ সংশোধন"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2 text-base sm:text-sm bg-amber-50/30 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer Actions */}
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
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Pencil className="w-4 h-4" />
              আপডেট সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
