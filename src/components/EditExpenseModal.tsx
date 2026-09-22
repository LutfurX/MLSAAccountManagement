import React, { useState, useEffect, useRef } from 'react';
import { 
  Pencil, 
  Receipt, 
  Calendar, 
  Tag, 
  DollarSign, 
  Upload, 
  Image as ImageIcon, 
  X,
  History,
  FileText
} from 'lucide-react';
import { SchoolExpense, ExpenseEditHistoryItem } from '../types';
import { 
  formatCurrency, 
  formatBanglaDate, 
  generateId 
} from '../utils/formatters';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: SchoolExpense | null;
  onSave: (updatedExpense: SchoolExpense) => void;
}

const PRESET_CATEGORIES = [
  'অফিস খরচ',
  'আপ্যায়ন',
  'মোবাইল বিল',
  'বিদ্যুৎ বিল',
  'অন্যান্য',
];

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  onSave,
}) => {
  const [date, setDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('অফিস খরচ');
  const [customCategory, setCustomCategory] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidFrom, setPaidFrom] = useState<'ক্যাশ ফান্ড' | 'ব্যাংক অ্যাকাউন্ট'>('ক্যাশ ফান্ড');
  const [paidTo, setPaidTo] = useState('');
  const [notes, setNotes] = useState('');
  const [voucherImage, setVoucherImage] = useState<string>('');
  const [reason, setReason] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (expense) {
      setDate(expense.date || '');
      setTitle(expense.title || '');
      setAmount(String(expense.amount || ''));
      setPaidFrom(expense.paidFrom || 'ক্যাশ ফান্ড');
      setPaidTo(expense.paidTo || '');
      setNotes(expense.notes || '');
      setVoucherImage(expense.voucherImage || '');
      setReason('');

      if (PRESET_CATEGORIES.includes(expense.category)) {
        setSelectedCategory(expense.category);
        setCustomCategory('');
      } else {
        setSelectedCategory('অন্যান্য');
        setCustomCategory(expense.category);
      }
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ফাইলের সাইজ সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারবে');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setVoucherImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setVoucherImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('সঠিক খরচের পরিমাণ লিখুন');
      return;
    }

    if (!title.trim()) {
      alert('খরচের বিবরণ লিখুন');
      return;
    }

    let finalCategory = selectedCategory;
    if (selectedCategory === 'অন্যান্য') {
      finalCategory = customCategory.trim() || 'অন্যান্য';
    }

    // Determine what changed
    const changes: ExpenseEditHistoryItem['changes'] = [];

    if (expense.date !== date) {
      changes.push({
        field: 'তারিখ',
        oldValue: formatBanglaDate(expense.date),
        newValue: formatBanglaDate(date),
      });
    }

    if (expense.category !== finalCategory) {
      changes.push({
        field: 'ক্যাটাগরি',
        oldValue: expense.category,
        newValue: finalCategory,
      });
    }

    if (expense.title.trim() !== title.trim()) {
      changes.push({
        field: 'খরচের বিবরণ',
        oldValue: expense.title,
        newValue: title.trim(),
      });
    }

    if (expense.amount !== numAmount) {
      changes.push({
        field: 'পরিমাণ',
        oldValue: formatCurrency(expense.amount),
        newValue: formatCurrency(numAmount),
      });
    }

    const oldPaidFrom = expense.paidFrom || 'ক্যাশ ফান্ড';
    if (oldPaidFrom !== paidFrom) {
      changes.push({
        field: 'পরিশোধের মাধ্যম',
        oldValue: oldPaidFrom,
        newValue: paidFrom,
      });
    }

    const oldNotes = expense.notes || '';
    if (oldNotes.trim() !== notes.trim()) {
      changes.push({
        field: 'মন্তব্য / নোট',
        oldValue: oldNotes || '—',
        newValue: notes.trim() || '—',
      });
    }

    const hadOldImage = Boolean(expense.voucherImage);
    const hasNewImage = Boolean(voucherImage);
    if (!hadOldImage && hasNewImage) {
      changes.push({
        field: 'ভাউচার কপি',
        oldValue: 'সংযুক্ত ছিল না',
        newValue: 'নতুন ভাউচার ছবি সংযুক্ত',
      });
    } else if (hadOldImage && !hasNewImage) {
      changes.push({
        field: 'ভাউচার কপি',
        oldValue: 'ভাউচার সংযুক্ত ছিল',
        newValue: 'ভাউচার ছবি অপসারিত',
      });
    } else if (hadOldImage && hasNewImage && expense.voucherImage !== voucherImage) {
      changes.push({
        field: 'ভাউচার কপি',
        oldValue: 'পূর্বের ছবি',
        newValue: 'নতুন ছবি প্রতিস্থাপন করা হয়েছে',
      });
    }

    let updatedHistory = expense.editHistory || [];

    if (changes.length > 0) {
      const historyItem: ExpenseEditHistoryItem = {
        id: generateId(),
        editedAt: new Date().toISOString(),
        reason: reason.trim() || undefined,
        changes,
      };
      updatedHistory = [historyItem, ...updatedHistory];
    }

    const updatedExpense: SchoolExpense = {
      ...expense,
      date,
      category: finalCategory,
      title: title.trim(),
      amount: numAmount,
      paidFrom,
      paidTo: paidTo.trim() || undefined,
      notes: notes.trim() || undefined,
      voucherImage: voucherImage || undefined,
      editHistory: updatedHistory,
    };

    onSave(updatedExpense);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full my-auto shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-pink-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white/20">
              <Pencil className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">খরচের তথ্য সংশোধন / এডিট</h3>
              <p className="text-xs text-rose-100">
                ভাউচার ও ব্যয়ের তথ্য হালনাগাদ করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-rose-100 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Current info notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800">খরচের শিরোনাম:</span> {expense.title}
            </div>
            <div className="font-mono text-rose-700 font-bold">
              {formatCurrency(expense.amount)}
            </div>
          </div>

          {/* Date & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                খরচের তারিখ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-rose-600" />
                টাকার পরিমাণ (৳) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="যেমন: ৫০০"
                className="w-full px-3 py-2 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-rose-600" />
              খরচের ক্যাটাগরি <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {selectedCategory === 'অন্যান্য' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="নতুন ক্যাটাগরির নাম লিখুন..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            )}
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-rose-600" />
              খরচের বিবরণ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: অফিস খাতা ও কলম ক্রয়, আপ্যায়ন..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          {/* Paid From & Paid To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পরিশোধের মাধ্যম
              </label>
              <select
                value={paidFrom}
                onChange={(e) => setPaidFrom(e.target.value as 'ক্যাশ ফান্ড' | 'ব্যাংক অ্যাকাউন্ট')}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                <option value="ক্যাশ ফান্ড">ক্যাশ ফান্ড</option>
                <option value="ব্যাংক অ্যাকাউন্ট">ব্যাংক অ্যাকাউন্ট</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                প্রাপক / দোকান (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="যেমন: সততা স্টেশনারি"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              অতিরিক্ত মন্তব্য (ঐচ্ছিক)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="প্রয়োজনে অতিরিক্ত নোট বা রেফারেন্স লিখুন..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Voucher Image Upload / Change */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                ভাউচার বা বিলের ছবি
              </span>
              {voucherImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  ছবি মুছে ফেলুন
                </button>
              )}
            </label>

            {voucherImage ? (
              <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center gap-3">
                <img
                  src={voucherImage}
                  alt="ভাউচার প্রিভিউ"
                  className="w-16 h-16 object-cover rounded-lg border border-slate-300 shadow-2xs"
                />
                <div className="flex-1 text-xs">
                  <p className="font-bold text-slate-800">ভাউচার ছবি সংযুক্ত আছে</p>
                  <p className="text-slate-500">পরিবর্তন করতে নিচে ক্লিক করুন</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 text-rose-600 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    নতুন ছবি নির্বাচন করুন
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-rose-400 bg-slate-50/50 hover:bg-rose-50/30 rounded-xl p-4 text-center cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                <span className="text-xs text-slate-600 font-medium block">
                  ভাউচার ছবি আপলোড করতে ক্লিক করুন
                </span>
                <span className="text-[10px] text-slate-400">সর্বোচ্চ ৫ মেগাবাইট (JPG, PNG)</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Edit Reason (Optional) */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-600" />
              সংশোধনের কারণ (হিস্ট্রিতে সংরক্ষণের জন্য, ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="যেমন: টাকার পরিমাণ ভুল হয়েছিল / বিলের তারিখ সংশোধন"
              className="w-full px-3 py-2 text-xs bg-amber-50/50 border border-amber-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
            >
              আপডেট সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
